import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export default function NichtGefunden() {
  return (
    <div className="py-12">
      <EmptyState
        emoji="🔍"
        titel="Seite nicht gefunden"
        text="Diese Seite existiert nicht (mehr) — oder du hast keinen Zugriff darauf."
      >
        <Link href="/" className="btn-primary mt-2">
          Zur Startseite
        </Link>
      </EmptyState>
    </div>
  );
}
