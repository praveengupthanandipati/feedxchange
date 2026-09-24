import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import "./InfoPanel.scss";

interface InfoPanelProps {
  icon: IconType;
  title: string;
  description: string;
  action?: {
    label: string;
    to: string;
  };
}

const InfoPanel = ({ icon: Icon, title, description, action }: InfoPanelProps) => (
  <div className="info-panel">
    <div className="info-panel__icon">
      <Icon aria-hidden />
    </div>
    <h2>{title}</h2>
    <p>{description}</p>
    {action && (
      <Link to={action.to} className="info-panel__action">
        {action.label}
      </Link>
    )}
  </div>
);

export default InfoPanel;
