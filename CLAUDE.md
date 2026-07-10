# Projector — Hinweise für Claude

- Sprache der UI und aller Nutzertexte: **Deutsch**.
- Freigegebenes Design: `docs/design/teilprojekt-a-design.md` — nicht ohne
  Rücksprache davon abweichen.
- Umsetzungsplan mit Fertig-Kriterien: `docs/plans/teilprojekt-a-plan.md` —
  Schritte in Reihenfolge, jeder endet mit Commit + Push auf
  `claude/project-collab-platform-p6c20m`.
- Scope-Grenzen: Kein Chat, keine Join-Anfragen, keine Credits, kein Shop —
  das sind spätere Teilprojekte (B–D). YAGNI strikt einhalten.
- Stack: Next.js App Router + TypeScript + Tailwind v4; Supabase (Auth,
  Postgres mit RLS, Region Frankfurt); Vercel.
- Vor jedem Commit: `npm run build` und `npm run lint` müssen fehlerfrei sein.
