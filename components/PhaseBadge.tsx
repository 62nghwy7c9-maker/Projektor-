import { PHASEN, type Phase } from "@/lib/types";

const FARBEN: Record<Phase, string> = {
  brainstorming: "border-amber-500/50 bg-amber-500/10",
  laufend: "border-sky-500/50 bg-sky-500/10",
  fertig: "border-green-500/50 bg-green-500/10",
};

export default function PhaseBadge({ phase }: { phase: Phase }) {
  const { label, emoji } = PHASEN[phase];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${FARBEN[phase]}`}
    >
      {emoji} {label}
    </span>
  );
}
