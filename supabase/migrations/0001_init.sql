-- ============================================================================
-- Projector — Teilprojekt A: komplettes Datenmodell (Migration 0001)
--
-- Anwendung: Diese Datei komplett in den Supabase SQL-Editor einfügen und
-- einmalig ausführen ("Run"). Sie ist idempotent NICHT — nur einmal ausführen.
--
-- Sicherheit lebt hier: Jede Tabelle hat Row-Level-Security (RLS).
-- Cross-cutting-Aktionen (Beitritt per Token, Host-Stern, Verstecken, Blocken,
-- Admin, Konto-Löschung) laufen über security-definer-Funktionen (RPCs),
-- die ihre Berechtigung explizit prüfen.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabellen
-- ----------------------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  bio          text not null default '' check (char_length(bio) <= 500),
  avatar_url   text,
  skills       text[] not null default '{}',
  is_admin     boolean not null default false,
  is_banned    boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  host_id          uuid not null references public.profiles (id) on delete cascade,
  title            text not null check (char_length(title) between 1 and 120),
  description      text not null default '' check (char_length(description) <= 5000),
  category         text not null check (category in ('technik', 'kreatives', 'soziales', 'business')),
  visibility       text not null default 'public' check (visibility in ('public', 'private')),
  phase            text not null default 'brainstorming' check (phase in ('brainstorming', 'laufend', 'fertig')),
  cover_url        text,
  invite_token     uuid not null default gen_random_uuid(),
  ideas_closed     boolean not null default false,
  is_hidden        boolean not null default false, -- nur Admin (Moderation)
  last_activity_at timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null default 'member' check (role in ('host', 'member')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.ideas (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  is_starred boolean not null default false, -- nur Host (Datenbasis für Credits, Runde C)
  is_hidden  boolean not null default false, -- Host/Admin (Moderation)
  created_at timestamptz not null default now()
);

create table public.idea_replies (
  id         uuid primary key default gen_random_uuid(),
  idea_id    uuid not null references public.ideas (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.idea_votes (
  idea_id    uuid not null references public.ideas (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id) -- verhindert Doppel-Votes
);

create table public.project_updates (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.project_blocks (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('project', 'idea', 'reply', 'profile')),
  target_id   uuid not null,
  reason      text not null check (char_length(reason) between 1 and 1000),
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz not null default now()
);

create index ideas_project_idx on public.ideas (project_id, created_at desc);
create index ideas_author_recent_idx on public.ideas (author_id, created_at desc);
create index idea_replies_idea_idx on public.idea_replies (idea_id, created_at);
create index idea_votes_idea_idx on public.idea_votes (idea_id);
create index projects_discover_idx on public.projects (visibility, phase, last_activity_at desc);
create index project_members_user_idx on public.project_members (user_id);
create index reports_status_idx on public.reports (status, created_at desc);

-- ----------------------------------------------------------------------------
-- 2. Helfer-Funktionen (security definer → laufen als Besitzer, umgehen RLS;
--    deshalb prüfen alle RPCs ihre Berechtigung explizit)
-- ----------------------------------------------------------------------------

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from profiles p where p.id = uid), false);
$$;

create or replace function public.is_banned(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_banned from profiles p where p.id = uid), false);
$$;

create or replace function public.is_host(pid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects p where p.id = pid and p.host_id = uid);
$$;

create or replace function public.is_member(pid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from project_members m where m.project_id = pid and m.user_id = uid);
$$;

create or replace function public.is_blocked(pid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from project_blocks b where b.project_id = pid and b.user_id = uid);
$$;

-- Projekt lesbar: öffentlich (und nicht versteckt) ODER Mitglied/Host ODER Admin.
create or replace function public.project_readable(pid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from projects p
    where p.id = pid
      and (
        (p.visibility = 'public' and p.is_hidden = false)
        or p.host_id = uid
        or public.is_member(pid, uid)
        or public.is_admin(uid)
      )
  );
$$;

-- Ideen-Bereich offen: Phase Brainstorming, oder Laufend ohne "Ideen geschlossen".
create or replace function public.ideas_open(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from projects p
    where p.id = pid
      and (p.phase = 'brainstorming' or (p.phase = 'laufend' and p.ideas_closed = false))
  );
$$;

-- Idee lesbar (inkl. Verstecken-Logik) — für Votes/Antworten.
create or replace function public.idea_readable(iid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from ideas i
    where i.id = iid
      and public.project_readable(i.project_id, uid)
      and (i.is_hidden = false or i.author_id = uid
           or public.is_host(i.project_id, uid) or public.is_admin(uid))
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. Trigger
-- ----------------------------------------------------------------------------

-- Bei Auth-Signup automatisch die Profilzeile anlegen (Standard-Supabase-Muster).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
             split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Host wird bei Projekt-Anlage automatisch Mitglied mit Rolle host.
create or replace function public.create_host_membership()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.host_id, 'host');
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute function public.create_host_membership();

-- Schutz der Moderations-Spalten in profiles: nur Admins ändern is_admin/is_banned.
create or replace function public.protect_profile_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.is_admin is distinct from old.is_admin
      or new.is_banned is distinct from old.is_banned)
     and not public.is_admin(auth.uid()) then
    raise exception 'Nur Admins dürfen is_admin/is_banned ändern.';
  end if;
  return new;
end;
$$;

create trigger protect_profile_flags
  before update on public.profiles
  for each row execute function public.protect_profile_flags();

-- Schutz der Moderations-Spalten in projects: nur Admins ändern is_hidden.
create or replace function public.protect_project_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_hidden is distinct from old.is_hidden
     and not public.is_admin(auth.uid()) then
    raise exception 'Nur Admins dürfen Projekte ausblenden.';
  end if;
  return new;
end;
$$;

create trigger protect_project_flags
  before update on public.projects
  for each row execute function public.protect_project_flags();

-- Schutz von Stern/Verstecken auf Ideen: Stern nur Host, Verstecken Host/Admin.
create or replace function public.protect_idea_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_starred is distinct from old.is_starred
     and not public.is_host(new.project_id, auth.uid()) then
    raise exception 'Nur der Host darf den Stern setzen.';
  end if;
  if new.is_hidden is distinct from old.is_hidden
     and not (public.is_host(new.project_id, auth.uid()) or public.is_admin(auth.uid())) then
    raise exception 'Nur Host oder Admin dürfen Beiträge ausblenden.';
  end if;
  return new;
end;
$$;

create trigger protect_idea_flags
  before update on public.ideas
  for each row execute function public.protect_idea_flags();

-- Schutz von Verstecken auf Antworten: nur Host/Admin.
create or replace function public.protect_reply_flags()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if new.is_hidden is distinct from old.is_hidden then
    select i.project_id into pid from ideas i where i.id = new.idea_id;
    if not (public.is_host(pid, auth.uid()) or public.is_admin(auth.uid())) then
      raise exception 'Nur Host oder Admin dürfen Beiträge ausblenden.';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_reply_flags
  before update on public.idea_replies
  for each row execute function public.protect_reply_flags();

-- Spam-Bremse: höchstens 5 Ideen pro Minute pro Konto.
create or replace function public.enforce_idea_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from ideas
      where author_id = new.author_id
        and created_at > now() - interval '1 minute') >= 5 then
    raise exception 'Rate-Limit erreicht: höchstens 5 Ideen pro Minute. Bitte kurz durchatmen.';
  end if;
  return new;
end;
$$;

create trigger enforce_idea_rate_limit
  before insert on public.ideas
  for each row execute function public.enforce_idea_rate_limit();

-- Aktivität fürs Sortieren: neue Idee/Antwort/Update frischt das Projekt auf.
create or replace function public.touch_project_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if tg_table_name = 'idea_replies' then
    select i.project_id into pid from ideas i where i.id = new.idea_id;
  else
    pid := new.project_id;
  end if;
  update projects set last_activity_at = now() where id = pid;
  return new;
end;
$$;

create trigger touch_activity_on_idea
  after insert on public.ideas
  for each row execute function public.touch_project_activity();

create trigger touch_activity_on_reply
  after insert on public.idea_replies
  for each row execute function public.touch_project_activity();

create trigger touch_activity_on_update
  after insert on public.project_updates
  for each row execute function public.touch_project_activity();

-- ----------------------------------------------------------------------------
-- 4. Row-Level-Security
-- ----------------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.ideas           enable row level security;
alter table public.idea_replies    enable row level security;
alter table public.idea_votes      enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_blocks  enable row level security;
alter table public.reports         enable row level security;

-- profiles: alle lesen (Autornamen), nur eigene Zeile ändern (Flags via Trigger geschützt).
create policy profiles_select on public.profiles
  for select using (true);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- projects
create policy projects_select on public.projects
  for select using (
    (visibility = 'public' and is_hidden = false)
    or host_id = auth.uid()
    or public.is_member(id, auth.uid())
    or public.is_admin(auth.uid())
  );
create policy projects_insert on public.projects
  for insert with check (
    host_id = auth.uid() and not public.is_banned(auth.uid())
  );
create policy projects_update on public.projects
  for update using (host_id = auth.uid() or public.is_admin(auth.uid()))
  with check (host_id = auth.uid() or public.is_admin(auth.uid()));
create policy projects_delete on public.projects
  for delete using (host_id = auth.uid() or public.is_admin(auth.uid()));

-- project_members: Mitglieder sehen die Liste; Beitritt NUR via RPC join_via_invite;
-- Host entfernt Mitglieder, Nutzer verlassen selbst (Host-Zeile bleibt).
create policy members_select on public.project_members
  for select using (
    public.is_member(project_id, auth.uid()) or public.is_admin(auth.uid())
  );
create policy members_delete on public.project_members
  for delete using (
    role <> 'host'
    and (public.is_host(project_id, auth.uid()) or user_id = auth.uid())
  );

-- ideas
create policy ideas_select on public.ideas
  for select using (
    public.project_readable(project_id, auth.uid())
    and (is_hidden = false or author_id = auth.uid()
         or public.is_host(project_id, auth.uid()) or public.is_admin(auth.uid()))
  );
create policy ideas_insert on public.ideas
  for insert with check (
    author_id = auth.uid()
    and public.project_readable(project_id, auth.uid())
    and public.ideas_open(project_id)
    and not public.is_banned(auth.uid())
    and not public.is_blocked(project_id, auth.uid())
  );
create policy ideas_update on public.ideas
  for update using (
    author_id = auth.uid()
    or public.is_host(project_id, auth.uid())
    or public.is_admin(auth.uid())
  )
  with check (
    author_id = auth.uid()
    or public.is_host(project_id, auth.uid())
    or public.is_admin(auth.uid())
  );
create policy ideas_delete on public.ideas
  for delete using (author_id = auth.uid() or public.is_admin(auth.uid()));

-- idea_replies
create policy replies_select on public.idea_replies
  for select using (
    public.idea_readable(idea_id, auth.uid())
    and (is_hidden = false or author_id = auth.uid()
         or public.is_admin(auth.uid())
         or exists (select 1 from public.ideas i
                    where i.id = idea_id and public.is_host(i.project_id, auth.uid())))
  );
create policy replies_insert on public.idea_replies
  for insert with check (
    author_id = auth.uid()
    and public.idea_readable(idea_id, auth.uid())
    and not public.is_banned(auth.uid())
    and exists (select 1 from public.ideas i
                where i.id = idea_id
                  and public.ideas_open(i.project_id)
                  and not public.is_blocked(i.project_id, auth.uid()))
  );
create policy replies_update on public.idea_replies
  for update using (
    author_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (select 1 from public.ideas i
               where i.id = idea_id and public.is_host(i.project_id, auth.uid()))
  )
  with check (
    author_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (select 1 from public.ideas i
               where i.id = idea_id and public.is_host(i.project_id, auth.uid()))
  );
create policy replies_delete on public.idea_replies
  for delete using (author_id = auth.uid() or public.is_admin(auth.uid()));

-- idea_votes: ein Vote pro Nutzer/Idee (PK), nur eigene Zeile.
create policy votes_select on public.idea_votes
  for select using (public.idea_readable(idea_id, auth.uid()));
create policy votes_insert on public.idea_votes
  for insert with check (
    user_id = auth.uid()
    and public.idea_readable(idea_id, auth.uid())
    and not public.is_banned(auth.uid())
  );
create policy votes_delete on public.idea_votes
  for delete using (user_id = auth.uid());

-- project_updates: lesbar wie das Projekt; schreiben nur Host.
create policy updates_select on public.project_updates
  for select using (public.project_readable(project_id, auth.uid()));
create policy updates_insert on public.project_updates
  for insert with check (
    author_id = auth.uid() and public.is_host(project_id, auth.uid())
  );
create policy updates_update on public.project_updates
  for update using (public.is_host(project_id, auth.uid()))
  with check (public.is_host(project_id, auth.uid()));
create policy updates_delete on public.project_updates
  for delete using (public.is_host(project_id, auth.uid()) or public.is_admin(auth.uid()));

-- project_blocks: nur Host (und Admin) sieht/verwaltet — Verwaltung via RPC.
create policy blocks_select on public.project_blocks
  for select using (public.is_host(project_id, auth.uid()) or public.is_admin(auth.uid()));

-- reports: eingeloggte melden; nur Admin liest/bearbeitet.
create policy reports_insert on public.reports
  for insert with check (
    reporter_id = auth.uid() and not public.is_banned(auth.uid())
  );
create policy reports_select on public.reports
  for select using (public.is_admin(auth.uid()));
create policy reports_update on public.reports
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 5. RPCs (security definer, prüfen ihre Berechtigung explizit)
-- ----------------------------------------------------------------------------

-- Beitritt per Einladungslink. Gibt die Projekt-ID zurück.
create or replace function public.join_via_invite(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if auth.uid() is null then
    raise exception 'Bitte melde dich an, um beizutreten.';
  end if;
  if public.is_banned(auth.uid()) then
    raise exception 'Dieses Konto ist gesperrt.';
  end if;
  select id into pid from projects where invite_token = p_token;
  if pid is null then
    raise exception 'Dieser Einladungslink ist ungültig oder wurde erneuert.';
  end if;
  if public.is_blocked(pid, auth.uid()) then
    raise exception 'Du wurdest vom Host dieses Projekts blockiert.';
  end if;
  insert into project_members (project_id, user_id, role)
  values (pid, auth.uid(), 'member')
  on conflict (project_id, user_id) do nothing;
  return pid;
end;
$$;

-- Host-Stern (Datenbasis für Credits in Runde C).
create or replace function public.set_idea_starred(p_idea_id uuid, p_starred boolean)
returns void language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  select project_id into pid from ideas where id = p_idea_id;
  if pid is null or not public.is_host(pid, auth.uid()) then
    raise exception 'Nur der Host darf den Stern setzen.';
  end if;
  update ideas set is_starred = p_starred where id = p_idea_id;
end;
$$;

-- Host-Moderation: Idee oder Antwort im eigenen Projekt aus-/einblenden.
create or replace function public.set_content_hidden(p_type text, p_id uuid, p_hidden boolean)
returns void language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if p_type = 'idea' then
    select project_id into pid from ideas where id = p_id;
  elsif p_type = 'reply' then
    select i.project_id into pid from idea_replies r join ideas i on i.id = r.idea_id
    where r.id = p_id;
  else
    raise exception 'Unbekannter Inhaltstyp.';
  end if;
  if pid is null or not public.is_host(pid, auth.uid()) then
    raise exception 'Nur der Host darf Beiträge in seinem Projekt ausblenden.';
  end if;
  if p_type = 'idea' then
    update ideas set is_hidden = p_hidden where id = p_id;
  else
    update idea_replies set is_hidden = p_hidden where id = p_id;
  end if;
end;
$$;

-- Host blockiert/entblockiert einen Nutzer projektweit (Mitgliedschaft endet).
create or replace function public.block_user(p_project_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_host(p_project_id, auth.uid()) then
    raise exception 'Nur der Host darf Nutzer blockieren.';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Du kannst dich nicht selbst blockieren.';
  end if;
  insert into project_blocks (project_id, user_id)
  values (p_project_id, p_user_id)
  on conflict (project_id, user_id) do nothing;
  delete from project_members
  where project_id = p_project_id and user_id = p_user_id and role <> 'host';
end;
$$;

create or replace function public.unblock_user(p_project_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_host(p_project_id, auth.uid()) then
    raise exception 'Nur der Host darf Blockierungen aufheben.';
  end if;
  delete from project_blocks where project_id = p_project_id and user_id = p_user_id;
end;
$$;

-- Einladungslink erneuern (macht den alten ungültig). Gibt den neuen Token zurück.
create or replace function public.regenerate_invite_token(p_project_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_token uuid;
begin
  if not public.is_host(p_project_id, auth.uid()) then
    raise exception 'Nur der Host darf den Einladungslink erneuern.';
  end if;
  new_token := gen_random_uuid();
  update projects set invite_token = new_token where id = p_project_id;
  return new_token;
end;
$$;

-- Admin: Inhalt aus-/einblenden (project/idea/reply).
create or replace function public.admin_set_hidden(p_type text, p_id uuid, p_hidden boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Nur Admins dürfen das.';
  end if;
  if p_type = 'project' then
    update projects set is_hidden = p_hidden where id = p_id;
  elsif p_type = 'idea' then
    update ideas set is_hidden = p_hidden where id = p_id;
  elsif p_type = 'reply' then
    update idea_replies set is_hidden = p_hidden where id = p_id;
  else
    raise exception 'Unbekannter Inhaltstyp.';
  end if;
end;
$$;

-- Admin: Nutzer sperren/entsperren.
create or replace function public.admin_ban_user(p_user_id uuid, p_banned boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Nur Admins dürfen sperren.';
  end if;
  update profiles set is_banned = p_banned where id = p_user_id;
end;
$$;

-- Admin: Meldung als erledigt markieren (oder wieder öffnen).
create or replace function public.admin_resolve_report(p_report_id uuid, p_resolved boolean default true)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Nur Admins dürfen Meldungen bearbeiten.';
  end if;
  update reports set status = case when p_resolved then 'resolved' else 'open' end
  where id = p_report_id;
end;
$$;

-- Konto-Selbstlöschung (DSGVO): löscht den Auth-Nutzer; alle eigenen Inhalte
-- verschwinden über die on-delete-cascade-Ketten (Profil, Projekte, Ideen, …).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet.';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
