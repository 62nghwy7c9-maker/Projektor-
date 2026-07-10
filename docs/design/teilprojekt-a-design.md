# Projector — Design Teilprojekt A (freigegeben)

Stand: 2026-07-10 · Status: **Von Kira freigegeben** (alle 5 Abschnitte einzeln bestätigt)

## Gesamtvision & Schnitt

Projector ist eine Plattform, auf der Menschen Projekte starten, gemeinsam brainstormen
und später zusammenarbeiten. Das Gesamtvorhaben ist in vier Teilprojekte geschnitten:

| Teil | Inhalt | Status |
|---|---|---|
| **A** | Nutzer, Projekte in 3 Phasen, Brainstorming/Ideen, Moderation | **Dieses Design** |
| B | Join-Anfragen, Bewerbungen mit Skills, Chat/Gruppenchat | Spätere Design-Runde |
| C | Credits verdienen (Host-Bewertung von Beiträgen) | Spätere Design-Runde |
| D | Shop für fertige Produkte, Credits gegen Echtgeld | Spätere Design-Runde, rechtlich prüfen |

**Gewählter Ansatz (aus 3 Alternativen):** Zweigleisig — eigene Web-App bauen und
parallel die Community kostenlos auf einer bestehenden Plattform (z. B. Discord) ansäen,
damit die App nicht leer startet. Der Community-Aufbau ist Kiras Aufgabe, nicht Teil des Bauplans.

**Bestätigte Annahmen:** UI auf Deutsch · Start auf Gratis-Stufen (~0 €/Monat) ·
Name „Projector" · Nur der Host verschiebt Phasen · Erste Nutzer: offene Community ab Tag 1 ·
Plattform: mobil-optimierte Web-App · Erstellung: Kira + KI, wartungsarme Technik.

## 1. Nutzer, Rollen & Sichtbarkeit

- **Konto:** E-Mail + Passwort über Supabase Auth (inkl. Passwort-Reset, E-Mail-Bestätigung). Kein Social-Login zum Start.
- **Profil:** Anzeigename, Avatar, Kurz-Bio, Skill-Tags (in A reine Anzeige; Bewerbungen kommen in B).
- **Sichtbarkeit pro Projekt, genau zwei Stufen:**
  - **Öffentlich:** jeder liest (auch ohne Konto); mitmachen nur mit Konto.
  - **Privat:** nur über Einladungslink des Hosts erreichbar („mit Familie teilbar").
- **Rollen pro Projekt:** Host (Ersteller, verwaltet alles), Mitglied (in A nur via Einladungslink), Besucher.
- **Plattformweit:** Admin (Kira) für Moderation.
- Bewusst gestrichen: Kreise-/Gruppensystem, Follower, Social-Login.

## 2. Projekte & Phasen

Projekt = Titel, Beschreibung, optionales Titelbild, Kategorie (feste Liste:
Technik / Kreatives / Soziales / Business), Sichtbarkeit, genau eine Phase.

| Phase | Zweck | Sichtbarkeit bei „öffentlich" |
|---|---|---|
| 💡 Brainstorming | Idee sammeln, Interesse testen | alles offen, jeder mit Konto steuert Ideen bei |
| 🚧 Laufend | Umsetzung | Beschreibung + Host-Updates öffentlich; Ideen-Bereich vom Host schließbar; interner Arbeitsbereich = Runde B |
| ✅ Fertig | Ergebnis präsentieren | Vorstellungsseite öffentlich; Details/Dateien nur für Mitglieder; Kauf = Runde C/D |

- **Host-Updates:** kurze Status-Posts des Hosts in laufenden Projekten.
- **Phasenwechsel:** nur Host, beide Richtungen, kein Genehmigungsprozess.
- **Entdecken (Startseite):** drei Reiter (Brainstorming/Laufend/Fertig), Kategorie-Filter,
  Titelsuche, Sortierung nach Aktivität. Private Projekte erscheinen dort nie.

## 3. Brainstorming & Ideen

- **Idee:** Textbeitrag bis ~1.000 Zeichen. Keine Bild-Uploads zum Start (Moderations-/Speicherrisiko).
- **Genau drei Interaktionen:**
  1. **Antworten** — flach, eine Ebene, keine Verschachtelung.
  2. **👍 Upvotes** — ein Vote pro Nutzer pro Idee; Sortierung „Top" / „Neueste".
  3. **⭐ Host-Stern** — Host markiert aufgegriffene Ideen. Dieses Signal ist die spätere
     Grundlage der Credit-Vergabe in Runde C (wird jetzt gespeichert, aber nicht bewertet).
- Eigene Beiträge bearbeiten/löschen. Autor mit Name + Avatar, verlinkt aufs Profil (Skill-Tags sichtbar).

## 4. Moderation & Sicherheit

- **Melden:** eingeloggte Nutzer melden Projekte/Ideen/Antworten/Profile mit Grund.
- **Admin-Bereich (nur Kira):** Meldeliste, Inhalt ausblenden, Nutzer sperren.
- **Host-Moderation:** Host blendet Beiträge im eigenen Projekt aus und blockiert Nutzer projektweit.
- **Spam-Bremsen:** Posten erst nach bestätigter E-Mail; Rate-Limits (z. B. max. 5 Ideen/Minute).
- **Recht (DE):** Impressum + Datenschutzerklärung als Seiten (Vorlagen, finale Verantwortung bei Kira),
  Datenhaltung EU (Supabase Frankfurt), Konto-Selbstlöschung inkl. eigener Inhalte (DSGVO).
- Bewusst gestrichen: KI-Inhaltsfilter, Wort-Blacklists, Karma-Systeme.

## 5. Technik & Seitenaufbau

| Baustein | Wahl | Begründung |
|---|---|---|
| Web-App | Next.js + TypeScript + Tailwind auf Vercel | verbreitetster Stack, KI-baubar, Gratis-Stufe |
| Auth/DB/Rechte | Supabase (Postgres + RLS), Region Frankfurt | fertiger Dienst, kein Eigenbetrieb, EU |
| Code | GitHub-Repo `Projektor-` | vorhanden |

Zukunftssicher ohne Vorbau: Supabase Realtime → Chat (B); Credits → Tabellen (C); Stripe → (D).

**Seiten:** Entdecken · Projektseite · Projekt anlegen/bearbeiten (inkl. Einladungslink) ·
Profil ansehen/bearbeiten (inkl. Konto löschen) · Registrieren/Login/Reset ·
Admin-Bereich · Impressum/Datenschutz · **Lade-Zitate** (rotierende Kreativ-Zitate auf Ladebildschirmen).
