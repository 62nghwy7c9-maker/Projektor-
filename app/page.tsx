const phasen = [
  {
    emoji: "💡",
    titel: "Brainstorming",
    text: "Ideen und potentielle Projekte — offen für alle. Jeder kann mitdenken und Ideen beisteuern.",
  },
  {
    emoji: "🚧",
    titel: "Laufend",
    text: "Projekte in der Umsetzung. Verfolge Updates der Hosts und schau zu, wie Ideen Wirklichkeit werden.",
  },
  {
    emoji: "✅",
    titel: "Fertig",
    text: "Abgeschlossene Projekte und fertige Ergebnisse, präsentiert von ihren Teams.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-10 py-8">
      <section className="flex flex-col gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Gemeinsam Projekte erschaffen
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          Projector ist der kreative Workspace für kollektive Projekte: Starte
          deine Idee, brainstorme mit anderen und setzt sie zusammen um.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {phasen.map((p) => (
          <div
            key={p.titel}
            className="rounded-xl border border-border p-5 text-left"
          >
            <div className="text-2xl">{p.emoji}</div>
            <h2 className="mt-2 font-semibold">{p.titel}</h2>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </div>
        ))}
      </section>
      <p className="text-center text-sm text-muted">
        Die Plattform entsteht gerade — bald kannst du hier Projekte entdecken
        und eigene starten.
      </p>
    </div>
  );
}
