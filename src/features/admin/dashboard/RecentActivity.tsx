import { FiChevronDown } from "react-icons/fi";
import { recentActivity } from "./dashboard.data";

const RecentActivity = () => {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Recent Activity</h2>
        <button type="button" className="dashboard-card__sort">
          <strong>Recent</strong> <FiChevronDown aria-hidden />
        </button>
      </div>

      <ul className="dashboard-activity">
        {recentActivity.map((item) => (
          <li key={item.id} className="dashboard-activity__item">
            <span className="dashboard-activity__dot" aria-hidden />
            <div>
              <p className="dashboard-activity__time">{item.time}</p>
              <p className="dashboard-activity__text">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
