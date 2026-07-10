import Link from "next/link";
import type { Project } from "@/lib/types";
import { KATEGORIEN } from "@/lib/types";
import PhaseBadge from "@/components/PhaseBadge";

function relativeZeit(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minuten = Math.floor(diffMs / 60_000);
  if (minuten < 1) return "gerade eben";
  if (minuten < 60) return `vor ${minuten} Min.`;
  const stunden = Math.floor(minuten / 60);
  if (stunden < 24) return `vor ${stunden} Std.`;
  const tage = Math.floor(stunden / 24);
  if (tage < 30) return `vor ${tage} ${tage === 1 ? "Tag" : "Tagen"}`;
  return new Date(iso).toLocaleDateString("de-DE");
}

export default function ProjectCard({ projekt }: { projekt: Project }) {
  return (
    <Link
      href={`/projekt/${projekt.id}`}
      className="flex flex-col gap-2 rounded-xl border border-border p-4 transition-colors hover:border-accent"
    >
      {projekt.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element -- freie Nutzer-URLs, keine Domain-Allowlist für next/image
        <img
          src={projekt.cover_url}
          alt=""
          className="mb-1 h-32 w-full rounded-lg border border-border object-cover"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <PhaseBadge phase={projekt.phase} />
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
          {KATEGORIEN[projekt.category]}
        </span>
      </div>
      <h3 className="font-semibold leading-snug">{projekt.title}</h3>
      {projekt.description && (
        <p className="line-clamp-2 text-sm text-muted">
          {projekt.description}
        </p>
      )}
      <p className="mt-auto pt-1 text-xs text-muted">
        Aktiv {relativeZeit(projekt.last_activity_at)}
      </p>
    </Link>
  );
}
