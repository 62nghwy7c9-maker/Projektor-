import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Frischt die Auth-Session auf (Muster aus @supabase/ssr) und loggt
// gesperrte Nutzer aus.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Wichtig: getUser() validiert das Token und hält die Session frisch.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profil } = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("id", user.id)
      .single();
    if (profil?.is_banned) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/anmelden";
      url.search = "?fehler=gesperrt";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
