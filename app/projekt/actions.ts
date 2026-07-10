"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Kategorie, Phase, Sichtbarkeit } from "@/lib/types";

const KATEGORIEN: Kategorie[] = ["technik", "kreatives", "soziales", "business"];
const PHASEN: Phase[] = ["brainstorming", "laufend", "fertig"];
const SICHTBARKEITEN: Sichtbarkeit[] = ["public", "private"];

function felderLesen(formData: FormData) {
  const titel = String(formData.get("titel") ?? "").trim();
  const beschreibung = String(formData.get("beschreibung") ?? "").trim();
  const kategorie = String(formData.get("kategorie") ?? "");
  const sichtbarkeit = String(formData.get("sichtbarkeit") ?? "public");
  const phase = String(formData.get("phase") ?? "brainstorming");
  const coverUrl = String(formData.get("cover_url") ?? "").trim();
  const ideenGeschlossen = formData.get("ideen_geschlossen") === "on";
  return { titel, beschreibung, kategorie, sichtbarkeit, phase, coverUrl, ideenGeschlossen };
}

function felderPruefen(
  f: ReturnType<typeof felderLesen>,
  fehlerPfad: string,
) {
  if (!f.titel) redirect(`${fehlerPfad}?fehler=felder-fehlen`);
  if (f.titel.length > 120 || f.beschreibung.length > 5000) {
    redirect(`${fehlerPfad}?fehler=zu-lang`);
  }
  if (
    !KATEGORIEN.includes(f.kategorie as Kategorie) ||
    !PHASEN.includes(f.phase as Phase) ||
    !SICHTBARKEITEN.includes(f.sichtbarkeit as Sichtbarkeit)
  ) {
    redirect(`${fehlerPfad}?fehler=unbekannt`);
  }
  if (f.coverUrl && !f.coverUrl.startsWith("https://")) {
    redirect(`${fehlerPfad}?fehler=avatar-url`);
  }
}

export async function projektAnlegen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const f = felderLesen(formData);
  felderPruefen(f, "/projekt/neu");

  const { data: projekt, error } = await supabase
    .from("projects")
    .insert({
      host_id: user.id,
      title: f.titel,
      description: f.beschreibung,
      category: f.kategorie,
      visibility: f.sichtbarkeit,
      phase: f.phase,
      cover_url: f.coverUrl || null,
    })
    .select("id")
    .single();
  if (error || !projekt) redirect("/projekt/neu?fehler=unbekannt");

  revalidatePath("/");
  redirect(`/projekt/${projekt.id}`);
}

export async function projektSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/");
  const pfad = `/projekt/${id}/bearbeiten`;

  const f = felderLesen(formData);
  felderPruefen(f, pfad);

  // RLS lässt nur den Host durch (0 betroffene Zeilen für alle anderen).
  const { data: geaendert, error } = await supabase
    .from("projects")
    .update({
      title: f.titel,
      description: f.beschreibung,
      category: f.kategorie,
      visibility: f.sichtbarkeit,
      phase: f.phase,
      cover_url: f.coverUrl || null,
      ideas_closed: f.ideenGeschlossen,
    })
    .eq("id", id)
    .select("id");
  if (error) redirect(`${pfad}?fehler=unbekannt`);
  if (!geaendert || geaendert.length === 0) {
    redirect(`${pfad}?fehler=nicht-berechtigt`);
  }

  revalidatePath("/");
  revalidatePath(`/projekt/${id}`);
  redirect(`/projekt/${id}`);
}

export async function projektLoeschen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) redirect(`/projekt/${id}/bearbeiten?fehler=unbekannt`);

  revalidatePath("/");
  redirect("/?hinweis=projekt-geloescht");
}

export async function einladungErneuern(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/");

  const { error } = await supabase.rpc("regenerate_invite_token", {
    p_project_id: id,
  });
  if (error) {
    redirect(`/projekt/${id}/bearbeiten?fehler=nicht-berechtigt`);
  }
  revalidatePath(`/projekt/${id}/bearbeiten`);
  redirect(`/projekt/${id}/bearbeiten?hinweis=link-erneuert`);
}
