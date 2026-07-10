import Link from "next/link";
import { registrieren } from "@/app/auth/actions";
import { Fehler } from "@/components/Hinweis";

export const metadata = { title: "Registrieren — Projector" };

export default async function RegistrierenSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { fehler } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-8">
      <h1 className="text-2xl font-bold">Konto erstellen</h1>
      <Fehler code={fehler} />
      <form action={registrieren} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="label">
            Anzeigename
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={80}
            autoComplete="nickname"
            className="input mt-1"
            placeholder="z. B. Kira"
          />
        </div>
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
            Passwort (mind. 8 Zeichen)
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
          Registrieren
        </button>
      </form>
      <p className="text-sm text-muted">
        Schon ein Konto?{" "}
        <Link href="/anmelden" className="underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
