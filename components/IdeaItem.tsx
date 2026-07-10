import Link from "next/link";
import type { Idea, IdeaReply, Profile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import {
  antwortLoeschen,
  antwortPosten,
  ideeBearbeiten,
  ideeLoeschen,
  sternUmschalten,
  voteUmschalten,
} from "@/app/projekt/ideen-actions";
import ReportButton from "@/components/ReportButton";
import {
  inhaltAusblenden,
  nutzerBlockieren,
} from "@/app/projekt/moderation-actions";

// Host-Moderationsknöpfe für eine Idee oder Antwort.
function HostModeration({
  typ,
  zielId,
  projektId,
  autorId,
  istAusgeblendet,
}: {
  typ: "idea" | "reply";
  zielId: string;
  projektId: string;
  autorId: string;
  istAusgeblendet: boolean;
}) {
  return (
    <>
      <form action={inhaltAusblenden}>
        <input type="hidden" name="typ" value={typ} />
        <input type="hidden" name="ziel_id" value={zielId} />
        <input type="hidden" name="projekt_id" value={projektId} />
        <input
          type="hidden"
          name="ausblenden"
          value={istAusgeblendet ? "nein" : "ja"}
        />
        <button type="submit" className="text-xs text-muted hover:underline">
          {istAusgeblendet ? "Einblenden" : "Ausblenden"}
        </button>
      </form>
      <form action={nutzerBlockieren}>
        <input type="hidden" name="projekt_id" value={projektId} />
        <input type="hidden" name="nutzer_id" value={autorId} />
        <input type="hidden" name="zurueck" value={`/projekt/${projektId}`} />
        <button type="submit" className="text-xs text-muted hover:underline">
          Nutzer blockieren
        </button>
      </form>
    </>
  );
}

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
  antwortenOffen,
  istHost,
}: {
  idee: IdeeMitDetails;
  projektId: string;
  userId?: string;
  bearbeiten?: boolean;
  antwortenOffen?: boolean;
  istHost?: boolean;
}) {
  const istAutor = !!userId && idee.author_id === userId;
  const stimmen = idee.votes.length;
  const gevotet = !!userId && idee.votes.some((v) => v.user_id === userId);
  // Versteckte Antworten liefert RLS ohnehin nur an Autor/Host/Admin.
  const antworten = idee.replies;

  return (
    <li
      id={`idee-${idee.id}`}
      className={`flex flex-col gap-2 rounded-xl border border-border p-4 ${
        idee.is_hidden ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AutorZeile autor={idee.author} datum={idee.created_at} />
        <span className="flex items-center gap-2">
          {idee.is_starred && (
            <span
              className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-xs font-medium"
              title="Vom Host aufgegriffen"
            >
              ⭐ Vom Host aufgegriffen
            </span>
          )}
          {idee.is_hidden && (
            <span className="rounded-full border border-red-500/50 px-2 py-0.5 text-xs text-red-600 dark:text-red-400">
              Ausgeblendet — nur für dich sichtbar
            </span>
          )}
        </span>
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

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Upvote — ein Vote pro Nutzer pro Idee */}
        {userId ? (
          <form action={voteUmschalten}>
            <input type="hidden" name="idee_id" value={idee.id} />
            <input type="hidden" name="projekt_id" value={projektId} />
            <input type="hidden" name="gevotet" value={gevotet ? "ja" : "nein"} />
            <button
              type="submit"
              aria-pressed={gevotet}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium ${
                gevotet
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent"
              }`}
            >
              👍 {stimmen}
            </button>
          </form>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-medium text-muted">
            👍 {stimmen}
          </span>
        )}
        {istHost && (
          <form action={sternUmschalten}>
            <input type="hidden" name="idee_id" value={idee.id} />
            <input type="hidden" name="projekt_id" value={projektId} />
            <input
              type="hidden"
              name="gestirnt"
              value={idee.is_starred ? "ja" : "nein"}
            />
            <button type="submit" className="text-muted hover:underline">
              {idee.is_starred ? "⭐ Stern entfernen" : "⭐ Stern setzen"}
            </button>
          </form>
        )}
        {istAutor && !bearbeiten && (
          <>
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
          </>
        )}
        {userId && !istAutor && (
          <ReportButton
            typ="idea"
            zielId={idee.id}
            zurueck={`/projekt/${projektId}`}
          />
        )}
        {istHost && !istAutor && (
          <HostModeration
            typ="idea"
            zielId={idee.id}
            projektId={projektId}
            autorId={idee.author_id}
            istAusgeblendet={idee.is_hidden}
          />
        )}
      </div>

      {/* Antworten — flach, genau eine Ebene */}
      {(antworten.length > 0 || (userId && antwortenOffen)) && (
        <div className="mt-1 flex flex-col gap-2 border-l-2 border-border pl-4">
          {antworten.map((antwort) => (
            <div key={antwort.id} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <AutorZeile autor={antwort.author} datum={antwort.created_at} />
                {antwort.is_hidden && (
                  <span className="rounded-full border border-red-500/50 px-2 py-0.5 text-xs text-red-600 dark:text-red-400">
                    Ausgeblendet
                  </span>
                )}
              </div>
              <p className="whitespace-pre-line text-sm">{antwort.body}</p>
              <div className="flex gap-3">
                {userId === antwort.author_id && (
                  <form action={antwortLoeschen}>
                    <input type="hidden" name="antwort_id" value={antwort.id} />
                    <input type="hidden" name="idee_id" value={idee.id} />
                    <input type="hidden" name="projekt_id" value={projektId} />
                    <button
                      type="submit"
                      className="text-xs text-muted hover:underline"
                    >
                      Löschen
                    </button>
                  </form>
                )}
                {userId && userId !== antwort.author_id && (
                  <ReportButton
                    typ="reply"
                    zielId={antwort.id}
                    zurueck={`/projekt/${projektId}`}
                  />
                )}
                {istHost && userId !== antwort.author_id && (
                  <HostModeration
                    typ="reply"
                    zielId={antwort.id}
                    projektId={projektId}
                    autorId={antwort.author_id}
                    istAusgeblendet={antwort.is_hidden}
                  />
                )}
              </div>
            </div>
          ))}
          {userId && antwortenOffen && (
            <form action={antwortPosten} className="flex items-start gap-2">
              <input type="hidden" name="idee_id" value={idee.id} />
              <input type="hidden" name="projekt_id" value={projektId} />
              <input
                type="text"
                name="body"
                required
                maxLength={1000}
                placeholder="Antworten …"
                aria-label="Antwort schreiben"
                className="input"
              />
              <button type="submit" className="btn shrink-0">
                Senden
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}
