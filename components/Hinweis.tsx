const TEXTE: Record<string, string> = {
  // Fehler
  "felder-fehlen": "Bitte fülle alle Felder aus.",
  "passwort-kurz": "Das Passwort muss mindestens 8 Zeichen lang sein.",
  "email-vergeben": "Für diese E-Mail-Adresse existiert bereits ein Konto.",
  "email-ungueltig": "Diese E-Mail-Adresse sieht nicht gültig aus.",
  "login-fehlgeschlagen": "E-Mail oder Passwort ist falsch.",
  "email-nicht-bestaetigt":
    "Bitte bestätige zuerst deine E-Mail-Adresse — schau in dein Postfach (auch im Spam-Ordner).",
  "zu-viele-versuche":
    "Zu viele Versuche in kurzer Zeit. Bitte warte einen Moment.",
  gesperrt:
    "Dieses Konto wurde gesperrt. Bei Fragen wende dich an das Projector-Team.",
  "link-ungueltig":
    "Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.",
  "nicht-berechtigt": "Dafür fehlt dir die Berechtigung.",
  unbekannt: "Das hat leider nicht geklappt. Bitte versuche es noch einmal.",
  // Hinweise
  bestaetigen:
    "Fast geschafft! Wir haben dir eine Bestätigungs-E-Mail geschickt. Klicke auf den Link darin, dann kannst du dich anmelden.",
  gesendet:
    "Wenn ein Konto mit dieser Adresse existiert, haben wir dir einen Link zum Zurücksetzen geschickt.",
  "passwort-geaendert": "Dein Passwort wurde geändert.",
};

export function Fehler({ code }: { code?: string }) {
  if (!code) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/50 bg-red-500/5 px-4 py-3 text-sm"
    >
      {TEXTE[code] ?? TEXTE["unbekannt"]}
    </div>
  );
}

export function Hinweis({ code }: { code?: string }) {
  if (!code || !TEXTE[code]) return null;
  return (
    <div
      role="status"
      className="rounded-lg border border-green-500/50 bg-green-500/5 px-4 py-3 text-sm"
    >
      {TEXTE[code]}
    </div>
  );
}
