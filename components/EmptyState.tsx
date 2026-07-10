// Leerzustand mit erklärendem Text — keine Seite bleibt kommentarlos leer.
export default function EmptyState({
  emoji = "🌱",
  titel,
  text,
  children,
}: {
  emoji?: string;
  titel: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <p className="font-semibold">{titel}</p>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {children}
    </div>
  );
}
