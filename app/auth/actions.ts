"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function siteOrigin(): Promise<string> {
  const h = await headers();
  return (
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

function authFehlerCode(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered")) return "email-vergeben";
  if (m.includes("password should be at least")) return "passwort-kurz";
  if (m.includes("invalid login credentials")) return "login-fehlgeschlagen";
  if (m.includes("email not confirmed")) return "email-nicht-bestaetigt";
  if (m.includes("is invalid")) return "email-ungueltig";
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "zu-viele-versuche";
  return "unbekannt";
}

export async function registrieren(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const passwort = String(formData.get("passwort") ?? "");
  if (!name || !email || !passwort) {
    redirect("/registrieren?fehler=felder-fehlen");
  }
  if (passwort.length < 8) {
    redirect("/registrieren?fehler=passwort-kurz");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: passwort,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
    },
  });
  if (error) {
    redirect(`/registrieren?fehler=${authFehlerCode(error.message)}`);
  }
  redirect("/anmelden?hinweis=bestaetigen");
}

export async function anmelden(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const passwort = String(formData.get("passwort") ?? "");
  if (!email || !passwort) {
    redirect("/anmelden?fehler=felder-fehlen");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: passwort,
  });
  if (error) {
    redirect(`/anmelden?fehler=${authFehlerCode(error.message)}`);
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function abmelden() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function passwortVergessen(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/passwort-vergessen?fehler=felder-fehlen");
  }

  const supabase = await createClient();
  // Absichtlich immer dieselbe Antwort — verrät nicht, ob die Adresse existiert.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/passwort-neu`,
  });
  redirect("/passwort-vergessen?hinweis=gesendet");
}

export async function passwortNeuSetzen(formData: FormData) {
  const passwort = String(formData.get("passwort") ?? "");
  if (passwort.length < 8) {
    redirect("/passwort-neu?fehler=passwort-kurz");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: passwort });
  if (error) {
    redirect(`/passwort-neu?fehler=${authFehlerCode(error.message)}`);
  }
  revalidatePath("/", "layout");
  redirect("/?hinweis=passwort-geaendert");
}
