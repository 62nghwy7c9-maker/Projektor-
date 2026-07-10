# Projector — Umsetzungsplan Teilprojekt A

Grundlage: `docs/design/teilprojekt-a-design.md` (freigegeben).
Regeln: Schritte werden **in Reihenfolge** umgesetzt, jeder endet mit Commit + Push.
Ein Schritt gilt erst als fertig, wenn sein **Fertig-Kriterium** tatsächlich geprüft wurde.

**Aufgaben, die nur Kira erledigen kann** (jeweils vor dem markierten Schritt):
- 🔑 Vor Schritt 2: Supabase-Konto anlegen (Region Frankfurt) und Zugangsdaten bereitstellen.
- 🔑 Vor Schritt 1 (für Live-URL): Vercel-Konto anlegen und mit dem GitHub-Repo verbinden.
- 🌱 Parallel, jederzeit: Community-Ansaat (Discord o. ä.) — Kanäle = Phasen, Threads = Projekte.

## Phase 0 — Fundament

**1. Projekt-Gerüst**
Next.js + TypeScript + Tailwind im Repo, Basis-Layout mit „Projector"-Kopfzeile, deutsche UI.
✅ Fertig: `npm run build` läuft fehlerfrei; Startseite zeigt „Projector" lokal (und nach Vercel-Verbindung unter der Live-URL).

**2. Supabase anbinden** 🔑
Supabase-Projekt (Frankfurt), Umgebungsvariablen lokal + Vercel, Verbindungs-Check.
✅ Fertig: Eine Testabfrage aus der App an Supabase liefert erfolgreich Daten zurück.

## Phase 1 — Konten

**3. Registrieren / Login / Logout / Passwort-Reset**
Mit E-Mail-Bestätigung (Supabase Auth), deutsche Texte.
✅ Fertig: Testkonto durchläuft komplett: registrieren → Bestätigungsmail → anmelden → abmelden → Passwort zurücksetzen.

**4. Profile**
Tabelle `profiles` (Name, Bio, Avatar, Skill-Tags) + Profilseite (eigenes bearbeiten, fremde ansehen).
✅ Fertig: Konto A ändert sein Profil; Konto B sieht die Änderung auf A's Profilseite; B kann A's Profil nicht bearbeiten.

## Phase 2 — Projekte

**5. Datenmodell Projekte + Zugriffsrechte (RLS)**
Tabellen `projects`, `project_members`; Row-Level-Security: öffentlich lesbar für alle, privat nur für Mitglieder, schreiben nur Host.
✅ Fertig: Automatisierte Tests belegen: Fremdkonto kann privates Projekt weder lesen noch ändern; öffentliches Projekt ist ohne Login lesbar.

**6. Projekt anlegen & bearbeiten**
Formular: Titel, Beschreibung, Kategorie, Titelbild, Phase, Sichtbarkeit. Phasenwechsel nur durch Host, beide Richtungen.
✅ Fertig: Projekt per UI anlegen, alle Felder ändern, Phase vor- und zurückschieben — als Nicht-Host sind diese Aktionen nicht möglich.

**7. Entdecken-Seite**
Drei Reiter (Brainstorming/Laufend/Fertig), Kategorie-Filter, Titelsuche, Sortierung nach Aktivität.
✅ Fertig: Öffentliches Projekt erscheint im Reiter seiner Phase und wandert bei Phasenwechsel; privates Projekt erscheint in keinem Reiter und keiner Suche.

**8. Einladungslink für private Projekte**
Host erzeugt/erneuert Link; wer ihm mit Konto folgt, wird Mitglied.
✅ Fertig: Konto B tritt per Link einem privaten Projekt bei und sieht es; ohne Link bleibt es für Konto C unsichtbar; Host kann den Link ungültig machen.

## Phase 3 — Brainstorming

**9. Ideen posten**
Idee (max. 1.000 Zeichen) auf Projektseite; bearbeiten/löschen nur durch Autor; Autor-Anzeige mit Profil-Link.
✅ Fertig: Konto B postet Idee auf A's öffentlichem Projekt; B kann sie ändern/löschen, A und C nicht (A kann sie später nur moderieren, Schritt 13).

**10. Antworten & Upvotes**
Flache Antworten auf Ideen; ein Upvote pro Nutzer pro Idee; Sortierung „Top"/„Neueste".
✅ Fertig: Doppel-Vote wird verhindert; Sortier-Umschalter ändert die Reihenfolge korrekt; Antworten haben keine weitere Verschachtelung.

**11. Host-Stern & Host-Updates**
Host markiert Ideen mit ⭐ (Datenbasis für spätere Credits); Host schreibt Status-Updates.
✅ Fertig: Nur der Host kann Stern setzen/entfernen und Updates posten; beides ist für Besucher sichtbar.

## Phase 4 — Sicherheit & Recht

**12. Melden + Admin-Bereich**
Melde-Knopf mit Grund auf Projekten/Ideen/Antworten/Profilen; Admin-Seite (nur Kira): Meldeliste, Inhalt ausblenden, Nutzer sperren.
✅ Fertig: Gemeldeter Inhalt lässt sich per Admin ausblenden (für alle unsichtbar); gesperrtes Konto kann sich nicht mehr anmelden/posten; Nicht-Admins erreichen die Admin-Seite nicht.

**13. Host-Moderation**
Host blendet Ideen/Antworten im eigenen Projekt aus und blockiert Nutzer projektweit.
✅ Fertig: Ausgeblendeter Beitrag ist für Besucher weg; blockierter Nutzer kann in diesem Projekt nichts mehr posten, in anderen Projekten aber schon.

**14. Spam-Bremsen**
Posten nur mit bestätigter E-Mail; Rate-Limit (z. B. max. 5 Ideen/Minute pro Konto).
✅ Fertig: Unbestätigtes Konto kann nicht posten; die 6. Idee innerhalb einer Minute wird mit verständlicher Meldung abgelehnt.

**15. Recht & Konto-Löschung**
Impressum- und Datenschutz-Seiten (Vorlagen, Platzhalter für Kiras Angaben); Konto-Selbstlöschung entfernt Zugang und eigene Inhalte.
✅ Fertig: Beide Seiten sind verlinkt und erreichbar; nach Konto-Löschung sind Login unmöglich und die Inhalte des Kontos verschwunden.

## Phase 5 — Politur & Launch

**16. Feinschliff**
Lade-Zitate (rotierende Kreativ-Zitate), mobile Darstellung aller Seiten, Leerzustände („Noch keine Ideen — leg los!").
✅ Fertig: Alle Seiten auf Handy-Breite geprüft; Zitate erscheinen beim Laden; keine leere Seite ohne erklärenden Text.

**17. Launch-Check**
Kompletter Testdurchlauf aller Kernflüsse mit zwei frischen Konten auf der Live-URL; Checkliste im PR dokumentiert.
✅ Fertig: Registrierung → Projekt (öffentlich + privat) → Einladung → Ideen/Votes/Stern → Melden/Admin → Konto löschen: alles grün auf der Live-Umgebung.

---

**Nicht in diesem Plan (bewusst):** Chat, Join-Anfragen/Bewerbungen (B) · Credits (C) ·
Shop/Echtgeld (D) · Bild-Uploads in Ideen · Social-Login · Mehrsprachigkeit · Push-Benachrichtigungen.
