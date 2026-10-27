import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChevronDownIcon } from "../../../shared/components/icon";
import { salesAnalytics } from "./dashboard.data";

const SERIES = [
  { key: "cattleFeed", label: "Cattle Feed", color: "var(--fx-sky-60)" },
  { key: "soyabeanDeoiled", label: "Soyabean Deoiled", color: "var(--fx-slate-84)" },
  { key: "granulesGroundnut", label: "Granules Groundnut", color: "var(--fx-amber-50)" },
] as const;

const SalesAnalyticsCard = () => {
  return (
    <div className="dashboard-card dashboard-analytics">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Sales Analytics</h2>
        <button type="button" className="dashboard-card__sort">
          Sort By: <strong>Yearly</strong> <ChevronDownIcon aria-hidden />
        </button>
      </div>

      <div className="dashboard-analytics__summary">
        <div>
          <p className="dashboard-analytics__figure">{salesAnalytics.income}</p>
          <p className="dashboard-analytics__caption">Income</p>
        </div>
        <div>
          <p className="dashboard-analytics__figure">{salesAnalytics.sales}</p>
          <p className="dashboard-analytics__caption">Sales</p>
        </div>
        <div>
          <p className="dashboard-analytics__figure">{salesAnalytics.conversionRatio}</p>
          <p className="dashboard-analytics__caption">Conversation Ratio</p>
        </div>
      </div>

      <div className="dashboard-analytics__chart">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={salesAnalytics.data}>
            <CartesianGrid vertical={false} stroke="var(--fx-chart-grid)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--fx-chart-axis)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--fx-chart-axis)", fontSize: 12 }}
              label={{ value: "Points", angle: -90, position: "insideLeft", fill: "var(--fx-chart-axis)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid var(--fx-gray-90-line)", fontSize: 13 }}
            />
            <Bar dataKey="cattleFeed" fill="var(--fx-sky-60)" radius={[4, 4, 0, 0]} barSize={18} />
            <Line
              type="monotone"
              dataKey="soyabeanDeoiled"
              stroke="var(--fx-slate-84)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="granulesGroundnut"
              stroke="var(--fx-amber-50)"
              strokeWidth={2.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <ul className="dashboard-analytics__legend">
          {SERIES.map((series) => (
            <li key={series.key}>
              <span style={{ backgroundColor: series.color }} />
              {series.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SalesAnalyticsCard;
