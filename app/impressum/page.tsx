export const metadata = { title: "Impressum — Projector" };

// Vorlage nach § 5 DDG. Die [PLATZHALTER] müssen vor dem öffentlichen
// Start durch die echten Angaben der Betreiberin ersetzt werden.
export default function Impressum() {
  return (
    <div className="mx-auto flex w-full max-w-prose flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold">Impressum</h1>

      <section className="flex flex-col gap-1 text-sm">
        <h2 className="font-semibold">Angaben gemäß § 5 DDG</h2>
        <p>
          [VORNAME NACHNAME]
          <br />
          [STRASSE HAUSNUMMER]
          <br />
          [PLZ ORT]
          <br />
          Deutschland
        </p>
      </section>

      <section className="flex flex-col gap-1 text-sm">
        <h2 className="font-semibold">Kontakt</h2>
        <p>E-Mail: [KONTAKT-E-MAIL-ADRESSE]</p>
      </section>

      <section className="flex flex-col gap-1 text-sm">
        <h2 className="font-semibold">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p>
          [VORNAME NACHNAME]
          <br />
          [ANSCHRIFT WIE OBEN]
        </p>
      </section>

      <section className="flex flex-col gap-1 text-sm">
        <h2 className="font-semibold">Haftung für Inhalte</h2>
        <p className="text-muted">
          Die Inhalte auf Projector werden überwiegend von Nutzerinnen und
          Nutzern erstellt. Als Diensteanbieterin bin ich für diese fremden
          Inhalte erst ab Kenntnis einer konkreten Rechtsverletzung
          verantwortlich. Gemeldete Inhalte werden zeitnah geprüft und bei
          Verstößen entfernt (Melde-Funktion auf jeder Inhaltsseite).
        </p>
      </section>
    </div>
  );
}
