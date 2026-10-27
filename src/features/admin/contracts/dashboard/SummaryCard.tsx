import type { ReactNode } from "react";
import type { IconComponent } from "../../../../shared/components/icon";

export interface SummaryMeter {
  /** 0 to 1 */
  share: number;
  /** What the bar measures, for screen readers ("Share of contracted quantity dispatched") */
  label: string;
}

interface SummaryCardProps {
  tone: "blue" | "teal" | "green" | "orange";
  icon: IconComponent;
  label: string;
  /** The main figure, already formatted */
  value: string;
  /** Sub-text on the bottom line */
  note: ReactNode;
  meter?: SummaryMeter;
  /** Makes the whole card a button */
  onClick?: () => void;
  title?: string;
}

/**
 * One headline card of the contracts overview. Every card has the same four rows (label and icon, figure, bar, note),
 * so the four line up exactly and are the same height; a card without a bar keeps the row, empty.
 */
const SummaryCard = ({ tone, icon: Glyph, label, value, note, meter, onClick, title }: SummaryCardProps) => {
  const percent = meter ? Math.round(Math.min(1, Math.max(0, meter.share)) * 100) : 0;
  const body = (
    <>
      <span className="cd-card__label">{label}</span>
      <span className="cd-card__icon" aria-hidden>
        <Glyph size={16} />
      </span>
      <strong className="cd-card__value" title={value}>
        {value}
      </strong>
      {meter ? (
        <span className="cd-meter" role="progressbar" aria-label={meter.label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          {/* a non-zero share always shows at least a sliver */}
          <span className="cd-meter__fill" style={{ width: percent > 0 ? `max(${percent}%, 6px)` : "0" }} />
        </span>
      ) : (
        <span className="cd-meter cd-meter--none" aria-hidden />
      )}
      <span className="cd-card__note">{note}</span>
    </>
  );
  return onClick ? (
    <button type="button" className={`cd-card cd-card--button cd-tint--${tone}`} onClick={onClick} title={title}>
      {body}
    </button>
  ) : (
    <div className={`cd-card cd-tint--${tone}`}>{body}</div>
  );
};

export default SummaryCard;
