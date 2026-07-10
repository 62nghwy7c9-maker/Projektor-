import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Kategorie, Phase, Project } from "@/lib/types";
import { KATEGORIEN, PHASEN } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import EmptyState from "@/components/EmptyState";
import { Hinweis } from "@/components/Hinweis";

const PHASEN_REIHENFOLGE: Phase[] = ["brainstorming", "laufend", "fertig"];

function filterUrl(phase: Phase, kategorie?: string, q?: string): string {
  const p = new URLSearchParams();
  if (phase !== "brainstorming") p.set("phase", phase);
  if (kategorie) p.set("kategorie", kategorie);
  if (q) p.set("q", q);
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

export default async function EntdeckenSeite({
  searchParams,
}: {
  searchParams: Promise<{
    phase?: string;
    kategorie?: string;
    q?: string;
    hinweis?: string;
  }>;
}) {
  const sp = await searchParams;
  const phase: Phase = PHASEN_REIHENFOLGE.includes(sp.phase as Phase)
    ? (sp.phase as Phase)
    : "brainstorming";
  const kategorie =
    sp.kategorie && sp.kategorie in KATEGORIEN
      ? (sp.kategorie as Kategorie)
      : undefined;
  const suche = (sp.q ?? "").trim().slice(0, 100);

  const supabase = await createClient();
  let abfrage = supabase
    .from("projects")
    .select("*")
    .eq("visibility", "public") // private Projekte erscheinen hier nie
    .eq("is_hidden", false)
    .eq("phase", phase)
    .order("last_activity_at", { ascending: false })
    .limit(60);
  if (kategorie) abfrage = abfrage.eq("category", kategorie);
  if (suche) abfrage = abfrage.ilike("title", `%${suche}%`);
  const { data, error } = await abfrage;
  const projekte = (data ?? []) as Project[];

  return (
    <div className="flex flex-col gap-6 py-6">
      <Hinweis code={sp.hinweis} />
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Projekte entdecken
        </h1>
        <p className="text-sm text-muted">
          Starte deine Idee, brainstorme mit anderen und setzt sie gemeinsam
          um.
        </p>
      </section>

      {/* Phasen-Reiter */}
      <nav
        aria-label="Phasen"
        className="flex gap-1 overflow-x-auto rounded-xl border border-border p-1"
      >
        {PHASEN_REIHENFOLGE.map((p) => (
          <Link
            key={p}
            href={filterUrl(p, kategorie, suche)}
            aria-current={p === phase ? "page" : undefined}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-center text-sm font-medium ${
              p === phase ? "bg-accent text-white" : "hover:bg-accent/10"
            }`}
          >
            {PHASEN[p].emoji} {PHASEN[p].label}
          </Link>
        ))}
      </nav>

      {/* Kategorie-Filter + Suche */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={filterUrl(phase, undefined, suche)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !kategorie ? "border-accent bg-accent/10" : "border-border hover:border-accent"
          }`}
        >
          Alle
        </Link>
        {Object.entries(KATEGORIEN).map(([wert, label]) => (
          <Link
            key={wert}
            href={filterUrl(phase, wert, suche)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              kategorie === wert
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent"
            }`}
          >
            {label}
          </Link>
        ))}
        <form action="/" className="ml-auto flex w-full gap-2 sm:w-auto">
          {phase !== "brainstorming" && (
            <input type="hidden" name="phase" value={phase} />
          )}
          {kategorie && (
            <input type="hidden" name="kategorie" value={kategorie} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={suche}
            placeholder="Titel suchen …"
            className="input sm:w-56"
            aria-label="Projekte nach Titel suchen"
          />
          <button type="submit" className="btn shrink-0">
            Suchen
          </button>
        </form>
      </div>

      {/* Ergebnisliste */}
      {error ? (
        <EmptyState
          emoji="⚠️"
          titel="Projekte konnten nicht geladen werden"
          text="Bitte versuche es gleich noch einmal."
        />
      ) : projekte.length === 0 ? (
        <EmptyState
          titel={
            suche || kategorie
              ? "Nichts gefunden"
              : `Noch keine Projekte in „${PHASEN[phase].label}"`
          }
          text={
            suche || kategorie
              ? "Versuch es mit einem anderen Suchbegriff oder Filter."
              : "Sei die erste Person, die hier ein Projekt startet!"
          }
        >
          <Link href="/projekt/neu" className="btn-primary mt-2">
            Projekt starten
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projekte.map((projekt) => (
            <ProjectCard key={projekt.id} projekt={projekt} />
          ))}
        </div>
      )}
    </div>
  );
}
