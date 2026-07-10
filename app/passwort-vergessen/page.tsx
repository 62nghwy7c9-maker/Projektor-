import Link from "next/link";
import { passwortVergessen } from "@/app/auth/actions";
import { Fehler, Hinweis } from "@/components/Hinweis";

export const metadata = { title: "Passwort vergessen — Projector" };

export default async function PasswortVergessenSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string; hinweis?: string }>;
}) {
  const { fehler, hinweis } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-8">
      <h1 className="text-2xl font-bold">Passwort zurücksetzen</h1>
      <p className="text-sm text-muted">
        Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du
        ein neues Passwort setzen kannst.
      </p>
      <Fehler code={fehler} />
      <Hinweis code={hinweis} />
      <form action={passwortVergessen} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="label">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input mt-1"
          />
        </div>
        <button type="submit" className="btn-primary">
          Link anfordern
        </button>
      </form>
      <p className="text-sm text-muted">
        <Link href="/anmelden" className="underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
