import { useMemo, useState } from "react";
import { LockIcon } from "../../../../shared/components/icon";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from "recharts";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { sitePaths } from "../../routes/paths";

// Chart colours: the site's navy for the single series, recessive greys for grid and axis text.
// Theme tokens (docs/design-tokens.md), so the chart follows Light / Dark / High contrast.
const BAR = "var(--fx-blue-31)";
const BAR_ACTIVE = "var(--fx-blue-22)";
const GRID = "var(--fx-chart-grid)";
const AXIS_TEXT = "var(--fx-chart-axis)";

type Range = "weekly" | "quarterly" | "monthly";
const RANGES: { id: Range; label: string; locked: boolean }[] = [
  { id: "weekly", label: "Weekly", locked: false },
  { id: "quarterly", label: "Quarterly", locked: true },
  { id: "monthly", label: "Monthly", locked: true },
];

interface PricePoint {
  /** Short x-axis label, e.g. "15 Aug". */
  label: string;
  /** Full date for the tooltip and table. */
  date: string;
  price: number;
}

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const compact = (value: number) => (value === 0 ? "₹0" : `₹${Math.round(value / 1000)}K`);

/** Test data: 7 daily prices ending today, stable per product (seeded from the slug). */
function weeklyPrices(seed: string, basePrice: number): PricePoint[] {
  let state = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    // ±30% around the base price, rounded to ₹500.
    const price = Math.round((basePrice * (0.7 + random() * 0.6)) / 500) * 500;
    return {
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      date: day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      price,
    };
  });
}

/** Rounded y-axis top and 5 evenly spaced ticks from 0. */
function niceTicks(max: number) {
  const rough = (max * 1.15) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  return Array.from({ length: 5 }, (_, i) => i * step);
}

const PriceTooltip = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) => {
  const point = payload?.[0]?.payload as PricePoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="price-tooltip">
      <span>{point.date}</span>
      <strong>{rupees(point.price)}</strong>
      <small>per MT</small>
    </div>
  );
};

/** "Price History" card: weekly bar chart, plus low / current / high with a range bar. */
const PriceHistory = ({ seed, basePrice }: { seed: string; basePrice: number }) => {
  const reducedMotion = useReducedMotion();
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const data = useMemo(() => weeklyPrices(seed, basePrice), [seed, basePrice]);

  const prices = data.map((point) => point.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const current = prices[prices.length - 1];
  const ticks = niceTicks(high);
  // Where today's price sits between the week's low and high (0–100%).
  const position = high === low ? 50 : ((current - low) / (high - low)) * 100;

  // Direct label only on the week's highest bar(s); every other value is in the tooltip and table.
  const renderPeak = (props: LabelProps) => {
    const { x, y, width, value } = props;
    if (Number(value) !== high) return null;
    const text = rupees(Number(value));
    const boxWidth = text.length * 6.6 + 14;
    const centre = Number(x) + Number(width) / 2;
    const top = Number(y) - 30;
    return (
      <g className="price-peak" pointerEvents="none">
        <rect x={centre - boxWidth / 2} y={top} width={boxWidth} height={22} rx={6} />
        <path d={`M ${centre - 5} ${top + 22} L ${centre} ${top + 27} L ${centre + 5} ${top + 22} Z`} />
        <text x={centre} y={top + 15} textAnchor="middle">
          {text}
        </text>
      </g>
    );
  };

  return (
    <section className="pd-card price-history" aria-labelledby="price-history-title" data-reveal>
      <div className="pd-card__head price-history__head">
        <h2 id="price-history-title">Price History</h2>
        <div className="price-history__ranges" role="group" aria-label="Time range">
          {RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              className={`price-history__range ${range.id === "weekly" ? "is-active" : ""}`}
              aria-pressed={range.id === "weekly"}
              aria-disabled={range.locked || undefined}
              onClick={() => setLockedNotice(range.locked ? range.label : null)}
            >
              {range.label}
              {range.locked && <LockIcon aria-label="(locked)" />}
            </button>
          ))}
        </div>
      </div>

      {lockedNotice && (
        <p className="price-history__notice" role="status">
          <LockIcon aria-hidden /> {lockedNotice} price history is available to registered members.{" "}
          <Link to={sitePaths.join}>Join FeedXchange</Link> to unlock it.
        </p>
      )}

      <div className="price-history__chart" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 36, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" interval={0} tickLine={false} axisLine={{ stroke: GRID }} tick={{ fontSize: 11, fill: AXIS_TEXT }} tickMargin={8} />
            <YAxis
              domain={[0, ticks[ticks.length - 1]]}
              ticks={ticks}
              tickFormatter={compact}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: AXIS_TEXT }}
              width={46}
            />
            <Tooltip content={PriceTooltip} cursor={{ fill: "rgba(var(--fx-blue-31-rgb), 0.06)" }} isAnimationActive={false} />
            <Bar
              dataKey="price"
              fill={BAR}
              activeBar={{ fill: BAR_ACTIVE }}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={!reducedMotion}
              animationDuration={700}
            >
              <LabelList dataKey="price" content={renderPeak} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Same numbers for screen readers. */}
      <table className="visually-hidden-site">
        <caption>Price per MT, last 7 days</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <td>{point.date}</td>
              <td>{rupees(point.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="price-range" role="img" aria-label={`Current price ${rupees(current)}, between this week's low of ${rupees(low)} and high of ${rupees(high)}`}>
        {/* Current price sits above its marker, clamped so it never runs off either end. */}
        <div className="price-range__now">
          <div className="price-range__current" style={{ left: `clamp(3.5rem, ${position}%, calc(100% - 3.5rem))` }}>
            <span>Current Price</span>
            <strong>{rupees(current)}</strong>
          </div>
        </div>
        <div className="price-range__track">
          <span className="price-range__marker" style={{ left: `${position}%` }} />
        </div>
        <div className="price-range__labels">
          <div className="price-range__end price-range__end--low">
            <span>Low</span>
            <strong>{rupees(low)}</strong>
          </div>
          <div className="price-range__end price-range__end--high">
            <span>High</span>
            <strong>{rupees(high)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceHistory;
