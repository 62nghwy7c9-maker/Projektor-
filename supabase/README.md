# Supabase — Datenbank-Migrationen

Die Dateien in `migrations/` sind die **Quelle der Wahrheit** für das
Datenbank-Schema (Tabellen, Row-Level-Security, Trigger, RPCs).

## Migration ausführen (einmalig, ~1 Minute)

1. Supabase-Dashboard öffnen → Projekt auswählen → **SQL Editor**.
2. Den kompletten Inhalt von `migrations/0001_init.sql` einfügen.
3. **Run** klicken. Es darf kein Fehler erscheinen („Success. No rows returned").

Danach existieren alle Tabellen und die App kann sie benutzen.

## Admin-Rechte vergeben (nur Kira)

Nach der eigenen Registrierung einmalig im SQL Editor ausführen
(E-Mail-Adresse anpassen):

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'kira.moewes@gmx.de');
```

## Auth-Einstellungen (Dashboard → Authentication)

- **Sign In / Up → Confirm email: AN** (ist Standard) — wer seine E-Mail nicht
  bestätigt, bekommt keine Session und kann nichts posten.
- **URL Configuration → Site URL:** die Vercel-Live-URL
  (lokal zusätzlich `http://localhost:3000` unter Redirect URLs eintragen).
- **Redirect URLs:** `http://localhost:3000/auth/callback` und
  `https://<live-domain>/auth/callback`.
