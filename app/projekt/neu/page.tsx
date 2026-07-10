import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projektAnlegen } from "@/app/projekt/actions";
import ProjektFormularFelder from "@/components/ProjektFormularFelder";
import { Fehler } from "@/components/Hinweis";

export const metadata = { title: "Projekt starten — Projector" };

export default async function ProjektNeuSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { fehler } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold">Projekt starten</h1>
      <Fehler code={fehler} />
      <form action={projektAnlegen} className="flex flex-col gap-4">
        <ProjektFormularFelder />
        <button type="submit" className="btn-primary self-start">
          Projekt anlegen
        </button>
      </form>
    </div>
  );
}
