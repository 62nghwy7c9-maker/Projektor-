import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Project } from "@/lib/types";
import { KATEGORIEN } from "@/lib/types";
import PhaseBadge from "@/components/PhaseBadge";
import Avatar from "@/components/Avatar";

export const metadata = { title: "Projekt — Projector" };

export default async function ProjektSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS entscheidet, ob das Projekt für diese Person sichtbar ist.
  const { data: projekt } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();
  if (!projekt) notFound();

  const [{ data: host }, { data: auth }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", projekt.host_id)
      .single<Profile>(),
    supabase.auth.getUser(),
  ]);
  const user = auth.user;
  const istHost = user?.id === projekt.host_id;

  return (
    <article className="flex flex-col gap-6 py-6">
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
    </article>
  );
}
