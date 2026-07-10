import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import SkillTags from "@/components/SkillTags";
import ReportButton from "@/components/ReportButton";
import { Hinweis } from "@/components/Hinweis";

export const metadata = { title: "Profil — Projector" };

export default async function ProfilSeite({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hinweis?: string }>;
}) {
  const { id } = await params;
  const { hinweis } = await searchParams;
  const supabase = await createClient();

  const { data: profil } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single<Profile>();
  if (!profil) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const istEigenes = user?.id === profil.id;

  return (
    <div className="flex flex-col gap-6 py-8">
      <Hinweis code={hinweis} />
      <div className="flex items-start gap-4">
        <Avatar url={profil.avatar_url} name={profil.display_name} size={64} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{profil.display_name}</h1>
          <p className="text-xs text-muted">
            Dabei seit{" "}
            {new Date(profil.created_at).toLocaleDateString("de-DE", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {istEigenes ? (
          <Link href="/einstellungen" className="btn ml-auto shrink-0">
            Profil bearbeiten
          </Link>
        ) : (
          user && (
            <span className="ml-auto shrink-0">
              <ReportButton
                typ="profile"
                zielId={profil.id}
                zurueck={`/profil/${profil.id}`}
              />
            </span>
          )
        )}
      </div>
      {profil.bio ? (
        <p className="max-w-prose whitespace-pre-line text-sm">{profil.bio}</p>
      ) : (
        <p className="text-sm text-muted">
          {istEigenes
            ? "Du hast noch keine Bio geschrieben — erzähl den anderen, wer du bist!"
            : "Hier steht noch keine Bio."}
        </p>
      )}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Skills</h2>
        {profil.skills.length > 0 ? (
          <SkillTags skills={profil.skills} />
        ) : (
          <p className="text-sm text-muted">Noch keine Skills eingetragen.</p>
        )}
      </div>
    </div>
  );
}
