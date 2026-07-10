# Projector — Launch-Check (Schritt 17)

Der Code für Teilprojekt A ist komplett gebaut (Schritte 1–16, statisch
verifiziert: Build, Lint, Routen-Verhalten, Mobile-Check bei 375 px).
Für den Launch-Check fehlen noch **vier Dinge, die nur Kira tun kann** —
danach läuft der komplette Testdurchlauf unten.

## Vorbereitung (einmalig, ~15 Minuten)

1. **Migration einspielen:** Supabase → SQL Editor → kompletten Inhalt von
   `supabase/migrations/0001_init.sql` einfügen → Run.
   (Details: `supabase/README.md`)
2. **Auth-URLs setzen:** Supabase → Authentication → URL Configuration:
   Site URL = Vercel-Live-URL; Redirect URLs: `https://<live-domain>/auth/callback`
   und `http://localhost:3000/auth/callback`. „Confirm email" bleibt AN.
3. **Vercel verbinden:** Repo importieren (Branch
   `claude/project-collab-platform-p6c20m`), die zwei Env-Variablen aus
   `.env.example` mit den echten Werten eintragen, deployen.
   Danach zusätzlich `NEXT_PUBLIC_SITE_URL` = Live-URL setzen (für korrekte
   Einladungslinks).
4. **Admin-Rechte:** Nach der eigenen Registrierung das SQL aus
   `supabase/README.md` („Admin-Rechte vergeben") ausführen.

**Automatisierter RLS-Test (Schritt-5-Kriterium):** Zwei bestätigte
Testkonten anlegen (Dashboard → Authentication → Add user → „Auto Confirm
User"), dann:

```bash
TEST_A_EMAIL=… TEST_A_PASSWORT=… TEST_B_EMAIL=… TEST_B_PASSWORT=… \
  node scripts/rls-check.mjs
```

Alle Checks müssen ✅ zeigen.

## Testdurchlauf (zwei frische Konten, auf der Live-URL)

Konto A = Host, Konto B = Mitmacherin. Jede Zeile abhaken.

### Konten (Schritte 3–4)
- [ ] A registriert sich → Bestätigungsmail kommt an → Link → Anmelden klappt.
- [ ] Ohne Bestätigung ist kein Anmelden möglich (vorher testen!).
- [ ] A meldet sich ab und wieder an; Passwort-Reset-Flow funktioniert.
- [ ] A füllt Profil aus (Name, Bio, Skills); B sieht A's Profil, kann es
      aber nicht bearbeiten (kein Bearbeiten-Knopf, /einstellungen zeigt nur eigenes).

### Projekte (Schritte 5–8)
- [ ] A legt öffentliches Projekt an (Brainstorming) → erscheint auf
      Entdecken im richtigen Reiter; Kategorie-Filter und Titelsuche finden es.
- [ ] A legt privates Projekt an → taucht in keinem Reiter/keiner Suche auf;
      B kann die Projekt-URL nicht öffnen (404).
- [ ] A wechselt Phase vor und zurück → Projekt wandert zwischen Reitern.
- [ ] B öffnet A's Einladungslink → wird Mitglied → sieht das private Projekt.
- [ ] A erneuert den Link → alter Link zeigt „ungültig".
- [ ] A entfernt B als Mitglied → B sieht das Projekt nicht mehr.

### Brainstorming (Schritte 9–11)
- [ ] B postet Idee im öffentlichen Projekt; B kann sie bearbeiten/löschen,
      A und ein drittes Konto nicht.
- [ ] B antwortet auf eine Idee (flach, keine Verschachtelung möglich).
- [ ] A und B voten; zweiter Klick nimmt den Vote zurück; „Top"/„Neueste"
      sortiert korrekt um.
- [ ] Nur A (Host) sieht Stern-Knopf; Stern ist für alle sichtbar.
- [ ] Nur A kann Updates posten; Updates sind für Besucher sichtbar.

### Moderation & Sicherheit (Schritte 12–14)
- [ ] B meldet eine Idee → Meldung erscheint in /admin (nur für Kira erreichbar,
      B bekommt Redirect).
- [ ] Admin blendet Idee aus → für Besucher weg, Autor sieht sie mit Hinweis.
- [ ] Admin sperrt Testkonto → dessen nächster Seitenaufruf loggt aus,
      Anmelden zeigt „gesperrt".
- [ ] Host blendet eine Antwort aus; Host blockiert B → B kann in diesem
      Projekt nichts mehr posten, in anderen Projekten schon.
- [ ] 6 Ideen in einer Minute → die 6. wird mit Rate-Limit-Meldung abgelehnt.

### Recht & Konto (Schritt 15)
- [ ] Impressum + Datenschutz sind im Footer verlinkt und erreichbar
      (Platzhalter vor dem echten Launch ersetzen!).
- [ ] B löscht sein Konto (LÖSCHEN tippen) → Anmelden unmöglich, B's Ideen/
      Antworten/Votes sind verschwunden.

### Abschluss
- [ ] `/status`-Seite aus dem Code entfernen (letzter Commit von Schritt 17).
- [ ] Diese Checkliste im PR dokumentieren.
