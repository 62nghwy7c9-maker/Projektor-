"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function beitreten(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const { data: projektId, error } = await supabase.rpc("join_via_invite", {
    p_token: token,
  });
  if (error || !projektId) {
    const m = (error?.message ?? "").toLowerCase();
    const code = m.includes("gesperrt")
      ? "gesperrt"
      : m.includes("blockiert")
        ? "blockiert-vom-host"
        : "link-ungueltig";
    redirect(`/projekt/beitreten/${encodeURIComponent(token)}?fehler=${code}`);
  }

  revalidatePath(`/projekt/${projektId}`);
  redirect(`/projekt/${projektId}?hinweis=beigetreten`);
}
