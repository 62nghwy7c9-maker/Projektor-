import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { kontoLoeschen, profilSpeichern } from "./actions";
import { Fehler, Hinweis } from "@/components/Hinweis";

export const metadata = { title: "Einstellungen — Projector" };

export default async function EinstellungenSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string; hinweis?: string }>;
}) {
  const { fehler, hinweis } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const { data: profil } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profil) redirect("/anmelden");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <Link href={`/profil/${user.id}`} className="text-sm underline">
          Profil ansehen
        </Link>
      </div>
      <Fehler code={fehler} />
      <Hinweis code={hinweis} />
      <form action={profilSpeichern} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="label">
            Anzeigename
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={80}
            defaultValue={profil.display_name}
            className="input mt-1"
          />
        </div>
        <div>
          <label htmlFor="bio" className="label">
            Kurz-Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={500}
            defaultValue={profil.bio}
            className="input mt-1"
            placeholder="Wer bist du, was treibt dich an?"
          />
        </div>
        <div>
          <label htmlFor="skills" className="label">
            Skills (durch Komma getrennt)
          </label>
          <input
            id="skills"
            name="skills"
            type="text"
            defaultValue={profil.skills.join(", ")}
            className="input mt-1"
            placeholder="z. B. Design, Python, Fotografie"
          />
        </div>
        <div>
          <label htmlFor="avatar_url" className="label">
            Avatar-Bild-URL (optional, https)
          </label>
          <input
            id="avatar_url"
            name="avatar_url"
            type="url"
            defaultValue={profil.avatar_url ?? ""}
            className="input mt-1"
            placeholder="https://…"
          />
        </div>
        <button type="submit" className="btn-primary self-start">
          Speichern
        </button>
      </form>

      <section className="mt-4 flex flex-col gap-3 rounded-xl border border-red-500/50 p-4">
        <h2 className="font-semibold">Konto löschen</h2>
        <p className="text-sm text-muted">
          Löscht dein Konto dauerhaft — samt Profil, deinen Projekten, Ideen,
          Antworten und Votes. Das lässt sich nicht rückgängig machen. Tippe
          zur Bestätigung <strong>LÖSCHEN</strong> in das Feld.
        </p>
        <form action={kontoLoeschen} className="flex flex-wrap gap-2">
          <input
            type="text"
            name="bestaetigung"
            required
            placeholder="LÖSCHEN"
            aria-label="Bestätigungswort"
            className="input max-w-40"
          />
          <button
            type="submit"
            className="btn border-red-500/50 text-red-600 dark:text-red-400"
          >
            Konto endgültig löschen
          </button>
        </form>
      </section>
    </div>
  );
}
