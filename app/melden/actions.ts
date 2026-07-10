"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MeldungsTyp } from "@/lib/types";

const TYPEN: MeldungsTyp[] = ["project", "idea", "reply", "profile"];

export async function meldungAbsenden(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const typ = String(formData.get("typ") ?? "");
  const zielId = String(formData.get("ziel_id") ?? "");
  const grund = String(formData.get("grund") ?? "").trim();
  let zurueck = String(formData.get("zurueck") ?? "/");
  if (!zurueck.startsWith("/")) zurueck = "/";
  const eigeneQuery = new URLSearchParams({
    typ,
    id: zielId,
    zurueck,
  }).toString();

  if (!TYPEN.includes(typ as MeldungsTyp) || !zielId) redirect("/");
  if (!grund) redirect(`/melden?${eigeneQuery}&fehler=felder-fehlen`);
  if (grund.length > 1000) redirect(`/melden?${eigeneQuery}&fehler=zu-lang`);

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: typ,
    target_id: zielId,
    reason: grund,
  });
  if (error) redirect(`/melden?${eigeneQuery}&fehler=unbekannt`);

  const trenner = zurueck.includes("?") ? "&" : "?";
  redirect(`${zurueck}${trenner}hinweis=gemeldet`);
}
