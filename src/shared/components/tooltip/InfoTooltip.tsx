import { FiInfo } from "react-icons/fi";
import "./InfoTooltip.scss";

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip = ({ text }: InfoTooltipProps) => {
  return (
    <span className="info-tooltip" tabIndex={0}>
      <FiInfo aria-hidden />
      <span className="info-tooltip__bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
};

export default InfoTooltip;
