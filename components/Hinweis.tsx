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
  "zu-lang": "Einer der Texte ist zu lang. Bitte kürze ihn.",
  "rate-limit":
    "Rate-Limit erreicht: höchstens 5 Ideen pro Minute. Bitte kurz durchatmen.",
  "posten-nicht-moeglich":
    "Das Posten ist hier gerade nicht möglich — vielleicht ist der Ideen-Bereich geschlossen, du bist blockiert oder deine E-Mail ist noch nicht bestätigt.",
  "avatar-url": "Die Bild-URL muss mit https:// beginnen.",
  unbekannt: "Das hat leider nicht geklappt. Bitte versuche es noch einmal.",
  // Hinweise
  bestaetigen:
    "Fast geschafft! Wir haben dir eine Bestätigungs-E-Mail geschickt. Klicke auf den Link darin, dann kannst du dich anmelden.",
  gesendet:
    "Wenn ein Konto mit dieser Adresse existiert, haben wir dir einen Link zum Zurücksetzen geschickt.",
  "passwort-geaendert": "Dein Passwort wurde geändert.",
  gespeichert: "Gespeichert!",
  "projekt-geloescht": "Das Projekt wurde gelöscht.",
  "link-erneuert":
    "Der Einladungslink wurde erneuert — der alte Link ist jetzt ungültig.",
  beigetreten: "Willkommen im Projekt — du bist jetzt Mitglied!",
  gemeldet: "Danke für deine Meldung — wir schauen sie uns zeitnah an.",
  blockiert:
    "Nutzer blockiert — die Person kann in diesem Projekt nichts mehr posten.",
  "blockiert-vom-host":
    "Der Host dieses Projekts hat dich blockiert — ein Beitritt ist nicht möglich.",
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
