import { statCards } from "./dashboard.data";
import StatCard from "./StatCard";
import SalesAnalyticsCard from "./SalesAnalyticsCard";
import CampaignBanner from "./CampaignBanner";
import TopSellingProducts from "./TopSellingProducts";
import TopUsers from "./TopUsers";
import RecentActivity from "./RecentActivity";
import SocialSource from "./SocialSource";
import "./Dashboard.scss";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        {statCards.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

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
    </div>
  );
};

export default Dashboard;
