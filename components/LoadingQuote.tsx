import { zufallsZitat } from "@/lib/quotes";

// Ladeanzeige mit rotierendem Kreativ-Zitat.
export default function LoadingQuote() {
  const zitat = zufallsZitat();
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <span
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
      />
      <blockquote className="max-w-md text-sm text-muted">
        „{zitat.text}“
        <footer className="mt-1 text-xs">— {zitat.autor}</footer>
      </blockquote>
      <span className="sr-only">Lädt …</span>
    </div>
  );
}
