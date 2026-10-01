import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiCreditCard, FiFileText, FiHome, FiTruck, FiUser } from "react-icons/fi";
import type { PendingContractRow } from "./pendingContracts.data";
import "./ContractDashboard.scss";

const qty = (value: number) => `${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })} MT`;
const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** Contract status as the table shows it: a contract that has started dispatching is "Pending", one that has not is "Open". */
export const contractStatus = (row: PendingContractRow) => (row.dQtyValue > 0 ? "Pending" : "Open");

interface Totals {
  contracts: number;
  total: number;
  dispatched: number;
  arranged: number;
  pending: number;
}

const sumOf = (rows: PendingContractRow[]): Totals =>
  rows.reduce(
    (acc, row) => ({
      contracts: acc.contracts + 1,
      total: acc.total + row.cQtyValue,
      dispatched: acc.dispatched + row.dQtyValue,
      arranged: acc.arranged + row.aQtyValue,
      pending: acc.pending + row.pQtyValue,
    }),
    { contracts: 0, total: 0, dispatched: 0, arranged: 0, pending: 0 },
  );

/** Quantity split of one contract (or of all of them) as a stacked bar: despatched | arranged | still pending. */
const SplitBar = ({ dispatched, arranged, pending, large = false }: { dispatched: number; arranged: number; pending: number; large?: boolean }) => {
  const whole = dispatched + arranged + pending;
  const width = (value: number) => `${whole > 0 ? (value / whole) * 100 : 0}%`;
  return (
    <div className={`cd-split${large ? " cd-split--large" : ""}`} role="img" aria-label={`Despatched ${qty(dispatched)}, arranged ${qty(arranged)}, pending ${qty(pending)}`}>
      <span className="cd-split__seg cd-split__seg--dispatched" style={{ width: width(dispatched) }} />
      <span className="cd-split__seg cd-split__seg--arranged" style={{ width: width(arranged) }} />
      <span className="cd-split__seg cd-split__seg--pending" style={{ width: width(pending) }} />
    </div>
  );
};

/** Headline numbers of whatever the filters currently show, and the overall progress. */
export const DashboardSummary = ({ rows }: { rows: PendingContractRow[] }) => {
  const totals = useMemo(() => sumOf(rows), [rows]);
  const tiles = [
    { key: "contracts", label: "Contracts", value: String(totals.contracts), note: `${rows.filter((r) => contractStatus(r) === "Open").length} open · ${rows.filter((r) => contractStatus(r) === "Pending").length} pending` },
    { key: "total", label: "Total Quantity", value: qty(totals.total), note: "contracted" },
    { key: "dispatched", label: "Despatched", value: qty(totals.dispatched), note: `${percent(totals.dispatched, totals.total)}% of total` },
    { key: "arranged", label: "Arranged", value: qty(totals.arranged), note: `${percent(totals.arranged, totals.total)}% of total` },
    { key: "pending", label: "Pending", value: qty(totals.pending), note: `${percent(totals.pending, totals.total)}% still to arrange` },
  ];
  return (
    <section className="cd-summary" aria-label="Summary">
      <div className="cd-tiles">
        {tiles.map((tile) => (
          <div key={tile.key} className={`cd-tile cd-tile--${tile.key}`}>
            <span className="cd-tile__label">{tile.label}</span>
            <strong className="cd-tile__value">{tile.value}</strong>
            <span className="cd-tile__note">{tile.note}</span>
          </div>
        ))}
      </div>
      <div className="cd-progress">
        <div className="cd-progress__head">
          <strong>Overall progress</strong>
          <span>{percent(totals.dispatched, totals.total)}% despatched</span>
        </div>
        <SplitBar dispatched={totals.dispatched} arranged={totals.arranged} pending={totals.pending} large />
        <div className="cd-legend">
          <span><i className="cd-dot cd-dot--dispatched" /> Despatched {qty(totals.dispatched)}</span>
          <span><i className="cd-dot cd-dot--arranged" /> Arranged {qty(totals.arranged)}</span>
          <span><i className="cd-dot cd-dot--pending" /> Pending {qty(totals.pending)}</span>
        </div>
      </div>
    </section>
  );
};

interface BarItem {
  label: string;
  value: number;
  note?: string;
}

const BarList = ({ title, subtitle, items, empty }: { title: string; subtitle: string; items: BarItem[]; empty: string }) => {
  const max = Math.max(...items.map((item) => item.value), 0);
  return (
    <div className="cd-panel">
      <div className="cd-panel__head">
        <h3>{title}</h3>
        <span>{subtitle}</span>
      </div>
      {items.length === 0 ? (
        <p className="cd-panel__empty">{empty}</p>
      ) : (
        <ul className="cd-bars">
          {items.map((item) => (
            <li key={item.label}>
              <div className="cd-bars__label">
                <span title={item.label}>{item.label}</span>
                <strong>{qty(item.value)}</strong>
              </div>
              <div className="cd-bars__track">
                <span style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }} />
              </div>
              {item.note && <small>{item.note}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Where the pending quantity is: the buyers and sellers with the most still to arrange, and by delivery schedule. */
export const DashboardInsights = ({ rows }: { rows: PendingContractRow[] }) => {
  const groups = useMemo(() => {
    const group = (keyOf: (row: PendingContractRow) => string, top?: number): BarItem[] => {
      const map = new Map<string, { value: number; count: number }>();
      rows.forEach((row) => {
        const key = keyOf(row) || "-";
        const current = map.get(key) ?? { value: 0, count: 0 };
        map.set(key, { value: current.value + row.pQtyValue, count: current.count + 1 });
      });
      const items = [...map.entries()].map(([label, v]) => ({ label, value: v.value, note: `${v.count} contract${v.count === 1 ? "" : "s"}` }));
      items.sort((a, b) => b.value - a.value);
      return (top ? items.slice(0, top) : items).filter((item) => item.value > 0);
    };
    return { buyers: group((r) => r.buyer, 5), sellers: group((r) => r.seller, 5), schedules: group((r) => r.deliverySchedule) };
  }, [rows]);
  return (
    <section className="cd-insights" aria-label="Pending quantity">
      <BarList title="Pending by buyer" subtitle="Top 5" items={groups.buyers} empty="Nothing pending." />
      <BarList title="Pending by seller" subtitle="Top 5" items={groups.sellers} empty="Nothing pending." />
      <BarList title="Pending by delivery schedule" subtitle="All schedules" items={groups.schedules} empty="Nothing pending." />
    </section>
  );
};

/** One contract as a card: who, what, how far along, and the way into the trucks. */
export const ContractCards = ({ rows, onOpenTruckDetails, emptyMessage }: { rows: PendingContractRow[]; onOpenTruckDetails: (row: PendingContractRow) => void; emptyMessage: string }) => {
  if (rows.length === 0) return <p className="cd-empty">{emptyMessage}</p>;
  return (
    <div className="cd-cards">
      {rows.map((row) => {
        const status = contractStatus(row);
        return (
          <article key={row.id} className="cd-card">
            <header className="cd-card__head">
              <Link to={`/contracts/${row.id}`} className="cd-card__id">
                <FiFileText aria-hidden /> {row.id}
              </Link>
              <span className={`cd-chip cd-chip--${status.toLowerCase()}`}>{status}</span>
            </header>
            <p className="cd-card__product">{row.product}</p>
            <div className="cd-card__parties">
              <span title={row.seller}><FiHome aria-hidden /> {row.seller}</span>
              <span title={row.buyer}><FiUser aria-hidden /> {row.buyer}</span>
            </div>

            <div className="cd-card__qty">
              <div className="cd-card__qty-head">
                <strong>{row.cQty}</strong>
                <span>{percent(row.dQtyValue, row.cQtyValue)}% despatched</span>
              </div>
              <SplitBar dispatched={row.dQtyValue} arranged={row.aQtyValue} pending={row.pQtyValue} />
              <dl className="cd-card__nums">
                <div><dt><i className="cd-dot cd-dot--dispatched" /> Despatched</dt><dd>{row.dQty}</dd></div>
                <div><dt><i className="cd-dot cd-dot--arranged" /> Arranged</dt><dd>{row.aQty}</dd></div>
                <div><dt><i className="cd-dot cd-dot--pending" /> Pending</dt><dd>{row.pQty}</dd></div>
              </dl>
            </div>

            <div className="cd-card__meta">
              <span><FiCalendar aria-hidden /> {row.fromDate} – {row.toDate}</span>
              <span><FiCreditCard aria-hidden /> {row.paymentType}</span>
              <span className="cd-chip cd-chip--plain">{row.deliverySchedule}</span>
              <span className="cd-card__rate">{row.cRate}/kg</span>
            </div>

            <footer className="cd-card__foot">
              <span className="cd-card__date">Contract date {row.date}</span>
              <button type="button" className="cd-card__btn" onClick={() => onOpenTruckDetails(row)}>
                <FiTruck aria-hidden /> Truck details
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
};
