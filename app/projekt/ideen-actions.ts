"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function fehlerCode(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate-limit")) return "rate-limit";
  if (m.includes("row-level security")) return "posten-nicht-moeglich";
  return "unbekannt";
}

async function nutzerOderLogin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");
  return { supabase, user };
}

export async function ideePosten(formData: FormData) {
  const { supabase, user } = await nutzerOderLogin();
  const projektId = String(formData.get("projekt_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const pfad = `/projekt/${projektId}`;

  if (!projektId) redirect("/");
  if (!body) redirect(`${pfad}?fehler=felder-fehlen#ideen`);
  if (body.length > 1000) redirect(`${pfad}?fehler=zu-lang#ideen`);

  const { error } = await supabase.from("ideas").insert({
    project_id: projektId,
    author_id: user.id,
    body,
  });
  if (error) redirect(`${pfad}?fehler=${fehlerCode(error.message)}#ideen`);

  revalidatePath(pfad);
  redirect(`${pfad}#ideen`);
}

export async function ideeBearbeiten(formData: FormData) {
  const { supabase } = await nutzerOderLogin();
  const ideeId = String(formData.get("idee_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const pfad = `/projekt/${projektId}`;

  if (!ideeId || !projektId) redirect("/");
  if (!body) redirect(`${pfad}?fehler=felder-fehlen#idee-${ideeId}`);
  if (body.length > 1000) redirect(`${pfad}?fehler=zu-lang#idee-${ideeId}`);

  // RLS lässt nur den Autor durch.
  const { data: geaendert, error } = await supabase
    .from("ideas")
    .update({ body })
    .eq("id", ideeId)
    .select("id");
  if (error || !geaendert?.length) {
    redirect(`${pfad}?fehler=nicht-berechtigt#idee-${ideeId}`);
  }

  revalidatePath(pfad);
  redirect(`${pfad}#idee-${ideeId}`);
}

export async function ideeLoeschen(formData: FormData) {
  const { supabase } = await nutzerOderLogin();
  const ideeId = String(formData.get("idee_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const pfad = `/projekt/${projektId}`;
  if (!ideeId || !projektId) redirect("/");

  const { error } = await supabase.from("ideas").delete().eq("id", ideeId);
  if (error) redirect(`${pfad}?fehler=unbekannt#ideen`);

  revalidatePath(pfad);
  redirect(`${pfad}#ideen`);
}

export async function voteUmschalten(formData: FormData) {
  const { supabase, user } = await nutzerOderLogin();
  const ideeId = String(formData.get("idee_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const bereitsGevotet = formData.get("gevotet") === "ja";
  const pfad = `/projekt/${projektId}`;
  if (!ideeId || !projektId) redirect("/");

  if (bereitsGevotet) {
    await supabase
      .from("idea_votes")
      .delete()
      .eq("idea_id", ideeId)
      .eq("user_id", user.id);
  } else {
    const { error } = await supabase
      .from("idea_votes")
      .insert({ idea_id: ideeId, user_id: user.id });
    // Doppel-Vote verhindert der Primärschlüssel — Fehler hier still schlucken.
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      redirect(`${pfad}?fehler=posten-nicht-moeglich#idee-${ideeId}`);
    }
  }

  revalidatePath(pfad);
  redirect(`${pfad}#idee-${ideeId}`);
}

export async function antwortPosten(formData: FormData) {
  const { supabase, user } = await nutzerOderLogin();
  const ideeId = String(formData.get("idee_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const pfad = `/projekt/${projektId}`;

  if (!ideeId || !projektId) redirect("/");
  if (!body) redirect(`${pfad}?fehler=felder-fehlen#idee-${ideeId}`);
  if (body.length > 1000) redirect(`${pfad}?fehler=zu-lang#idee-${ideeId}`);

  const { error } = await supabase.from("idea_replies").insert({
    idea_id: ideeId,
    author_id: user.id,
    body,
  });
  if (error) {
    redirect(`${pfad}?fehler=${fehlerCode(error.message)}#idee-${ideeId}`);
  }

  revalidatePath(pfad);
  redirect(`${pfad}#idee-${ideeId}`);
}

export async function antwortLoeschen(formData: FormData) {
  const { supabase } = await nutzerOderLogin();
  const antwortId = String(formData.get("antwort_id") ?? "");
  const ideeId = String(formData.get("idee_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const pfad = `/projekt/${projektId}`;
  if (!antwortId || !projektId) redirect("/");

  const { error } = await supabase
    .from("idea_replies")
    .delete()
    .eq("id", antwortId);
  if (error) redirect(`${pfad}?fehler=unbekannt#idee-${ideeId}`);

  revalidatePath(pfad);
  redirect(`${pfad}#idee-${ideeId}`);
}

export async function sternUmschalten(formData: FormData) {
  const { supabase } = await nutzerOderLogin();
  const ideeId = String(formData.get("idee_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const gestirnt = formData.get("gestirnt") === "ja";
  const pfad = `/projekt/${projektId}`;
  if (!ideeId || !projektId) redirect("/");

  const { error } = await supabase.rpc("set_idea_starred", {
    p_idea_id: ideeId,
    p_starred: !gestirnt,
  });
  if (error) redirect(`${pfad}?fehler=nicht-berechtigt#idee-${ideeId}`);

  revalidatePath(pfad);
  redirect(`${pfad}#idee-${ideeId}`);
}

export async function updatePosten(formData: FormData) {
  const { supabase, user } = await nutzerOderLogin();
  const projektId = String(formData.get("projekt_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const pfad = `/projekt/${projektId}`;

  if (!projektId) redirect("/");
  if (!body) redirect(`${pfad}?fehler=felder-fehlen#updates`);
  if (body.length > 2000) redirect(`${pfad}?fehler=zu-lang#updates`);

  const { error } = await supabase.from("project_updates").insert({
    project_id: projektId,
    author_id: user.id,
    body,
  });
  if (error) redirect(`${pfad}?fehler=nicht-berechtigt#updates`);

  revalidatePath(pfad);
  redirect(`${pfad}#updates`);
}

export async function updateLoeschen(formData: FormData) {
  const { supabase } = await nutzerOderLogin();
  const updateId = String(formData.get("update_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const pfad = `/projekt/${projektId}`;
  if (!updateId || !projektId) redirect("/");

  const { error } = await supabase
    .from("project_updates")
    .delete()
    .eq("id", updateId);
  if (error) redirect(`${pfad}?fehler=unbekannt#updates`);

  revalidatePath(pfad);
  redirect(`${pfad}#updates`);
}
