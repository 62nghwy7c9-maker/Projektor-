import Link from "next/link";
import type { Idea, IdeaReply, Profile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import { ideeBearbeiten, ideeLoeschen } from "@/app/projekt/ideen-actions";

export type AutorKurz = Pick<Profile, "id" | "display_name" | "avatar_url">;
export type IdeeMitDetails = Idea & {
  author: AutorKurz | null;
  votes: { user_id: string }[];
  replies: (IdeaReply & { author: AutorKurz | null })[];
};

export function zeitpunkt(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AutorZeile({
  autor,
  datum,
}: {
  autor: AutorKurz | null;
  datum: string;
}) {
  if (!autor) {
    return <span className="text-xs text-muted">Gelöschtes Konto · {zeitpunkt(datum)}</span>;
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <Avatar url={autor.avatar_url} name={autor.display_name} size={20} />
      <Link href={`/profil/${autor.id}`} className="font-medium text-foreground hover:underline">
        {autor.display_name}
      </Link>
      · {zeitpunkt(datum)}
    </span>
  );
}

export default function IdeaItem({
  idee,
  projektId,
  userId,
  bearbeiten,
}: {
  idee: IdeeMitDetails;
  projektId: string;
  userId?: string;
  bearbeiten?: boolean;
}) {
  const istAutor = !!userId && idee.author_id === userId;

  return (
    <li
      id={`idee-${idee.id}`}
      className={`flex flex-col gap-2 rounded-xl border border-border p-4 ${
        idee.is_hidden ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AutorZeile autor={idee.author} datum={idee.created_at} />
        {idee.is_hidden && (
          <span className="rounded-full border border-red-500/50 px-2 py-0.5 text-xs text-red-600 dark:text-red-400">
            Ausgeblendet — nur für dich sichtbar
          </span>
        )}
      </div>

      {istAutor && bearbeiten ? (
        <form action={ideeBearbeiten} className="flex flex-col gap-2">
          <input type="hidden" name="idee_id" value={idee.id} />
          <input type="hidden" name="projekt_id" value={projektId} />
          <textarea
            name="body"
            rows={3}
            required
            maxLength={1000}
            defaultValue={idee.body}
            className="input"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Speichern
            </button>
            <Link href={`/projekt/${projektId}#idee-${idee.id}`} className="btn">
              Abbrechen
            </Link>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-line text-sm">{idee.body}</p>
      )}

      {istAutor && !bearbeiten && (
        <div className="flex gap-3 text-xs">
          <Link
            href={`/projekt/${projektId}?bearbeite=${idee.id}#idee-${idee.id}`}
            className="text-muted hover:underline"
          >
            Bearbeiten
          </Link>
          <form action={ideeLoeschen}>
            <input type="hidden" name="idee_id" value={idee.id} />
            <input type="hidden" name="projekt_id" value={projektId} />
            <button type="submit" className="text-muted hover:underline">
              Löschen
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
