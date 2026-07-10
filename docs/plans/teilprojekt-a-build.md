# Projector — Technischer Bauplan Teilprojekt A

Companion zu `teilprojekt-a-plan.md` (17 Schritte, Fertig-Kriterien) und
`../design/teilprojekt-a-design.md` (freigegebenes Design). Dieses Dokument ist
die **konkrete Bau-Anleitung**, die eine Session mit **geöffneter Netzwerk-Policy**
(Ausgang zu `*.supabase.co` erlaubt) Schritt für Schritt umsetzt und dabei live
gegen Supabase verifiziert.

## Kontext

- **Warum:** Kira will die vollständige, allein nutzbare App (Teilprojekt A) —
  nicht mehr Schritt-für-Schritt-Häppchen. Scope bleibt strikt A: **kein Chat,
  keine Join-Anfragen, keine Credits, kein Shop** (B–D später).
- **Ist-Stand:** Fundament steht (Schritt 1 fertig; Schritt 2 code-seitig:
  `lib/supabase/client.ts` + `server.ts`, `.env.example`, `/status`). Alles ab
  Schritt 3 fehlt komplett (Auth, Profile, Projekte, Ideen, Moderation, Admin,
  DB-Schema).
- **Verifikationsmodus:** Diese Umgebung blockiert Supabase-Egress. Der Bau +
  die Live-Prüfung passieren in einer neuen Session mit geöffneter Policy.

## Architektur-Entscheidungen

- **Next.js App Router, Server-Components-first.** Daten werden serverseitig mit
  dem Supabase-Server-Client geladen; Mutationen laufen über **Server Actions**
  (`app/**/actions.ts`) mit der Session des Nutzers → **RLS erzwingt die Rechte**.
  Kein separates API-Backend (YAGNI).
- **Sicherheit lebt in der Datenbank (RLS), nicht nur im UI.** Jede Tabelle hat
  Row-Level-Security. Cross-cutting-/spaltenweise Aktionen (Host-Stern, Verstecken,
  Sperren, Beitritt per Token, Admin) laufen über `security definer`-Funktionen
  (RPCs), die gezielt prüfen — so kann das UI nichts umgehen.
- **DB-Schema als versionierte SQL-Migration** im Repo unter `supabase/migrations/`.
  Anwendung: In den Supabase **SQL-Editor** einfügen und ausführen (einmalig,
  ~1 Min, keine Secrets im Chat nötig). Datei bleibt im Repo als Quelle der Wahrheit.
- **E-Mail-Bestätigung** über Supabase-Auth-Einstellung „Confirm email" → wer
  nicht bestätigt hat, bekommt keine Session und kann per RLS nichts posten.

## Datenmodell (`supabase/migrations/0001_init.sql`)

| Tabelle | Zweck | Kernspalten |
|---|---|---|
| `profiles` | 1:1 zu `auth.users` | `id` (PK=auth.uid), `display_name`, `bio`, `avatar_url`, `skills text[]`, `is_admin bool`, `is_banned bool`, `created_at` |
| `projects` | Projekt | `id`, `host_id→profiles`, `title`, `description`, `category` (technik/kreatives/soziales/business), `visibility` (public/private), `phase` (brainstorming/laufend/fertig), `cover_url`, `invite_token uuid`, `ideas_closed bool`, `last_activity_at`, `created_at` |
| `project_members` | Mitgliedschaft | PK(`project_id`,`user_id`), `role` (host/member) |
| `ideas` | Brainstorming-Idee | `id`, `project_id`, `author_id`, `body` (≤1000 Zeichen, CHECK), `is_starred bool`, `is_hidden bool`, `created_at` |
| `idea_replies` | flache Antwort | `id`, `idea_id`, `author_id`, `body`, `is_hidden bool`, `created_at` |
| `idea_votes` | Upvote | PK(`idea_id`,`user_id`) → ein Vote pro Nutzer/Idee |
| `project_updates` | Host-Status-Post | `id`, `project_id`, `author_id`, `body`, `created_at` |
| `project_blocks` | Host blockt Nutzer im Projekt | PK(`project_id`,`user_id`) |
| `reports` | Meldung | `id`, `reporter_id`, `target_type` (project/idea/reply/profile), `target_id`, `reason`, `status` (open/resolved), `created_at` |

**Trigger/Funktionen:**
- `handle_new_user()` (`security definer`): legt bei Auth-Signup automatisch die
  `profiles`-Zeile an (Standard-Supabase-Muster).
- `create_host_membership()`: bei `projects`-INSERT Host als `project_members`
  (role=host) eintragen + `invite_token` initialisieren.
- `enforce_idea_rate_limit()` (BEFORE INSERT ideas): >5 Ideen/Minute pro Autor →
  Exception (Spam-Bremse).
- `touch_project_activity()`: aktualisiert `projects.last_activity_at` bei neuer
  Idee/Antwort/Update (für Sortierung „nach Aktivität").
- `is_admin(uid)` / Helfer zum Prüfen von Mitgliedschaft/Host.

## RLS-Policies (Kern)

- **profiles:** SELECT für alle (Autornamen sichtbar). UPDATE nur eigene Zeile
  (`auth.uid()=id`), ohne `is_admin`/`is_banned` (Trigger schützt diese Spalten).
- **projects:** SELECT wenn `visibility='public'` ODER Mitglied. INSERT wenn
  eingeloggt und `host_id=auth.uid()`. UPDATE/DELETE nur Host (deckt Phasenwechsel,
  `ideas_closed`, Sichtbarkeit, Token-Erneuerung ab).
- **project_members:** SELECT für Projektmitglieder. INSERT nur via RPC
  `join_via_invite(token)`. DELETE: Host entfernt Mitglieder / Nutzer verlässt selbst.
- **ideas:** SELECT wenn Projekt lesbar UND (`is_hidden=false` ODER Autor/Host).
  INSERT wenn Projekt lesbar, Phase erlaubt Ideen (`brainstorming`, oder `laufend`
  mit `ideas_closed=false`), Nutzer nicht geblockt und nicht gebannt. UPDATE/DELETE
  nur Autor (eigener `body`). Host-Aktionen via RPC.
- **idea_replies:** analog zu ideas (flach, eine Ebene).
- **idea_votes:** SELECT wenn Idee lesbar; INSERT/DELETE nur eigene Zeile; PK
  verhindert Doppel-Vote.
- **project_updates:** SELECT wenn Projekt lesbar; INSERT/UPDATE/DELETE nur Host.
- **reports:** INSERT eingeloggt (`reporter_id=auth.uid()`); SELECT/UPDATE nur Admin.
- **project_blocks:** SELECT/verwalten nur Host.

**RPCs (`security definer`, gezielt geprüft):**
`join_via_invite(token)`, `set_idea_starred(idea_id,bool)` (nur Host),
`set_content_hidden(type,id,bool)` (Host fürs eigene Projekt),
`block_user`/`unblock_user(project_id,user_id)` (nur Host),
`admin_set_hidden(...)`, `admin_ban_user(user_id,bool)`, `admin_resolve_report(id)`
(nur Admin), `delete_my_account()` (löscht eigene Inhalte + Auth-Nutzer).

## Routen & Seiten

| Route | Inhalt | Mutationen (Server Action / RPC) |
|---|---|---|
| `/` | Entdecken: 3 Reiter (Brainstorming/Laufend/Fertig), Kategorie-Filter, Titelsuche, Sortierung nach Aktivität | — (nur Lesen, öffentliche Projekte) |
| `/projekt/neu` | Projekt anlegen (Login nötig) | `createProject` |
| `/projekt/[id]` | Projektdetail: Kopf (Titel, Phase-Badge, Kategorie, Host, Sichtbarkeit), Beschreibung, Ideen-Liste + Formular, Host-Updates, Bearbeiten-Knopf für Host | Ideen posten/edit/löschen, Vote, Antwort, Melden; Host: Stern, Verstecken, Update, Phase, Ideen schließen, Blocken |
| `/projekt/[id]/bearbeiten` | Projekt bearbeiten (Host) | `updateProject`, `setPhase`, `regenerateInvite` |
| `/projekt/beitreten/[token]` | Beitritt per Einladungslink | `join_via_invite` |
| `/profil/[id]` | Profil ansehen (Name, Bio, Skill-Tags) | — |
| `/einstellungen` | Eigenes Profil bearbeiten + Konto löschen | `updateProfile`, `delete_my_account` |
| `/anmelden`, `/registrieren` | Login / Registrierung | Supabase Auth |
| `/passwort-vergessen`, `/passwort-neu` | Reset anfordern / neu setzen | Supabase Auth |
| `/auth/callback` | Route Handler: Code→Session (E-Mail-Bestätigung, Reset) | — |
| `/admin` | Admin-Dashboard: Meldeliste + Aktionen (ausblenden, sperren, erledigt) | Admin-RPCs |
| `/impressum`, `/datenschutz` | Rechtstexte (Vorlagen mit Platzhaltern) | — |

**Infrastruktur:** `middleware.ts` + `lib/supabase/middleware.ts` (Session-Refresh
nach `@supabase/ssr`; gebannte Nutzer ausloggen). Auth-bewusster Header im Layout
(Server-Component liest `getUser()`, zeigt Anmelden/Registrieren bzw. Profil/Abmelden
+ „Projekt starten").

**Komponenten (`components/`):** `ProjectCard`, `PhaseBadge`, `IdeaItem`,
`VoteButton`, `ReplyList`, `ReportButton`, `EmptyState` (Leerzustände),
`LoadingQuote` (Lade-Zitate aus `lib/quotes.ts`), Formular-Bausteine.
**Typen:** `lib/types.ts` (hand-geschrieben passend zum Schema; optional später
`supabase gen types`).

## Bau-Reihenfolge (auf die 17 Schritte gemappt)

1. **Schritt 2 verifizieren** (Env neu, `/status` = ✅) → dann Schema anlegen.
2. **Migration 0001** (Schritt 4/5-Basis): alle Tabellen, RLS, Funktionen, Trigger
   in den SQL-Editor; danach `profiles` + Profilseiten (Schritt 4).
3. **Auth** (Schritt 3): Middleware, `/registrieren` `/anmelden` `/passwort-*`,
   `/auth/callback`, auth-bewusster Header, Supabase-Auth-Settings (Confirm email,
   Site-URL, Redirects).
4. **Projekte** (Schritte 5–8): CRUD, Entdecken-Seite, Einladungslink; RLS-Test-Script.
5. **Brainstorming** (Schritte 9–11): Ideen, Antworten/Votes, Host-Stern/Updates.
6. **Sicherheit & Recht** (Schritte 12–15): Melden+Admin, Host-Moderation,
   Spam-Bremsen (Trigger + Confirm-email), Rechtstexte + Konto-Löschung.
7. **Politur & Launch** (Schritte 16–17): Lade-Zitate, Mobile, Leerzustände,
   `/status` entfernen, Launch-Check.

Jeder Schritt endet wie gehabt mit **Commit + Push** auf
`claude/project-collab-platform-p6c20m`, nachdem sein Fertig-Kriterium **live**
geprüft wurde.

## Verifikation (in der offenen Session)

- **Statisch:** `npm run build`, `npm run lint`, `npx tsc --noEmit` grün.
- **Schema:** Migration im SQL-Editor ausgeführt, keine Fehler.
- **Auth-Settings:** „Confirm email" an; Site-URL + Redirect-URLs auf localhost/Vercel.
- **RLS-Test-Script** (`scripts/rls-check.mjs`): meldet sich als zwei Testnutzer an
  und prüft automatisiert: Fremder sieht privates Projekt nicht, kann es nicht ändern;
  öffentliches ist ohne Login lesbar; Doppel-Vote scheitert; Rate-Limit greift.
  → erfüllt das „automatisierte Tests"-Kriterium aus Schritt 5.
- **E2E manuell** mit zwei frischen Konten: Registrieren→Bestätigen→Login; Projekt
  öffentlich+privat; Einladung; Ideen/Vote/Antwort/Stern; Phasenwechsel; Melden→Admin
  ausblenden; Host-Block; Konto löschen. = Launch-Check (Schritt 17).

## Was nur Kira tun kann

1. **Netzwerk-Policy öffnen:** Umgebung bearbeiten → Network access = **Custom** →
   Allowed domains `*.supabase.co` → Häkchen „include default package managers" →
   speichern. (Alternative: **Full**.)
2. **Neue Session** auf Branch `claude/project-collab-platform-p6c20m` starten und
   die zwei Supabase-Werte (Project URL + Publishable Key) angeben → ich lege
   `.env.local` neu an.
3. **Migration ausführen:** die von mir erzeugte `0001_init.sql` in Supabase →
   SQL-Editor einfügen und „Run". (Ich führe dich durch.)
4. **Supabase-Auth-Settings** setzen (mache ich mit dir zusammen).
5. **Vercel** verbinden für die Live-URL (optional, aber empfohlen); die zwei
   Env-Variablen dort eintragen.
