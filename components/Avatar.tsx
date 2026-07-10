// Avatar mit Initialen-Fallback, wenn kein Bild gesetzt ist.
export default function Avatar({
  url,
  name,
  size = 40,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const initiale = (name.trim()[0] ?? "?").toUpperCase();
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- freie Nutzer-URLs, keine Domain-Allowlist für next/image
      <img
        src={url}
        alt={`Avatar von ${name}`}
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-border object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initiale}
    </span>
  );
}
