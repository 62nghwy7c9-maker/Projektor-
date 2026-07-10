import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Project } from "@/lib/types";
import { KATEGORIEN } from "@/lib/types";
import PhaseBadge from "@/components/PhaseBadge";
import Avatar from "@/components/Avatar";
import { Fehler, Hinweis } from "@/components/Hinweis";
import IdeaItem, { type IdeeMitDetails } from "@/components/IdeaItem";
import EmptyState from "@/components/EmptyState";
import { ideePosten } from "@/app/projekt/ideen-actions";

export const metadata = { title: "Projekt — Projector" };

export default async function ProjektSeite({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    hinweis?: string;
    fehler?: string;
    bearbeite?: string;
  }>;
}) {
  const { id } = await params;
  const { hinweis, fehler, bearbeite } = await searchParams;
  const supabase = await createClient();

  // RLS entscheidet, ob das Projekt für diese Person sichtbar ist.
  const { data: projekt } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();
  if (!projekt) notFound();

  const [{ data: host }, { data: auth }, { data: ideenDaten }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", projekt.host_id)
        .single<Profile>(),
      supabase.auth.getUser(),
      supabase
        .from("ideas")
        .select(
          `*,
           author:profiles(id, display_name, avatar_url),
           votes:idea_votes(user_id),
           replies:idea_replies(*, author:profiles(id, display_name, avatar_url))`,
        )
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .order("created_at", {
          referencedTable: "idea_replies",
          ascending: true,
        })
        .limit(200),
    ]);
  const user = auth.user;
  const istHost = user?.id === projekt.host_id;
  const ideen = (ideenDaten ?? []) as IdeeMitDetails[];

  const ideenOffen =
    projekt.phase === "brainstorming" ||
    (projekt.phase === "laufend" && !projekt.ideas_closed);

  return (
    <article className="flex flex-col gap-6 py-6">
      <Hinweis code={hinweis} />
      {projekt.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element -- freie Nutzer-URLs, keine Domain-Allowlist für next/image
        <img
          src={projekt.cover_url}
          alt=""
          className="max-h-64 w-full rounded-xl border border-border object-cover"
        />
      )}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PhaseBadge phase={projekt.phase} />
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
            {KATEGORIEN[projekt.category]}
          </span>
          {projekt.visibility === "private" && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
              🔒 Privat
            </span>
          )}
          {projekt.is_hidden && (
            <span className="rounded-full border border-red-500/50 px-2.5 py-0.5 text-xs text-red-600 dark:text-red-400">
              Vom Admin ausgeblendet
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {projekt.title}
          </h1>
          {istHost && (
            <Link href={`/projekt/${projekt.id}/bearbeiten`} className="btn">
              Bearbeiten
            </Link>
          )}
        </div>
        {host && (
          <Link
            href={`/profil/${host.id}`}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <Avatar url={host.avatar_url} name={host.display_name} size={28} />
            <span>
              Host: <strong>{host.display_name}</strong>
            </span>
          </Link>
        )}
      </header>

      {projekt.description ? (
        <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed">
          {projekt.description}
        </p>
      ) : (
        <p className="text-sm text-muted">Noch keine Beschreibung.</p>
      )}

      {/* Ideen / Brainstorming */}
      <section id="ideen" className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-xl font-bold">
          💡 Ideen{ideen.length > 0 && ` (${ideen.length})`}
        </h2>
        <Fehler code={fehler} />

        {ideenOffen ? (
          user ? (
            <form
              action={ideePosten}
              className="flex flex-col gap-2 rounded-xl border border-border p-4"
            >
              <input type="hidden" name="projekt_id" value={projekt.id} />
              <label htmlFor="idee-body" className="label">
                Deine Idee (max. 1.000 Zeichen)
              </label>
              <textarea
                id="idee-body"
                name="body"
                rows={3}
                required
                maxLength={1000}
                className="input"
                placeholder="Was würde dieses Projekt voranbringen?"
              />
              <button type="submit" className="btn-primary self-start">
                Idee posten
              </button>
            </form>
          ) : (
            <p className="rounded-xl border border-border p-4 text-sm text-muted">
              <Link href="/anmelden" className="underline">
                Melde dich an
              </Link>
              , um eigene Ideen beizusteuern.
            </p>
          )
        ) : (
          <p className="rounded-xl border border-border p-4 text-sm text-muted">
            Der Ideen-Bereich ist für dieses Projekt geschlossen.
          </p>
        )}

        {ideen.length === 0 ? (
          <EmptyState
            emoji="💡"
            titel="Noch keine Ideen — leg los!"
            text={
              ideenOffen
                ? "Sei die erste Person, die hier eine Idee postet."
                : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {ideen.map((idee) => (
              <IdeaItem
                key={idee.id}
                idee={idee}
                projektId={projekt.id}
                userId={user?.id}
                bearbeiten={bearbeite === idee.id}
              />
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
