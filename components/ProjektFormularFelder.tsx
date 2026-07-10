import { KATEGORIEN, PHASEN, type Project } from "@/lib/types";

// Gemeinsame Formularfelder für "Projekt anlegen" und "Projekt bearbeiten".
export default function ProjektFormularFelder({
  projekt,
}: {
  projekt?: Project;
}) {
  return (
    <>
      <div>
        <label htmlFor="titel" className="label">
          Titel
        </label>
        <input
          id="titel"
          name="titel"
          type="text"
          required
          maxLength={120}
          defaultValue={projekt?.title ?? ""}
          className="input mt-1"
          placeholder="Wie heißt dein Projekt?"
        />
      </div>
      <div>
        <label htmlFor="beschreibung" className="label">
          Beschreibung
        </label>
        <textarea
          id="beschreibung"
          name="beschreibung"
          rows={6}
          maxLength={5000}
          defaultValue={projekt?.description ?? ""}
          className="input mt-1"
          placeholder="Worum geht es? Wen suchst du? Was ist das Ziel?"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="kategorie" className="label">
            Kategorie
          </label>
          <select
            id="kategorie"
            name="kategorie"
            required
            defaultValue={projekt?.category ?? ""}
            className="input mt-1"
          >
            <option value="" disabled>
              Bitte wählen …
            </option>
            {Object.entries(KATEGORIEN).map(([wert, label]) => (
              <option key={wert} value={wert}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="phase" className="label">
            Phase
          </label>
          <select
            id="phase"
            name="phase"
            defaultValue={projekt?.phase ?? "brainstorming"}
            className="input mt-1"
          >
            {Object.entries(PHASEN).map(([wert, { label, emoji }]) => (
              <option key={wert} value={wert}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset>
        <legend className="label">Sichtbarkeit</legend>
        <div className="mt-1 flex flex-col gap-2 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="sichtbarkeit"
              value="public"
              defaultChecked={(projekt?.visibility ?? "public") === "public"}
              className="mt-0.5"
            />
            <span>
              <strong>Öffentlich</strong> — jeder kann das Projekt sehen,
              mitmachen nur mit Konto.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="sichtbarkeit"
              value="private"
              defaultChecked={projekt?.visibility === "private"}
              className="mt-0.5"
            />
            <span>
              <strong>Privat</strong> — nur du und Personen mit deinem
              Einladungslink.
            </span>
          </label>
        </div>
      </fieldset>
      <div>
        <label htmlFor="cover_url" className="label">
          Titelbild-URL (optional, https)
        </label>
        <input
          id="cover_url"
          name="cover_url"
          type="url"
          defaultValue={projekt?.cover_url ?? ""}
          className="input mt-1"
          placeholder="https://…"
        />
      </div>
    </>
  );
}
