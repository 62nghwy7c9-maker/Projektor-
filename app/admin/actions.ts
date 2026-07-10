"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");
  return supabase;
}

export async function adminAusblenden(formData: FormData) {
  const supabase = await adminClient();
  const typ = String(formData.get("typ") ?? "");
  const zielId = String(formData.get("ziel_id") ?? "");
  const ausblenden = formData.get("ausblenden") === "ja";

  const { error } = await supabase.rpc("admin_set_hidden", {
    p_type: typ,
    p_id: zielId,
    p_hidden: ausblenden,
  });
  if (error) redirect("/admin?fehler=nicht-berechtigt");
  revalidatePath("/admin");
  redirect("/admin?hinweis=gespeichert");
}

export async function adminSperren(formData: FormData) {
  const supabase = await adminClient();
  const nutzerId = String(formData.get("nutzer_id") ?? "");
  const sperren = formData.get("sperren") === "ja";

  const { error } = await supabase.rpc("admin_ban_user", {
    p_user_id: nutzerId,
    p_banned: sperren,
  });
  if (error) redirect("/admin?fehler=nicht-berechtigt");
  revalidatePath("/admin");
  redirect("/admin?hinweis=gespeichert");
}

export async function adminErledigt(formData: FormData) {
  const supabase = await adminClient();
  const meldungId = String(formData.get("meldung_id") ?? "");
  const erledigt = formData.get("erledigt") !== "nein";

  const { error } = await supabase.rpc("admin_resolve_report", {
    p_report_id: meldungId,
    p_resolved: erledigt,
  });
  if (error) redirect("/admin?fehler=nicht-berechtigt");
  revalidatePath("/admin");
  redirect("/admin");
}
