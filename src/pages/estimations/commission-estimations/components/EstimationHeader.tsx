import { FiChevronDown, FiChevronUp, FiDownload, FiEye, FiEyeOff } from "react-icons/fi";

interface EstimationHeaderProps {
  filtersVisible: boolean;
  onToggleFilters: () => void;
  onExport: () => void;
  canExport: boolean;
  allExpanded: boolean;
  onToggleAll: () => void;
  canToggle: boolean;
}

const EstimationHeader = ({ filtersVisible, onToggleFilters, onExport, canExport, allExpanded, onToggleAll, canToggle }: EstimationHeaderProps) => (
  <div className="commission-estimations__header">
    <h1>Commission Estimations</h1>
    <div className="commission-estimations__header-actions">
      <button
        type="button"
        className="commission-estimations__btn commission-estimations__btn--info"
        onClick={onToggleFilters}
        aria-expanded={filtersVisible}
        aria-controls="commission-estimations-filters"
      >
        {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
      <button type="button" className="commission-estimations__btn commission-estimations__btn--warning" onClick={onExport} disabled={!canExport}>
        <FiDownload aria-hidden /> Export
      </button>
      <button type="button" className="commission-estimations__btn commission-estimations__btn--warning" onClick={onToggleAll} disabled={!canToggle}>
        {allExpanded ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
        {allExpanded ? "Collapse All" : "Toggle All"}
      </button>
    </div>
  </div>
);

export default EstimationHeader;
