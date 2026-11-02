import { statCards } from "./dashboard.data";
import StatCard from "./StatCard";
import SalesAnalyticsCard from "./SalesAnalyticsCard";
import CampaignBanner from "./CampaignBanner";
import TopSellingProducts from "./TopSellingProducts";
import TopUsers from "./TopUsers";
import RecentActivity from "./RecentActivity";
import SocialSource from "./SocialSource";
import HomeOverview, { type LiveFigures } from "./HomeOverview";
import { formatRupees } from "../contracts/dashboard/contractsDashboard.utils";
import type { StatCard as StatCardData } from "./dashboard.data";
import "./Dashboard.scss";

/** "vs last month" change line for a card: the size of the change, its direction, and nothing when there is no comparison. */
const changeFields = (change: number | null, previousLabel: string): Partial<StatCardData> => ({
  deltaPercent: change === null ? 0 : Math.round(Math.abs(change) * 10000) / 100,
  deltaDirection: change !== null && change < 0 ? "down" : "up",
  deltaLabel: `vs ${previousLabel}`,
  hideDelta: change === null,
});

/** Shown while a card's figures load, or when they cannot be read. */
const pending = (stat: StatCardData, failed: boolean): StatCardData => ({
  ...stat,
  value: failed ? "N/A" : "…",
  sparkline: stat.visual === "bars" ? Array(10).fill(0) : undefined,
  ringPercent: 0,
  hideDelta: true,
});

/**
 * The dashboard's stat cards with live figures for the chosen period:
 * Revenue = sum of the seller invoice amounts; Orders = number of invoices (ring: share fully paid);
 * Customers = businesses trading (ring: share of the active businesses); Growth = revenue change from the period before.
 */
const withLiveFigures = (stat: StatCardData, live: LiveFigures): StatCardData => {
  const { invoices, customers, previousLabel } = live;
  switch (stat.id) {
    case "revenue":
      if (!invoices) return pending(stat, live.invoicesFailed);
      return { ...stat, value: formatRupees(invoices.revenue), sparkline: invoices.revenueTrend, ...changeFields(invoices.revenueChange, previousLabel) };
    case "orders":
      if (!invoices) return pending(stat, live.invoicesFailed);
      return {
        ...stat,
        label: "Invoices",
        value: invoices.orders.toLocaleString("en-IN"),
        ringPercent: Math.round(invoices.paidShare * 100),
        ...changeFields(invoices.ordersChange, previousLabel),
      };
    case "customers":
      if (!customers) return pending(stat, false);
      return {
        ...stat,
        value: customers.count.toLocaleString("en-IN"),
        ringPercent: customers.activeBusinesses ? Math.min(100, (customers.count / customers.activeBusinesses) * 100) : 0,
        ...changeFields(customers.change, previousLabel),
      };
    case "growth": {
      if (!invoices) return pending(stat, live.invoicesFailed);
      const growth = invoices.revenueChange;
      return {
        ...stat,
        label: "Revenue growth",
        value: growth === null ? "0%" : `${growth > 0 ? "+" : ""}${(growth * 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`,
        sparkline: invoices.revenueTrend,
        hideDelta: true,
      };
    }
    default:
      return stat;
  }
};

/** Customers last in the stat row. */
const orderedStats = [...statCards.filter((stat) => stat.id !== "customers"), ...statCards.filter((stat) => stat.id === "customers")];

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Live figures from the contracts (period toggle, KPIs, actions, analytics, shortcuts), with the existing stat cards
          right under the contract cards. */}
      <HomeOverview
        afterKpis={(live) => (
          <div className="dashboard__stats">
            {orderedStats.map((stat) => (
              <StatCard key={stat.id} stat={withLiveFigures(stat, live)} />
            ))}
          </div>
        )}
      >
        {/* The original widgets, now with the overview's live data for the chosen period (see homeLive.ts). */}
        <div className="dashboard__main">
          <SalesAnalyticsCard />
          <div className="dashboard__side">
            <CampaignBanner />
            <TopSellingProducts />
          </div>
        </div>

        <div className="dashboard__footer">
          <TopUsers />
          <RecentActivity />
          <SocialSource />
        </div>
      </HomeOverview>
    </div>
  );
};

export default Dashboard;
