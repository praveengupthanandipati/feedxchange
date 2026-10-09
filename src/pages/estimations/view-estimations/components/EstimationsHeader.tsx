import { FiEye, FiEyeOff } from "react-icons/fi";

interface EstimationsHeaderProps {
  dataShowing: string;
  filtersVisible: boolean;
  onToggleFilters: () => void;
}

const EstimationsHeader = ({ dataShowing, filtersVisible, onToggleFilters }: EstimationsHeaderProps) => (
  <div className="view-estimations__header">
    <div className="view-estimations__title">
      <h1>View Estimations</h1>
      <span>Data Showing: {dataShowing}</span>
    </div>
    <button
      type="button"
      className="view-estimations__btn view-estimations__btn--info"
      onClick={onToggleFilters}
      aria-expanded={filtersVisible}
      aria-controls="view-estimations-filters"
    >
      {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
      {filtersVisible ? "Hide" : "Show"}
    </button>
  </div>
);

export default EstimationsHeader;
