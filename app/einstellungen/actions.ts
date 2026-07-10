"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function profilSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();
  const skills = String(formData.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 15);

  if (!name) redirect("/einstellungen?fehler=felder-fehlen");
  if (name.length > 80 || bio.length > 500) {
    redirect("/einstellungen?fehler=zu-lang");
  }
  if (avatarUrl && !avatarUrl.startsWith("https://")) {
    redirect("/einstellungen?fehler=avatar-url");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: name,
      bio,
      avatar_url: avatarUrl || null,
      skills,
    })
    .eq("id", user.id);
  if (error) redirect("/einstellungen?fehler=unbekannt");

  revalidatePath("/", "layout");
  redirect("/einstellungen?hinweis=gespeichert");
}
