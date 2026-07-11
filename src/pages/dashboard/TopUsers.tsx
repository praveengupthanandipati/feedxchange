import { FiChevronDown, FiMapPin, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { topUsers } from "./dashboard.data";

const TopUsers = () => {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Top Users</h2>
        <button type="button" className="dashboard-card__sort">
          <strong>All Members</strong> <FiChevronDown aria-hidden />
        </button>
      </div>

      <ul className="dashboard-users">
        {topUsers.map((user) => {
          const TrendIcon = user.trend === "up" ? FiArrowUp : FiArrowDown;
          return (
            <li key={user.id} className="dashboard-users__item">
              <span className="dashboard-users__avatar" style={{ backgroundColor: user.color }}>
                {user.initials}
              </span>
              <div className="dashboard-users__info">
                <p className="dashboard-users__name">{user.name}</p>
                <p className="dashboard-users__location">
                  <FiMapPin aria-hidden /> {user.location}
                </p>
              </div>
              <span
                className={`dashboard-users__status dashboard-users__status--${user.status.toLowerCase()}`}
              >
                {user.status}
              </span>
              <span
                className={`dashboard-users__amount dashboard-users__amount--${user.trend}`}
              >
                {user.amount} <TrendIcon aria-hidden />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TopUsers;
