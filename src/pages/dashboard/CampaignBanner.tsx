import { FiArrowRight, FiTarget } from "react-icons/fi";

const CampaignBanner = () => {
  return (
    <div className="dashboard-card dashboard-banner">
      <div className="dashboard-banner__icon">
        <FiTarget aria-hidden />
      </div>
      <p className="dashboard-banner__text">
        Enhance your <strong>Campaign</strong> for better outreach{" "}
        <FiArrowRight aria-hidden />
      </p>
      <button type="button" className="dashboard-banner__cta">
        Upgrade Account!
      </button>
    </div>
  );
};

export default CampaignBanner;
