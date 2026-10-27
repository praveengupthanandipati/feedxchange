import { ChevronDownIcon, ChevronUpIcon, DownloadIcon, EyeIcon, EyeOffIcon } from "../../../../../shared/components/icon";

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
        {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
      <button type="button" className="commission-estimations__btn commission-estimations__btn--warning" onClick={onExport} disabled={!canExport}>
        <DownloadIcon aria-hidden /> Export
      </button>
      <button type="button" className="commission-estimations__btn commission-estimations__btn--warning" onClick={onToggleAll} disabled={!canToggle}>
        {allExpanded ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
        {allExpanded ? "Collapse All" : "Toggle All"}
      </button>
    </div>
  </div>
);

export default EstimationHeader;
