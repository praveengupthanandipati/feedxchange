import { FiChevronDown } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { socialSource } from "./dashboard.data";

const SocialSource = () => {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Social Source</h2>
        <button type="button" className="dashboard-card__sort">
          <strong>Monthly</strong> <FiChevronDown aria-hidden />
        </button>
      </div>

      <div className="dashboard-social">
        <span className="dashboard-social__icon">
          <FaFacebookF aria-hidden />
        </span>
        <p className="dashboard-social__figure">
          {socialSource.platform} - {socialSource.sales} sales
        </p>
        <p className="dashboard-social__description">{socialSource.description}</p>
      </div>
    </div>
  );
};

export default SocialSource;
