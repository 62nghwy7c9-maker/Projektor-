// Hand-geschriebene Typen passend zum Schema in supabase/migrations/0001_init.sql.

export type Kategorie = "technik" | "kreatives" | "soziales" | "business";
export type Sichtbarkeit = "public" | "private";
export type Phase = "brainstorming" | "laufend" | "fertig";
export type MeldungsTyp = "project" | "idea" | "reply" | "profile";
export type MeldungsStatus = "open" | "resolved";

export interface Profile {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  skills: string[];
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category: Kategorie;
  visibility: Sichtbarkeit;
  phase: Phase;
  cover_url: string | null;
  invite_token: string;
  ideas_closed: boolean;
  is_hidden: boolean;
  last_activity_at: string;
  created_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: "host" | "member";
  created_at: string;
}

export interface Idea {
  id: string;
  project_id: string;
  author_id: string;
  body: string;
  is_starred: boolean;
  is_hidden: boolean;
  created_at: string;
}

export interface IdeaReply {
  id: string;
  idea_id: string;
  author_id: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
}

export interface IdeaVote {
  idea_id: string;
  user_id: string;
  created_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: MeldungsTyp;
  target_id: string;
  reason: string;
  status: MeldungsStatus;
  created_at: string;
}

// Deutsche Anzeigenamen für die festen Listen.
export const KATEGORIEN: Record<Kategorie, string> = {
  technik: "Technik",
  kreatives: "Kreatives",
  soziales: "Soziales",
  business: "Business",
};

export const PHASEN: Record<Phase, { label: string; emoji: string }> = {
  brainstorming: { label: "Brainstorming", emoji: "💡" },
  laufend: { label: "Laufend", emoji: "🚧" },
  fertig: { label: "Fertig", emoji: "✅" },
};
