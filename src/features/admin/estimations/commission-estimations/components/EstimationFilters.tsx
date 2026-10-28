import { CheckIcon, RefreshCwIcon } from "../../../../../shared/components/icon";
import DateRangeInput from "../../../../../shared/components/dropdown/DateRangeInput";
import SearchableSelect, { type SearchableSelectOption } from "../../../../../shared/components/dropdown/SearchableSelect";
import { ACTION_TYPE_OPTIONS, type EstimationFilters as Filters } from "../commissionEstimation.data";

interface EstimationFiltersProps {
  value: Filters;
  partyOptions: SearchableSelectOption[];
  onChange: (value: Filters) => void;
  onApply: () => void;
  onReset: () => void;
}

const EstimationFilters = ({ value, partyOptions, onChange, onApply, onReset }: EstimationFiltersProps) => (
  <div id="commission-estimations-filters" className="commission-estimations__filters">
    <SearchableSelect options={partyOptions} value={value.party} onChange={(party) => onChange({ ...value, party })} placeholder="Select Party" ariaLabel="Select Party" clearable />
    <DateRangeInput from={value.from} to={value.to} onChange={(from, to) => onChange({ ...value, from, to })} placeholder="Select Date Range" ariaLabel="Contract date range" />
    <SearchableSelect
      options={ACTION_TYPE_OPTIONS}
      value={value.actionType}
      onChange={(actionType) => onChange({ ...value, actionType })}
      placeholder="Select"
      ariaLabel="Select Action Type"
      clearable
    />
    <div className="commission-estimations__filter-actions">
      <button type="button" className="commission-estimations__btn commission-estimations__btn--navy" onClick={onApply}>
        <CheckIcon aria-hidden /> Apply
      </button>
      <button type="button" className="commission-estimations__btn commission-estimations__btn--danger" onClick={onReset}>
        <RefreshCwIcon aria-hidden /> Reset
      </button>
    </div>
  </div>
);

export default EstimationFilters;
