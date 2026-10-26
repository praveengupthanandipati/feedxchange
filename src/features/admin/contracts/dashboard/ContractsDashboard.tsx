import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PendingContractApiResponse } from "../../../../core/store/contractsApi";
import { CircleAlertIcon, ClockIcon, FileTextIcon, PackageIcon, TriangleAlertIcon, TruckIcon, XIcon } from "../../../../shared/components/icon";
import { Skeleton } from "../../../../shared/components/ui";
import { ATTENTION, buildMetrics, formatMT, formatRupees, statusKey } from "./contractsDashboard.utils";
import type { AttentionKind, MonthBar, Ranked } from "./contractsDashboard.utils";
import SummaryCard from "./SummaryCard";
import "./ContractsDashboard.scss";

/** Status colours from the theme tokens, so the chart follows Light, Dark and High contrast. */
const STATUS_COLOURS: Record<string, string> = {
  pendingforapproval: "var(--fx-chart-3)",
  pending: "var(--fx-chart-3)",
  open: "var(--fx-chart-1)",
  partiallydispatched: "var(--fx-chart-4)",
  dispatched: "var(--fx-chart-2)",
  closed: "var(--fx-slate-50)",
};
const statusColour = (status: string) => STATUS_COLOURS[statusKey(status)] ?? "var(--fx-slate-65)";

const ATTENTION_ICONS = { overdue: TriangleAlertIcon, due7: ClockIcon, due30: ClockIcon, noTrucks: TruckIcon, approval: FileTextIcon } as const;
/** Tint per attention group (theme tokens --fx-tint-<hue>-*): red overdue, orange within a week, amber within a month. */
const ATTENTION_TINTS = { overdue: "red", due7: "orange", due30: "amber", noTrucks: "purple", approval: "blue" } as const;

export interface DashboardFilters {
  status: string;
  focus: AttentionKind | null;
  search: string;
  monthStart: number | null;
}

interface ContractsDashboardProps {
  contracts: PendingContractApiResponse[] | undefined;
  loading: boolean;
  error: boolean;
  /** What the list below is filtered by now, to mark the matching card or bar. */
  active: DashboardFilters;
  onStatus: (status: string) => void;
  onFocus: (kind: AttentionKind | null) => void;
  onMonth: (month: MonthBar) => void;
  onSearch: (text: string) => void;
  onClear: () => void;
  /** "Now" for the delivery-date groups; the page passes Date.now(). */
  now: number;
}

const SrTable = ({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) => (
  <table className="visually-hidden">
    <caption>{caption}</caption>
    <thead>
      <tr>
        {head.map((cell) => (
          <th key={cell} scope="col">
            {cell}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={String(row[0])}>
          {row.map((cell, index) => (index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell}</td>))}
        </tr>
      ))}
    </tbody>
  </table>
);

const RankedList = ({ title, items, unit, active, onPick }: { title: string; items: Ranked[]; unit: "quantity"; active: string; onPick: (name: string) => void }) => {
  const max = Math.max(1, ...items.map((item) => item[unit]));
  return (
    <section className="cd-panel cd-panel--half" aria-label={title}>
      <h3 className="cd-panel__title">{title}</h3>
      {items.length === 0 ? (
        <p className="cd-panel__empty">No data yet</p>
      ) : (
        <ul className="cd-ranked">
          {items.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                className={`cd-ranked__row ${active.toLowerCase() === item.name.toLowerCase() ? "is-active" : ""}`}
                aria-pressed={active.toLowerCase() === item.name.toLowerCase()}
                onClick={() => onPick(item.name)}
                title={`Show contracts for ${item.name}`}
              >
                <span className="cd-ranked__name">{item.name}</span>
                <span className="cd-ranked__value">
                  {formatMT(item.quantity)} · {item.count}
                </span>
                <span className="cd-ranked__bar" aria-hidden>
                  <span style={{ width: `${(item.quantity / max) * 100}%` }} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const ContractsDashboard = ({ contracts, loading, error, active, onStatus, onFocus, onMonth, onSearch, onClear, now }: ContractsDashboardProps) => {
  const metrics = useMemo(() => (contracts ? buildMetrics(contracts, now) : null), [contracts, now]);
  const filtered = Boolean(active.status || active.focus || active.search || active.monthStart);

  if (error) {
    return (
      <div className="contracts-dashboard contracts-dashboard--message" role="alert">
        <CircleAlertIcon aria-hidden /> The overview could not be loaded. The list below still works.
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <section className="contracts-dashboard" aria-label="Contracts overview" aria-busy="true">
        <div className="cd-cards">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="cd-card">
              <Skeleton lines={2} />
            </div>
          ))}
        </div>
        <div className="cd-grid">
          <div className="cd-panel">
            <Skeleton height="9rem" />
          </div>
          <div className="cd-panel">
            <Skeleton height="9rem" />
          </div>
        </div>
      </section>
    );
  }

  if (metrics.total === 0) {
    return (
      <div className="contracts-dashboard contracts-dashboard--message" role="status">
        <PackageIcon aria-hidden /> No contracts yet. The overview fills in as contracts are added.
      </div>
    );
  }

  const percent = Math.round(metrics.dispatchedShare * 100);
  const maxMonth = Math.max(1, ...metrics.months.map((month) => month.count));
  const statusSummary = metrics.statuses.map((slice) => `${slice.status} ${slice.count}`).join(", ");

  return (
    <section className="contracts-dashboard" aria-label="Contracts overview">
      {filtered && (
        <div className="cd-filterbar" role="status">
          <span>
            Showing{" "}
            <strong>
              {[
                active.status,
                active.focus ? ATTENTION[active.focus].label : "",
                active.search,
                active.monthStart ? new Date(active.monthStart).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </strong>{" "}
            in the list below
          </span>
          <button type="button" className="cd-filterbar__clear" onClick={onClear}>
            <XIcon aria-hidden /> Clear
          </button>
        </div>
      )}

      {/* ---------------- headline numbers ---------------- */}
      <div className="cd-cards">
        <SummaryCard
          tone="blue"
          icon={FileTextIcon}
          label="Contracts"
          value={metrics.total.toLocaleString("en-IN")}
          meter={{ share: metrics.total ? metrics.active / metrics.total : 0, label: "Share of contracts still active" }}
          note={`${metrics.active.toLocaleString("en-IN")} active · ${(metrics.total - metrics.active).toLocaleString("en-IN")} done`}
          onClick={onClear}
          title="Show all contracts"
        />
        <SummaryCard
          tone="teal"
          icon={PackageIcon}
          label="Contracted quantity"
          value={formatMT(metrics.quantity)}
          note={`Value ${formatRupees(metrics.value)} excl. GST`}
        />
        <SummaryCard
          tone="green"
          icon={TruckIcon}
          label="Dispatched"
          value={formatMT(metrics.dispatched)}
          meter={{ share: metrics.dispatchedShare, label: "Share of contracted quantity dispatched" }}
          note={`${percent}% of contracted`}
        />
        <SummaryCard
          tone="orange"
          icon={ClockIcon}
          label="Still to dispatch"
          value={formatMT(metrics.pending)}
          meter={{ share: metrics.pending ? metrics.pendingArranged / metrics.pending : 0, label: "Share of the quantity still to dispatch that has trucks arranged" }}
          note={`${formatMT(metrics.pendingArranged)} has trucks arranged`}
        />
      </div>

      <div className="cd-grid">
        {/* ---------------- needs attention ---------------- */}
        <section className="cd-panel cd-panel--attention" aria-label="Needs attention">
          <h3 className="cd-panel__title">Needs attention</h3>
          <ul className="cd-attention">
            {(Object.keys(ATTENTION) as AttentionKind[]).map((kind) => {
              const count = metrics.attention[kind].length;
              const Glyph = ATTENTION_ICONS[kind];
              const selected = active.focus === kind;
              return (
                <li key={kind}>
                  <button
                    type="button"
                    className={`cd-attention__row cd-attention__row--${kind} ${count === 0 ? "is-zero" : `cd-tint--${ATTENTION_TINTS[kind]}`} ${selected ? "is-active" : ""}`}
                    aria-pressed={selected}
                    disabled={count === 0 && !selected}
                    onClick={() => onFocus(selected ? null : kind)}
                    title={ATTENTION[kind].hint}
                  >
                    <Glyph size={16} />
                    <span className="cd-attention__label">{ATTENTION[kind].label}</span>
                    <span className="cd-attention__count">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------------- by status ---------------- */}
        <section className="cd-panel" aria-label="Contracts by status">
          <h3 className="cd-panel__title">By status</h3>
          <div className="cd-status">
            <div className="cd-status__chart" role="img" aria-label={`Contracts by status: ${statusSummary}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.statuses}
                    dataKey="count"
                    nameKey="status"
                    innerRadius="58%"
                    outerRadius="95%"
                    paddingAngle={1}
                    stroke="var(--fx-white)"
                    isAnimationActive={false}
                    onClick={(_sector, index) => {
                      const slice = metrics.statuses[index];
                      if (slice) onStatus(slice.status);
                    }}
                  >
                    {metrics.statuses.map((slice) => (
                      <Cell key={slice.status} fill={statusColour(slice.status)} cursor="pointer" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(count, _name, item) => [
                      `${String(count)} (${formatMT(Number((item?.payload as { quantity?: number } | undefined)?.quantity ?? 0))})`,
                      "Contracts",
                    ]}
                    contentStyle={{ background: "var(--fx-white)", border: "1px solid var(--fx-gray-90-line)", color: "var(--fx-gray-12-fg)", fontSize: "0.8rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="cd-legend">
              {metrics.statuses.map((slice) => {
                const selected = statusKey(active.status) === statusKey(slice.status);
                return (
                  <li key={slice.status}>
                    <button type="button" className={`cd-legend__row ${selected ? "is-active" : ""}`} aria-pressed={selected} onClick={() => onStatus(slice.status)}>
                      <span className="cd-legend__swatch" style={{ background: statusColour(slice.status) }} aria-hidden />
                      <span className="cd-legend__name">{slice.status}</span>
                      <span className="cd-legend__count">{slice.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <SrTable caption="Contracts by status" head={["Status", "Contracts", "Quantity"]} rows={metrics.statuses.map((slice) => [slice.status, slice.count, formatMT(slice.quantity)])} />
        </section>

        {/* ---------------- per month ---------------- */}
        <section className="cd-panel cd-panel--wide" aria-label="Contracts per month">
          <h3 className="cd-panel__title">New contracts per month</h3>
          <ol className="cd-months">
            {metrics.months.map((month) => {
              const selected = active.monthStart === month.start;
              return (
                <li key={month.start}>
                  <button
                    type="button"
                    className={`cd-months__bar ${selected ? "is-active" : ""}`}
                    aria-pressed={selected}
                    aria-label={`${month.label}: ${month.count} contracts, ${formatMT(month.quantity)}`}
                    disabled={month.count === 0 && !selected}
                    onClick={() => onMonth(month)}
                  >
                    <span className="cd-months__count" aria-hidden>
                      {month.count || ""}
                    </span>
                    <span className="cd-months__fill" style={{ height: `${(month.count / maxMonth) * 100}%` }} aria-hidden />
                    <span className="cd-months__label" aria-hidden>
                      {month.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <RankedList title="Top products by quantity" items={metrics.topProducts} unit="quantity" active={active.search} onPick={onSearch} />
        <RankedList title="Top buyers by quantity" items={metrics.topBuyers} unit="quantity" active={active.search} onPick={onSearch} />
      </div>
    </section>
  );
};

export default ContractsDashboard;
