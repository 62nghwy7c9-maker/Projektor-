// Verbindungs-Check zu Supabase. Diese Seite macht eine echte Anfrage an
// deine Supabase-Instanz und zeigt, ob URL und Key funktionieren.
// Aufrufbar unter /status auf der Live-URL (Vercel) oder lokal.
export const dynamic = "force-dynamic";

async function pruefeVerbindung(): Promise<{
  ok: boolean;
  detail: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      ok: false,
      detail:
        "Umgebungsvariablen fehlen (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).",
    };
  }

  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, detail: `Supabase antwortete mit HTTP ${res.status}.` };
    }
    await res.json();
    return { ok: true, detail: "Supabase hat erfolgreich geantwortet." };
  } catch (e) {
    return {
      ok: false,
      detail: `Verbindung fehlgeschlagen: ${
        e instanceof Error ? e.message : String(e)
      }`,
    };
  }
}

export default async function StatusSeite() {
  const { ok, detail } = await pruefeVerbindung();
  return (
    <div className="flex flex-col gap-4 py-8">
      <h1 className="text-2xl font-bold">Verbindungs-Check</h1>
      <div
        className={`rounded-xl border p-5 ${
          ok ? "border-green-500/50" : "border-red-500/50"
        }`}
      >
        <p className="text-lg font-semibold">
          {ok ? "✅ Verbindung zu Supabase steht" : "❌ Keine Verbindung"}
        </p>
        <p className="mt-1 text-sm text-muted">{detail}</p>
      </div>
      <p className="text-sm text-muted">
        Diese Seite ist nur für die Einrichtung gedacht und wird später
        entfernt.
      </p>
    </div>
  );
}
