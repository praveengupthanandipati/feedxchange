import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatRupees } from "../contracts/dashboard/contractsDashboard.utils";
import { useHomeLive } from "./homeLive";

/** Series colours from the theme's chart tokens, in fixed order (first product = bars, the next two = lines). */
const COLORS = ["var(--fx-chart-1)", "var(--fx-chart-2)", "var(--fx-chart-3)"] as const;
const KEYS = ["s0", "s1", "s2"] as const;

/** Sales Analytics for the chosen period, from the seller invoices: income, invoice count, paid share, and the top three products over time. */
const SalesAnalyticsCard = () => {
  const live = useHomeLive();
  const sales = live?.sales ?? null;
  const status = !live || (!sales && !live.invoicesFailed) ? "Loading…" : live.invoicesFailed ? "Sales are not available." : sales && sales.invoices === 0 ? "No invoices in this period." : "";

  return (
    <div className="dashboard-card dashboard-analytics">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Sales Analytics</h2>
        <span className="dashboard-card__sort">
          <strong>{live?.periodLabel}</strong>
        </span>
      </div>

      <div className="dashboard-analytics__summary">
        <div>
          <p className="dashboard-analytics__figure">{sales ? formatRupees(sales.income) : "…"}</p>
          <p className="dashboard-analytics__caption">Income</p>
        </div>
        <div>
          <p className="dashboard-analytics__figure">{sales ? sales.invoices.toLocaleString("en-IN") : "…"}</p>
          <p className="dashboard-analytics__caption">Invoices</p>
        </div>
        <div>
          <p className="dashboard-analytics__figure">{sales ? `${Math.round(sales.paidShare * 100)}%` : "…"}</p>
          <p className="dashboard-analytics__caption">Paid</p>
        </div>
      </div>

      <div className="dashboard-analytics__chart">
        {status ? (
          <p className="dashboard-analytics__empty">{status}</p>
        ) : (
          sales && (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={sales.buckets}>
                  <CartesianGrid vertical={false} stroke="var(--fx-chart-grid)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--fx-chart-axis)", fontSize: 12 }} interval="preserveStartEnd" minTickGap={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--fx-chart-axis)", fontSize: 12 }} width={64} tickFormatter={(value: number) => formatRupees(value)} />
                  <Tooltip
                    formatter={(value, name) => [formatRupees(Number(value)), sales.products[KEYS.indexOf(name as (typeof KEYS)[number])] ?? String(name)]}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--fx-gray-90-line)", background: "var(--fx-white)", color: "var(--fx-gray-12-fg)", fontSize: 13 }}
                  />
                  {sales.products[0] && <Bar dataKey="s0" fill={COLORS[0]} radius={[4, 4, 0, 0]} barSize={18} isAnimationActive={false} />}
                  {sales.products[1] && <Line type="monotone" dataKey="s1" stroke={COLORS[1]} strokeWidth={2} dot={false} isAnimationActive={false} />}
                  {sales.products[2] && <Line type="monotone" dataKey="s2" stroke={COLORS[2]} strokeWidth={2} dot={false} isAnimationActive={false} />}
                </ComposedChart>
              </ResponsiveContainer>

              <ul className="dashboard-analytics__legend">
                {sales.products.map((product, index) => (
                  <li key={product}>
                    <span style={{ backgroundColor: COLORS[index] }} />
                    {product}
                  </li>
                ))}
              </ul>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default SalesAnalyticsCard;
