import type { ReactNode } from "react";
import { statusTone, text, type Tone } from "./format";

/** Small presentational pieces shared by the contract detail tabs. */

export const Pill = ({ children, tone }: { children: ReactNode; tone?: Tone }) => (
  <span className={`cd-pill cd-pill--${tone ?? "neutral"}`}>{children}</span>
);

export const StatusPill = ({ status }: { status: string | null | undefined }) => (
  <Pill tone={statusTone(status)}>{text(status)}</Pill>
);

export const Card = ({ title, action, children }: { title?: ReactNode; action?: ReactNode; children: ReactNode }) => (
  <section className="cd-card">
    {(title || action) && (
      <header className="cd-card__head">
        {title && <h2>{title}</h2>}
        {action}
      </header>
    )}
    <div className="cd-card__body">{children}</div>
  </section>
);

export const Field = ({ label, value, wide }: { label: string; value: ReactNode; wide?: boolean }) => (
  <div className={`cd-field${wide ? " cd-field--wide" : ""}`}>
    <span className="cd-field__label">{label}</span>
    <div className="cd-field__value">{value === null || value === undefined || value === "" ? "—" : value}</div>
  </div>
);

export const FieldGrid = ({ children }: { children: ReactNode }) => <div className="cd-grid">{children}</div>;

export const Empty = ({ children }: { children: ReactNode }) => <p className="cd-empty">{children}</p>;

/** Horizontally scrollable table wrapper so wide tables never break the page on small screens. */
export const TableWrap = ({ children }: { children: ReactNode }) => (
  <div className="cd-table-wrap">
    <table className="cd-table">{children}</table>
  </div>
);

export const Kpi = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}) => (
  <div className={`cd-kpi${tone ? ` cd-kpi--${tone}` : ""}`}>
    <span className="cd-kpi__label">{label}</span>
    <strong className="cd-kpi__value">{value}</strong>
    {hint && <span className="cd-kpi__hint">{hint}</span>}
  </div>
);

export const Progress = ({ label, value, total, valueLabel }: { label: string; value: number; total: number; valueLabel: string }) => {
  const width = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
  return (
    <div className="cd-progress">
      <div className="cd-progress__row">
        <span>{label}</span>
        <strong>{valueLabel}</strong>
      </div>
      <div className="cd-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(width)} aria-label={label}>
        <div className="cd-progress__bar" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};
