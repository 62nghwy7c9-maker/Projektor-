export const metadata = { title: "Datenschutz — Projector" };

// Vorlage einer Datenschutzerklärung (DSGVO). Die [PLATZHALTER] müssen vor
// dem öffentlichen Start ersetzt und der Text fachlich geprüft werden —
// die finale Verantwortung liegt bei der Betreiberin.
export default function Datenschutz() {
  return (
    <div className="mx-auto flex w-full max-w-prose flex-col gap-6 py-8 text-sm">
      <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">1. Verantwortliche</h2>
        <p>
          [VORNAME NACHNAME], [ANSCHRIFT], E-Mail: [KONTAKT-E-MAIL-ADRESSE]
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">2. Welche Daten wir verarbeiten</h2>
        <ul className="list-disc pl-5">
          <li>
            <strong>Konto:</strong> E-Mail-Adresse, Passwort (verschlüsselt
            gespeichert), Anzeigename, optionale Profilangaben (Bio, Avatar-URL,
            Skills).
          </li>
          <li>
            <strong>Inhalte:</strong> Projekte, Ideen, Antworten, Votes,
            Updates und Meldungen, die du selbst erstellst.
          </li>
          <li>
            <strong>Technisch:</strong> Session-Cookies für die Anmeldung
            (kein Tracking, keine Werbe-Cookies).
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">3. Zwecke und Rechtsgrundlagen</h2>
        <p>
          Die Verarbeitung erfolgt zur Bereitstellung der Plattform
          (Art. 6 Abs. 1 lit. b DSGVO) sowie zur Moderation und Missbrauchs-
          Abwehr (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">4. Wo deine Daten liegen</h2>
        <p>
          Datenbank und Anmeldung laufen über Supabase in der Region
          <strong> Frankfurt (EU)</strong>. Das Hosting der Web-App übernimmt
          Vercel; dabei können technisch notwendige Zugriffsdaten (z. B.
          IP-Adresse) verarbeitet werden. Mit beiden Anbietern bestehen
          Auftragsverarbeitungsverträge nach Art. 28 DSGVO.
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">5. Wer deine Inhalte sieht</h2>
        <p>
          Öffentliche Projekte samt Ideen sind für alle sichtbar — auch ohne
          Konto. Private Projekte sehen nur Mitglieder. Dein Profil
          (Anzeigename, Bio, Skills) ist öffentlich einsehbar.
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">6. Speicherdauer & Konto-Löschung</h2>
        <p>
          Deine Daten bleiben gespeichert, solange dein Konto besteht. Du
          kannst dein Konto jederzeit selbst löschen (Einstellungen →
          „Konto löschen&ldquo;). Dabei werden dein Zugang und deine Inhalte
          (Profil, Projekte, Ideen, Antworten, Votes) dauerhaft entfernt.
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">7. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
          Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit
          (Art. 20) und Widerspruch (Art. 21 DSGVO) sowie das Recht auf
          Beschwerde bei einer Datenschutz-Aufsichtsbehörde. Wende dich dafür
          an [KONTAKT-E-MAIL-ADRESSE].
        </p>
      </section>
    </div>
  );
}
