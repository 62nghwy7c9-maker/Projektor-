#!/usr/bin/env node
// Automatisierter RLS-Check (Schritt 5): prüft die Zugriffsrechte live gegen
// Supabase. Belegt u. a.: Fremde sehen private Projekte nicht und können sie
// nicht ändern; öffentliche Projekte sind ohne Login lesbar; Doppel-Votes und
// mehr als 5 Ideen/Minute werden abgelehnt.
//
// Voraussetzungen:
//   1. Migration supabase/migrations/0001_init.sql ist eingespielt.
//   2. Zwei BESTÄTIGTE Testkonten existieren (Supabase-Dashboard →
//      Authentication → Add user → "Auto Confirm User").
//   3. .env.local ist gesetzt; Zugangsdaten der Testkonten als Env-Variablen:
//        TEST_A_EMAIL, TEST_A_PASSWORT, TEST_B_EMAIL, TEST_B_PASSWORT
//
// Aufruf:  TEST_A_EMAIL=… TEST_A_PASSWORT=… TEST_B_EMAIL=… TEST_B_PASSWORT=… \
//            node scripts/rls-check.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// .env.local einlesen (ohne Zusatz-Abhängigkeit).
try {
  for (const zeile of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = zeile.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* .env.local optional, wenn Variablen schon gesetzt sind */
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const A = { email: process.env.TEST_A_EMAIL, passwort: process.env.TEST_A_PASSWORT };
const B = { email: process.env.TEST_B_EMAIL, passwort: process.env.TEST_B_PASSWORT };

if (!URL_ || !KEY || !A.email || !A.passwort || !B.email || !B.passwort) {
  console.error("❌ Es fehlen Env-Variablen (Supabase-URL/Key oder TEST_A_*/TEST_B_*).");
  process.exit(2);
}

let bestanden = 0;
let fehlgeschlagen = 0;
function check(name, ok, detail = "") {
  if (ok) {
    bestanden++;
    console.log(`✅ ${name}`);
  } else {
    fehlgeschlagen++;
    console.log(`❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function neuerClient() {
  return createClient(URL_, KEY, { auth: { persistSession: false } });
}

async function anmelden(konto) {
  const client = neuerClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: konto.email,
    password: konto.passwort,
  });
  if (error) {
    console.error(`❌ Anmeldung für ${konto.email} fehlgeschlagen: ${error.message}`);
    process.exit(2);
  }
  return { client, userId: data.user.id };
}

const anon = neuerClient();
const a = await anmelden(A);
const b = await anmelden(B);
console.log(`→ Angemeldet: A=${A.email}, B=${B.email}\n`);

// --- Vorbereitung: A legt ein öffentliches und ein privates Projekt an -----
const { data: oeffentlich, error: fehlerOeff } = await a.client
  .from("projects")
  .insert({ host_id: a.userId, title: "RLS-Check öffentlich", category: "technik", visibility: "public" })
  .select()
  .single();
const { data: privat, error: fehlerPriv } = await a.client
  .from("projects")
  .insert({ host_id: a.userId, title: "RLS-Check privat", category: "technik", visibility: "private" })
  .select()
  .single();
check("A kann Projekte anlegen (öffentlich + privat)", !fehlerOeff && !fehlerPriv,
  fehlerOeff?.message ?? fehlerPriv?.message);
if (!oeffentlich || !privat) process.exit(1);

try {
  // --- Sichtbarkeit -----------------------------------------------------------
  const { data: anonSieht } = await anon.from("projects").select("id").eq("id", oeffentlich.id);
  check("Öffentliches Projekt ist ohne Login lesbar", anonSieht?.length === 1);

  const { data: anonPrivat } = await anon.from("projects").select("id").eq("id", privat.id);
  check("Privates Projekt ist ohne Login unsichtbar", anonPrivat?.length === 0);

  const { data: bPrivat } = await b.client.from("projects").select("id").eq("id", privat.id);
  check("Privates Projekt ist für Fremdkonto B unsichtbar", bPrivat?.length === 0);

  // --- Schreibrechte ----------------------------------------------------------
  const { data: bUpdate } = await b.client
    .from("projects")
    .update({ title: "gekapert" })
    .eq("id", oeffentlich.id)
    .select();
  check("B kann A's Projekt nicht ändern (0 Zeilen betroffen)", (bUpdate ?? []).length === 0);

  const { error: bInsertFremd } = await b.client
    .from("projects")
    .insert({ host_id: a.userId, title: "gefälscht", category: "technik" });
  check("B kann kein Projekt mit fremder host_id anlegen", !!bInsertFremd);

  const { error: bIdeePrivat } = await b.client
    .from("ideas")
    .insert({ project_id: privat.id, author_id: b.userId, body: "sollte scheitern" });
  check("B kann nicht ins private Projekt posten", !!bIdeePrivat);

  // --- Ideen, Votes, Antworten ------------------------------------------------
  const { data: idee, error: ideeFehler } = await b.client
    .from("ideas")
    .insert({ project_id: oeffentlich.id, author_id: b.userId, body: "Idee von B" })
    .select()
    .single();
  check("B kann Idee im öffentlichen Projekt posten", !ideeFehler, ideeFehler?.message);

  if (idee) {
    const { error: vote1 } = await a.client
      .from("idea_votes")
      .insert({ idea_id: idee.id, user_id: a.userId });
    const { error: vote2 } = await a.client
      .from("idea_votes")
      .insert({ idea_id: idee.id, user_id: a.userId });
    check("Erster Vote klappt, Doppel-Vote wird abgelehnt", !vote1 && !!vote2, vote1?.message);

    const { data: fremdEdit } = await a.client
      .from("ideas")
      .update({ body: "von A überschrieben" })
      .eq("id", idee.id)
      .select();
    check("A (Host) kann B's Ideentext nicht heimlich ändern — nur moderieren",
      (fremdEdit ?? []).length === 0 || fremdEdit?.[0]?.body === "Idee von B");

    const { error: sternFremd } = await b.client.rpc("set_idea_starred", {
      p_idea_id: idee.id,
      p_starred: true,
    });
    check("Nicht-Host kann keinen Stern setzen", !!sternFremd);

    const { error: sternHost } = await a.client.rpc("set_idea_starred", {
      p_idea_id: idee.id,
      p_starred: true,
    });
    check("Host kann Stern setzen", !sternHost, sternHost?.message);
  }

  // --- Rate-Limit (max. 5 Ideen/Minute) ----------------------------------------
  let rateLimitGriff = false;
  let ersteFuenf = true;
  for (let i = 1; i <= 6; i++) {
    const { error } = await a.client
      .from("ideas")
      .insert({ project_id: oeffentlich.id, author_id: a.userId, body: `Spam-Test ${i}` });
    if (i <= 5 && error) ersteFuenf = false;
    if (i === 6 && error) rateLimitGriff = true;
  }
  check("Rate-Limit: 5 Ideen gehen durch, die 6. wird abgelehnt", ersteFuenf && rateLimitGriff);

  // --- Einladungslink -----------------------------------------------------------
  const { data: token } = await a.client
    .from("projects")
    .select("invite_token")
    .eq("id", privat.id)
    .single();
  const { error: beitritt } = await b.client.rpc("join_via_invite", {
    p_token: token?.invite_token,
  });
  const { data: bSiehtJetzt } = await b.client.from("projects").select("id").eq("id", privat.id);
  check("B tritt per Einladungslink bei und sieht das private Projekt",
    !beitritt && bSiehtJetzt?.length === 1, beitritt?.message);

  const { error: tokenNeuFremd } = await b.client.rpc("regenerate_invite_token", {
    p_project_id: privat.id,
  });
  check("Nicht-Host kann den Einladungslink nicht erneuern", !!tokenNeuFremd);
} finally {
  // --- Aufräumen ----------------------------------------------------------------
  await a.client.from("projects").delete().eq("id", oeffentlich.id);
  await a.client.from("projects").delete().eq("id", privat.id);
  console.log("\n→ Testprojekte wieder gelöscht.");
}

console.log(`\nErgebnis: ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen.`);
process.exit(fehlgeschlagen === 0 ? 0 : 1);
