import { useId } from "react";

interface Props {
  id?: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  hint?: string;
  suffix?: string;
}

/** Numeric input — spinners hidden, clean and spacious. */
export function NumberField({ id: providedId, label, value, onChange, min = 0, max, hint, suffix }: Props) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const hintId = hint ? `${id}-hint` : undefined;

  // Show blank instead of "0" so user doesn't have to delete it first
  const displayValue = value === 0 ? "" : value.toString();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
      <label htmlFor={id} style={{
        fontSize: 11, fontWeight: 600, color: "var(--text-3)",
        textTransform: "uppercase", letterSpacing: "0.07em"
      }}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type="number"
          id={id}
          className="field"
          value={displayValue}
          min={min}
          max={max}
          aria-describedby={hintId}
          style={{ paddingRight: suffix ? 44 : 14 }}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") { onChange(0); return; }
            const num = Number(v);
            if (!isNaN(num)) onChange(num);
          }}
        />
        {suffix && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 11, fontWeight: 600, color: "var(--text-3)",
            pointerEvents: "none", userSelect: "none",
          }}>
            {suffix}
          </span>
        )}
      </div>

      {hint && (
        <p id={hintId} style={{ fontSize: 10, color: "var(--text-3)", margin: 0 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
