import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next-16-Konvention: proxy.ts (früher middleware.ts). Frischt auf jeder
// Anfrage die Auth-Session auf und loggt gesperrte Nutzer aus.
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Alles außer statischen Dateien und Bildern.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
