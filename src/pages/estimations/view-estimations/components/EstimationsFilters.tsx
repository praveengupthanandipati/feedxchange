import { FiRefreshCw, FiSearch } from "react-icons/fi";
import DatePickerInput from "../../../../components/dropdown/DatePickerInput";
import SearchableSelect, { type SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { EstimationFilters } from "../viewEstimation.data";

interface EstimationsFiltersProps {
  value: EstimationFilters;
  partyOptions: SearchableSelectOption[];
  onChange: (value: EstimationFilters) => void;
  onShow: () => void;
  onReset: () => void;
}

const EstimationsFilters = ({ value, partyOptions, onChange, onShow, onReset }: EstimationsFiltersProps) => (
  <div id="view-estimations-filters" className="view-estimations__filters">
    <div className="view-estimations__filter-party">
      <SearchableSelect options={partyOptions} value={value.party} onChange={(party) => onChange({ ...value, party })} placeholder="Select" ariaLabel="Select Party" clearable />
    </div>
    <div className="view-estimations__filter-row">
      <DatePickerInput value={value.from} onChange={(from) => onChange({ ...value, from })} max={value.to || undefined} placeholder="From Date" ariaLabel="From Date" />
      <DatePickerInput value={value.to} onChange={(to) => onChange({ ...value, to })} min={value.from || undefined} placeholder="To Date" ariaLabel="To Date" />
      <div className="view-estimations__filter-actions">
        <button type="button" className="view-estimations__btn view-estimations__btn--navy" onClick={onShow}>
          <FiSearch aria-hidden /> Show
        </button>
        <button type="button" className="view-estimations__btn view-estimations__btn--warning" onClick={onReset}>
          <FiRefreshCw aria-hidden /> Reset
        </button>
      </div>
    </div>
  </div>
);

export default EstimationsFilters;
