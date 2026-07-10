import { passwortNeuSetzen } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { Fehler } from "@/components/Hinweis";
import Link from "next/link";

export const metadata = { title: "Neues Passwort — Projector" };

export default async function PasswortNeuSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { fehler } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-8">
        <h1 className="text-2xl font-bold">Neues Passwort setzen</h1>
        <p className="text-sm text-muted">
          Dieser Bereich funktioniert nur über den Link aus der
          Zurücksetzen-E-Mail.{" "}
          <Link href="/passwort-vergessen" className="underline">
            Neuen Link anfordern
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-8">
      <h1 className="text-2xl font-bold">Neues Passwort setzen</h1>
      <Fehler code={fehler} />
      <form action={passwortNeuSetzen} className="flex flex-col gap-4">
        <div>
          <label htmlFor="passwort" className="label">
            Neues Passwort (mind. 8 Zeichen)
          </label>
          <input
            id="passwort"
            name="passwort"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input mt-1"
          />
        </div>
        <button type="submit" className="btn-primary">
          Passwort speichern
        </button>
      </form>
    </div>
  );
}
