"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function nutzerOderLogin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");
  return supabase;
}

// Host blendet Idee/Antwort im eigenen Projekt aus (oder wieder ein).
export async function inhaltAusblenden(formData: FormData) {
  const supabase = await nutzerOderLogin();
  const typ = String(formData.get("typ") ?? ""); // 'idea' | 'reply'
  const zielId = String(formData.get("ziel_id") ?? "");
  const projektId = String(formData.get("projekt_id") ?? "");
  const ausblenden = formData.get("ausblenden") === "ja";
  const pfad = `/projekt/${projektId}`;
  if (!zielId || !projektId) redirect("/");

  const { error } = await supabase.rpc("set_content_hidden", {
    p_type: typ,
    p_id: zielId,
    p_hidden: ausblenden,
  });
  if (error) redirect(`${pfad}?fehler=nicht-berechtigt#ideen`);

  revalidatePath(pfad);
  redirect(`${pfad}#ideen`);
}

// Host blockiert einen Nutzer projektweit (Mitgliedschaft endet mit).
export async function nutzerBlockieren(formData: FormData) {
  const supabase = await nutzerOderLogin();
  const projektId = String(formData.get("projekt_id") ?? "");
  const nutzerId = String(formData.get("nutzer_id") ?? "");
  const zurueck = String(formData.get("zurueck") ?? `/projekt/${projektId}`);
  if (!projektId || !nutzerId) redirect("/");

  const { error } = await supabase.rpc("block_user", {
    p_project_id: projektId,
    p_user_id: nutzerId,
  });
  if (error) redirect(`${zurueck}?fehler=nicht-berechtigt`);

  revalidatePath(`/projekt/${projektId}`);
  redirect(`${zurueck}?hinweis=blockiert`);
}

export async function nutzerEntblocken(formData: FormData) {
  const supabase = await nutzerOderLogin();
  const projektId = String(formData.get("projekt_id") ?? "");
  const nutzerId = String(formData.get("nutzer_id") ?? "");
  const zurueck = `/projekt/${projektId}/bearbeiten`;
  if (!projektId || !nutzerId) redirect("/");

  const { error } = await supabase.rpc("unblock_user", {
    p_project_id: projektId,
    p_user_id: nutzerId,
  });
  if (error) redirect(`${zurueck}?fehler=nicht-berechtigt`);

  revalidatePath(zurueck);
  redirect(`${zurueck}?hinweis=gespeichert`);
}

// Host entfernt ein Mitglied (ohne Blockierung); RLS schützt die Host-Zeile.
export async function mitgliedEntfernen(formData: FormData) {
  const supabase = await nutzerOderLogin();
  const projektId = String(formData.get("projekt_id") ?? "");
  const nutzerId = String(formData.get("nutzer_id") ?? "");
  const zurueck = `/projekt/${projektId}/bearbeiten`;
  if (!projektId || !nutzerId) redirect("/");

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projektId)
    .eq("user_id", nutzerId);
  if (error) redirect(`${zurueck}?fehler=nicht-berechtigt`);

  revalidatePath(zurueck);
  redirect(`${zurueck}?hinweis=gespeichert`);
}
