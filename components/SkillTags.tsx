export default function SkillTags({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <li
          key={skill}
          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
        >
          {skill}
        </li>
      ))}
    </ul>
  );
}
