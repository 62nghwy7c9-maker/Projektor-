import Link from "next/link";
import { anmelden } from "@/app/auth/actions";
import { Fehler, Hinweis } from "@/components/Hinweis";

export const metadata = { title: "Anmelden — Projector" };

export default async function AnmeldenSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string; hinweis?: string }>;
}) {
  const { fehler, hinweis } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-8">
      <h1 className="text-2xl font-bold">Anmelden</h1>
      <Fehler code={fehler} />
      <Hinweis code={hinweis} />
      <form action={anmelden} className="flex flex-col gap-4">
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
        <div>
          <label htmlFor="passwort" className="label">
            Passwort
          </label>
          <input
            id="passwort"
            name="passwort"
            type="password"
            required
            autoComplete="current-password"
            className="input mt-1"
          />
        </div>
        <button type="submit" className="btn-primary">
          Anmelden
        </button>
      </form>
      <div className="flex flex-col gap-1 text-sm text-muted">
        <p>
          Passwort vergessen?{" "}
          <Link href="/passwort-vergessen" className="underline">
            Zurücksetzen
          </Link>
        </p>
        <p>
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
