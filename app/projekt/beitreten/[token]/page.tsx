import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { beitreten } from "./actions";
import { Fehler } from "@/components/Hinweis";

export const metadata = { title: "Projekt beitreten — Projector" };

export default async function BeitretenSeite({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { token } = await params;
  const { fehler } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-12 text-center">
      <span className="text-4xl" aria-hidden>
        ✉️
      </span>
      <h1 className="text-2xl font-bold">Du wurdest eingeladen!</h1>
      <Fehler code={fehler} />
      {user ? (
        <>
          <p className="text-sm text-muted">
            Tritt dem Projekt bei, um es zu sehen und mitzumachen.
          </p>
          <form action={beitreten}>
            <input type="hidden" name="token" value={token} />
            <button type="submit" className="btn-primary w-full">
              Projekt beitreten
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">
            Melde dich an oder erstelle ein Konto und öffne den Einladungslink
            danach noch einmal.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/anmelden" className="btn-primary">
              Anmelden
            </Link>
            <Link href="/registrieren" className="btn">
              Konto erstellen
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
