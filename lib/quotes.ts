// Rotierende Kreativ-Zitate für Ladebildschirme.
export const ZITATE: { text: string; autor: string }[] = [
  {
    text: "Der beste Weg, eine gute Idee zu haben, ist, viele Ideen zu haben.",
    autor: "Linus Pauling",
  },
  {
    text: "Man kann ein Problem nicht mit der gleichen Denkweise lösen, durch die es entstanden ist.",
    autor: "Albert Einstein",
  },
  {
    text: "Kreativität ist Intelligenz, die Spaß hat.",
    autor: "unbekannt",
  },
  {
    text: "Wege entstehen dadurch, dass man sie geht.",
    autor: "Franz Kafka",
  },
  {
    text: "Wer immer tut, was er schon kann, bleibt immer das, was er schon ist.",
    autor: "Henry Ford",
  },
  {
    text: "Allein ist man schnell, gemeinsam kommt man weit.",
    autor: "Sprichwort",
  },
  {
    text: "Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben.",
    autor: "Eleanor Roosevelt",
  },
  {
    text: "Fang an, wo du stehst. Nutze, was du hast. Tu, was du kannst.",
    autor: "Arthur Ashe",
  },
  {
    text: "Eine Idee, die nicht geteilt wird, geht verloren.",
    autor: "unbekannt",
  },
  {
    text: "Perfektion ist nicht dann erreicht, wenn es nichts mehr hinzuzufügen gibt, sondern wenn man nichts mehr weglassen kann.",
    autor: "Antoine de Saint-Exupéry",
  },
];

export function zufallsZitat() {
  return ZITATE[Math.floor(Math.random() * ZITATE.length)];
}
