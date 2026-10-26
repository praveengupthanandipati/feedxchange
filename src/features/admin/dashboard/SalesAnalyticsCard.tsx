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
import { FiChevronDown } from "react-icons/fi";
import { salesAnalytics } from "./dashboard.data";

const SERIES = [
  { key: "cattleFeed", label: "Cattle Feed", color: "#38bdf8" },
  { key: "soyabeanDeoiled", label: "Soyabean Deoiled", color: "#cbd5e1" },
  { key: "granulesGroundnut", label: "Granules Groundnut", color: "#f59e0b" },
] as const;

const SalesAnalyticsCard = () => {
  return (
    <div className="dashboard-card dashboard-analytics">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Sales Analytics</h2>
        <button type="button" className="dashboard-card__sort">
          Sort By: <strong>Yearly</strong> <FiChevronDown aria-hidden />
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
            <CartesianGrid vertical={false} stroke="#eef0f3" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ea4ad", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ea4ad", fontSize: 12 }}
              label={{ value: "Points", angle: -90, position: "insideLeft", fill: "#9ea4ad", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e1e4e8", fontSize: 13 }}
            />
            <Bar dataKey="cattleFeed" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={18} />
            <Line
              type="monotone"
              dataKey="soyabeanDeoiled"
              stroke="#cbd5e1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="granulesGroundnut"
              stroke="#f59e0b"
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
