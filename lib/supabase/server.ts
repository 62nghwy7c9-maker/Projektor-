import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase-Client für Server Components, Route Handler und Server Actions.
// Liest und schreibt die Auth-Cookies über Next.js.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Aufruf aus einer Server Component ohne Schreibzugriff — kann
            // ignoriert werden, wenn die Middleware die Sitzung auffrischt.
          }
        },
      },
    },
  );
}
