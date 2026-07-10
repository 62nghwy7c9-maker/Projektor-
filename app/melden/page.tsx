import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MeldungsTyp } from "@/lib/types";
import { meldungAbsenden } from "./actions";
import { Fehler } from "@/components/Hinweis";

export const metadata = { title: "Inhalt melden — Projector" };

const TYP_LABEL: Record<MeldungsTyp, string> = {
  project: "Projekt",
  idea: "Idee",
  reply: "Antwort",
  profile: "Profil",
};

export default async function MeldenSeite({
  searchParams,
}: {
  searchParams: Promise<{
    typ?: string;
    id?: string;
    zurueck?: string;
    fehler?: string;
  }>;
}) {
  const sp = await searchParams;
  const typ = sp.typ as MeldungsTyp | undefined;
  if (!typ || !(typ in TYP_LABEL) || !sp.id) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const zurueck = sp.zurueck?.startsWith("/") ? sp.zurueck : "/";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-8">
      <h1 className="text-2xl font-bold">{TYP_LABEL[typ]} melden</h1>
      <p className="text-sm text-muted">
        Deine Meldung geht an das Projector-Team und wird zeitnah geprüft.
      </p>
      <Fehler code={sp.fehler} />
      <form action={meldungAbsenden} className="flex flex-col gap-4">
        <input type="hidden" name="typ" value={typ} />
        <input type="hidden" name="ziel_id" value={sp.id} />
        <input type="hidden" name="zurueck" value={zurueck} />
        <div>
          <label htmlFor="grund" className="label">
            Warum meldest du diesen Inhalt?
          </label>
          <textarea
            id="grund"
            name="grund"
            rows={4}
            required
            maxLength={1000}
            className="input mt-1"
            placeholder="z. B. Spam, Beleidigung, illegaler Inhalt …"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Meldung absenden
          </button>
          <Link href={zurueck} className="btn">
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}
