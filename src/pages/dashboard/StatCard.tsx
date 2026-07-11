import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import type { StatCard as StatCardData } from "./dashboard.data";
import MiniBarChart from "./MiniBarChart";
import ProgressRing from "./ProgressRing";

interface StatCardProps {
  stat: StatCardData;
}

const StatCard = ({ stat }: StatCardProps) => {
  const DeltaIcon = stat.deltaDirection === "up" ? FiArrowUp : FiArrowDown;

  return (
    <div className="dashboard-stat">
      <div className="dashboard-stat__header">
        <div>
          <p className="dashboard-stat__value">{stat.value}</p>
          <p className="dashboard-stat__label">{stat.label}</p>
        </div>
        <div className="dashboard-stat__visual" style={{ color: stat.color }}>
          {stat.visual === "bars" ? (
            <MiniBarChart data={stat.sparkline ?? []} color={stat.color} />
          ) : (
            <ProgressRing percent={stat.ringPercent ?? 0} color={stat.color} />
          )}
        </div>
      </div>
      <p className={`dashboard-stat__delta dashboard-stat__delta--${stat.deltaDirection}`}>
        <DeltaIcon aria-hidden />
        {stat.deltaPercent}%<span>since last week</span>
      </p>
    </div>
  );
};

export default StatCard;
