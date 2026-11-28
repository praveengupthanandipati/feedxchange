import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { InfoIcon } from "../../../../shared/components/icon";
import type { InvoiceDeduction } from "../../../../core/store/sellerInvoiceApi";
import { money, shortDate } from "./sellerBuyerAccounts.data";

interface AdjustmentsInfoProps {
  invoiceNumber: string;
  lines: InvoiceDeduction[];
}

const CARD_WIDTH = 288;

/**
 * An info icon next to an invoice's adjustments total: hover or focus shows every adjustment line (date, deduction / addition,
 * TDS/TCS, remarks, amount). The card is drawn on the page itself, so the report table's scroll box does not cut it off.
 */
const AdjustmentsInfo = ({ invoiceNumber, lines }: AdjustmentsInfoProps) => {
  const anchor = useRef<HTMLSpanElement>(null);
  const [place, setPlace] = useState<{ top: number; left: number; above: boolean } | null>(null);

  const show = () => {
    const box = anchor.current?.getBoundingClientRect();
    if (!box) return;
    const left = Math.min(Math.max(8, box.right - CARD_WIDTH), window.innerWidth - CARD_WIDTH - 8);
    const above = box.bottom + 40 + lines.length * 44 > window.innerHeight;
    setPlace({ top: above ? box.top - 6 : box.bottom + 6, left, above });
  };
  const hide = () => setPlace(null);

  const deducted = lines.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0);
  const added = lines.filter((l) => l.amount < 0).reduce((s, l) => s - l.amount, 0);

  return (
    <span
      ref={anchor}
      className="sba-adj-info"
      tabIndex={0}
      aria-label={`Adjustments on invoice ${invoiceNumber}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <InfoIcon aria-hidden />
      {place &&
        createPortal(
          <div
            className={`sba-adj-card ${place.above ? "is-above" : ""}`}
            role="tooltip"
            style={{ top: place.top, left: place.left, width: CARD_WIDTH }}
          >
            <div className="sba-adj-card__title">Adjustments · {invoiceNumber}</div>
            <ul className="sba-adj-card__list">
              {lines.map((line) => (
                <li key={line.deductionId}>
                  <div className="sba-adj-card__row">
                    <span>
                      {shortDate(line.date)} · {line.amount < 0 ? "Addition" : "Deduction"}
                      {line.isTdsTcs && <span className="sba-adj-card__tag">TDS/TCS</span>}
                    </span>
                    <strong>{line.amount < 0 ? `+ ${money(-line.amount)}` : `− ${money(line.amount)}`}</strong>
                  </div>
                  {line.remarks && <div className="sba-adj-card__remarks">{line.remarks}</div>}
                </li>
              ))}
            </ul>
            <div className="sba-adj-card__total">
              {deducted > 0 && <span>Deducted {money(deducted)}</span>}
              {added > 0 && <span>Added {money(added)}</span>}
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
};

export default AdjustmentsInfo;
