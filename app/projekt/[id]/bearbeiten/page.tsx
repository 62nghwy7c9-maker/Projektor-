import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import {
  einladungErneuern,
  projektLoeschen,
  projektSpeichern,
} from "@/app/projekt/actions";
import ProjektFormularFelder from "@/components/ProjektFormularFelder";
import { Fehler, Hinweis } from "@/components/Hinweis";

export const metadata = { title: "Projekt bearbeiten — Projector" };

export default async function ProjektBearbeitenSeite({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fehler?: string; hinweis?: string }>;
}) {
  const { id } = await params;
  const { fehler, hinweis } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const { data: projekt } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();
  if (!projekt) notFound();
  if (projekt.host_id !== user.id) redirect(`/projekt/${id}`);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projekt bearbeiten</h1>
        <Link href={`/projekt/${id}`} className="text-sm underline">
          Zur Projektseite
        </Link>
      </div>
      <Fehler code={fehler} />
      <Hinweis code={hinweis} />

      <form action={projektSpeichern} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={projekt.id} />
        <ProjektFormularFelder projekt={projekt} />
        {projekt.phase === "laufend" && (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="ideen_geschlossen"
              defaultChecked={projekt.ideas_closed}
              className="mt-0.5"
            />
            <span>
              <strong>Ideen-Bereich schließen</strong> — Besucher können keine
              neuen Ideen mehr posten.
            </span>
          </label>
        )}
        <button type="submit" className="btn-primary self-start">
          Speichern
        </button>
      </form>

      <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <h2 className="font-semibold">Einladungslink</h2>
        <p className="text-sm text-muted">
          {projekt.visibility === "private"
            ? "Wer diesem Link mit einem Konto folgt, wird Mitglied deines privaten Projekts."
            : "Auch bei öffentlichen Projekten können Personen über diesen Link direkt Mitglied werden."}
        </p>
        <code className="break-all rounded-lg border border-border bg-accent/5 px-3 py-2 text-xs">
          {`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/projekt/beitreten/${projekt.invite_token}`}
        </code>
        <form action={einladungErneuern}>
          <input type="hidden" name="id" value={projekt.id} />
          <button type="submit" className="btn">
            Link erneuern (alter Link wird ungültig)
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-red-500/50 p-4">
        <h2 className="font-semibold">Projekt löschen</h2>
        <p className="text-sm text-muted">
          Löscht das Projekt mit allen Ideen, Antworten und Updates.
          Das lässt sich nicht rückgängig machen.
        </p>
        <form action={projektLoeschen}>
          <input type="hidden" name="id" value={projekt.id} />
          <button
            type="submit"
            className="btn border-red-500/50 text-red-600 dark:text-red-400"
          >
            Projekt endgültig löschen
          </button>
        </form>
      </section>
    </div>
  );
}
