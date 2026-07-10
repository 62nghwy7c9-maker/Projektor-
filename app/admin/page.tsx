import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { MeldungsTyp, Report } from "@/lib/types";
import { adminAusblenden, adminErledigt, adminSperren } from "./actions";
import { Fehler, Hinweis } from "@/components/Hinweis";
import EmptyState from "@/components/EmptyState";
import { zeitpunkt } from "@/components/IdeaItem";

export const metadata = { title: "Admin — Projector" };

const TYP_LABEL: Record<MeldungsTyp, string> = {
  project: "Projekt",
  idea: "Idee",
  reply: "Antwort",
  profile: "Profil",
};

type Ziel = {
  beschreibung: string;
  link?: string;
  istAusgeblendet?: boolean;
  ausblendbar: boolean;
  nutzerId?: string; // Autor/Host/Profil — Ziel für Sperren
  nutzerName?: string;
  nutzerGesperrt?: boolean;
};

export default async function AdminSeite({
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

  const { data: eigenesProfil } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!eigenesProfil?.is_admin) redirect("/");

  const { data: meldungenDaten } = await supabase
    .from("reports")
    .select("*, reporter:profiles(id, display_name)")
    .order("status", { ascending: true }) // 'open' vor 'resolved'
    .order("created_at", { ascending: false })
    .limit(100);
  const meldungen = (meldungenDaten ?? []) as (Report & {
    reporter: { id: string; display_name: string } | null;
  })[];

  // Ziel-Inhalte gesammelt nachladen (je Typ eine Abfrage).
  const idsProTyp = (typ: MeldungsTyp) =>
    meldungen.filter((m) => m.target_type === typ).map((m) => m.target_id);

  const [projekteRes, ideenRes, antwortenRes] = await Promise.all([
    idsProTyp("project").length
      ? supabase
          .from("projects")
          .select("id, title, is_hidden, host_id")
          .in("id", idsProTyp("project"))
      : { data: [] },
    idsProTyp("idea").length
      ? supabase
          .from("ideas")
          .select("id, body, is_hidden, author_id, project_id")
          .in("id", idsProTyp("idea"))
      : { data: [] },
    idsProTyp("reply").length
      ? supabase
          .from("idea_replies")
          .select("id, body, is_hidden, author_id, idea_id")
          .in("id", idsProTyp("reply"))
      : { data: [] },
  ]);
  const projekte = projekteRes.data ?? [];
  const ideen = ideenRes.data ?? [];
  const antworten = antwortenRes.data ?? [];

  const nutzerIds = new Set<string>([
    ...projekte.map((p) => p.host_id),
    ...ideen.map((i) => i.author_id),
    ...antworten.map((a) => a.author_id),
    ...idsProTyp("profile"),
  ]);
  const { data: nutzerDaten } = nutzerIds.size
    ? await supabase
        .from("profiles")
        .select("id, display_name, is_banned")
        .in("id", [...nutzerIds])
    : { data: [] };
  const nutzer = new Map((nutzerDaten ?? []).map((n) => [n.id, n]));

  function zielFuer(meldung: Report): Ziel {
    const kurz = (text: string) =>
      text.length > 160 ? `${text.slice(0, 160)}…` : text;
    if (meldung.target_type === "project") {
      const p = projekte.find((x) => x.id === meldung.target_id);
      if (!p) return { beschreibung: "— Inhalt existiert nicht mehr —", ausblendbar: false };
      const host = nutzer.get(p.host_id);
      return {
        beschreibung: `„${p.title}"`,
        link: `/projekt/${p.id}`,
        istAusgeblendet: p.is_hidden,
        ausblendbar: true,
        nutzerId: p.host_id,
        nutzerName: host?.display_name,
        nutzerGesperrt: host?.is_banned,
      };
    }
    if (meldung.target_type === "idea") {
      const i = ideen.find((x) => x.id === meldung.target_id);
      if (!i) return { beschreibung: "— Inhalt existiert nicht mehr —", ausblendbar: false };
      const autor = nutzer.get(i.author_id);
      return {
        beschreibung: kurz(i.body),
        link: `/projekt/${i.project_id}#idee-${i.id}`,
        istAusgeblendet: i.is_hidden,
        ausblendbar: true,
        nutzerId: i.author_id,
        nutzerName: autor?.display_name,
        nutzerGesperrt: autor?.is_banned,
      };
    }
    if (meldung.target_type === "reply") {
      const a = antworten.find((x) => x.id === meldung.target_id);
      if (!a) return { beschreibung: "— Inhalt existiert nicht mehr —", ausblendbar: false };
      const autor = nutzer.get(a.author_id);
      return {
        beschreibung: kurz(a.body),
        istAusgeblendet: a.is_hidden,
        ausblendbar: true,
        nutzerId: a.author_id,
        nutzerName: autor?.display_name,
        nutzerGesperrt: autor?.is_banned,
      };
    }
    const profil = nutzer.get(meldung.target_id);
    if (!profil) return { beschreibung: "— Profil existiert nicht mehr —", ausblendbar: false };
    return {
      beschreibung: `Profil von ${profil.display_name}`,
      link: `/profil/${profil.id}`,
      ausblendbar: false,
      nutzerId: profil.id,
      nutzerName: profil.display_name,
      nutzerGesperrt: profil.is_banned,
    };
  }

  const offene = meldungen.filter((m) => m.status === "open");
  const erledigte = meldungen.filter((m) => m.status === "resolved");

  function MeldungsKarte({ meldung }: { meldung: (typeof meldungen)[number] }) {
    const ziel = zielFuer(meldung);
    return (
      <li className="flex flex-col gap-2 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-0.5 font-medium">
            {TYP_LABEL[meldung.target_type]}
          </span>
          <span>{zeitpunkt(meldung.created_at)}</span>
          <span>· gemeldet von {meldung.reporter?.display_name ?? "gelöschtem Konto"}</span>
          {ziel.istAusgeblendet && (
            <span className="rounded-full border border-red-500/50 px-2 py-0.5 text-red-600 dark:text-red-400">
              ausgeblendet
            </span>
          )}
          {ziel.nutzerGesperrt && (
            <span className="rounded-full border border-red-500/50 px-2 py-0.5 text-red-600 dark:text-red-400">
              Nutzer gesperrt
            </span>
          )}
        </div>
        <p className="text-sm">
          {ziel.link ? (
            <Link href={ziel.link} className="hover:underline">
              {ziel.beschreibung}
            </Link>
          ) : (
            ziel.beschreibung
          )}
          {ziel.nutzerName && meldung.target_type !== "profile" && (
            <span className="text-muted"> — von {ziel.nutzerName}</span>
          )}
        </p>
        <p className="rounded-lg bg-accent/5 px-3 py-2 text-sm">
          <strong>Grund:</strong> {meldung.reason}
        </p>
        <div className="flex flex-wrap gap-2">
          {ziel.ausblendbar && (
            <form action={adminAusblenden}>
              <input type="hidden" name="typ" value={meldung.target_type} />
              <input type="hidden" name="ziel_id" value={meldung.target_id} />
              <input
                type="hidden"
                name="ausblenden"
                value={ziel.istAusgeblendet ? "nein" : "ja"}
              />
              <button type="submit" className="btn text-xs">
                {ziel.istAusgeblendet ? "Wieder einblenden" : "Ausblenden"}
              </button>
            </form>
          )}
          {ziel.nutzerId && ziel.nutzerId !== user!.id && (
            <form action={adminSperren}>
              <input type="hidden" name="nutzer_id" value={ziel.nutzerId} />
              <input
                type="hidden"
                name="sperren"
                value={ziel.nutzerGesperrt ? "nein" : "ja"}
              />
              <button type="submit" className="btn text-xs">
                {ziel.nutzerGesperrt
                  ? `${ziel.nutzerName ?? "Nutzer"} entsperren`
                  : `${ziel.nutzerName ?? "Nutzer"} sperren`}
              </button>
            </form>
          )}
          <form action={adminErledigt}>
            <input type="hidden" name="meldung_id" value={meldung.id} />
            <input
              type="hidden"
              name="erledigt"
              value={meldung.status === "resolved" ? "nein" : "ja"}
            />
            <button type="submit" className="btn text-xs">
              {meldung.status === "resolved"
                ? "Wieder öffnen"
                : "Als erledigt markieren"}
            </button>
          </form>
        </div>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-bold">Admin — Meldungen</h1>
      <Fehler code={fehler} />
      <Hinweis code={hinweis} />

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Offen ({offene.length})</h2>
        {offene.length === 0 ? (
          <EmptyState
            emoji="🎉"
            titel="Keine offenen Meldungen"
            text="Alles ruhig — nichts zu moderieren."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {offene.map((m) => (
              <MeldungsKarte key={m.id} meldung={m} />
            ))}
          </ul>
        )}
      </section>

      {erledigte.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">Erledigt ({erledigte.length})</h2>
          <ul className="flex flex-col gap-3 opacity-70">
            {erledigte.map((m) => (
              <MeldungsKarte key={m.id} meldung={m} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
