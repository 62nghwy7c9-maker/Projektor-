import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { abmelden } from "@/app/auth/actions";

// Auth-bewusster Seitenkopf: zeigt je nach Anmeldestatus die passenden Links.
export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let anzeigename: string | null = null;
  let istAdmin = false;
  if (user) {
    const { data: profil } = await supabase
      .from("profiles")
      .select("display_name, is_admin")
      .eq("id", user.id)
      .single();
    anzeigename = profil?.display_name ?? null;
    istAdmin = profil?.is_admin ?? false;
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          💡 Projector
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
          <Link href="/" className="hover:underline">
            Entdecken
          </Link>
          {user ? (
            <>
              <Link href="/projekt/neu" className="hover:underline">
                Projekt starten
              </Link>
              {istAdmin && (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
              <Link
                href={`/profil/${user.id}`}
                className="max-w-32 truncate font-medium hover:underline"
                title={anzeigename ?? "Profil"}
              >
                {anzeigename ?? "Profil"}
              </Link>
              <form action={abmelden}>
                <button type="submit" className="text-muted hover:underline">
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/anmelden" className="hover:underline">
                Anmelden
              </Link>
              <Link
                href="/registrieren"
                className="rounded-lg bg-accent px-3 py-1.5 font-medium text-white hover:opacity-90"
              >
                Registrieren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
