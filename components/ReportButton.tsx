import Link from "next/link";
import type { MeldungsTyp } from "@/lib/types";

// Führt zur Melde-Seite mit vorbefülltem Ziel.
export default function ReportButton({
  typ,
  zielId,
  zurueck,
  className = "text-xs text-muted hover:underline",
}: {
  typ: MeldungsTyp;
  zielId: string;
  zurueck: string;
  className?: string;
}) {
  const query = new URLSearchParams({ typ, id: zielId, zurueck });
  return (
    <Link href={`/melden?${query.toString()}`} className={className}>
      Melden
    </Link>
  );
}
