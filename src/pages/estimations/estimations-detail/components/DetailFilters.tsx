import { FiRefreshCw, FiSearch } from "react-icons/fi";
import DatePickerInput from "../../../../components/dropdown/DatePickerInput";
import SearchableSelect, { type SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { DetailFilters as Filters } from "../estimationDetail.data";

interface DetailFiltersProps {
  value: Filters;
  estimateOptions: SearchableSelectOption[];
  onChange: (value: Filters) => void;
  onShow: () => void;
  onReset: () => void;
}

const DetailFilters = ({ value, estimateOptions, onChange, onShow, onReset }: DetailFiltersProps) => (
  <div id="estimation-detail-filters" className="estimation-detail__filters">
    <div className="estimation-detail__filter-estimate">
      <SearchableSelect
        options={estimateOptions}
        value={value.estimateId}
        onChange={(estimateId) => onChange({ ...value, estimateId })}
        placeholder="Select"
        ariaLabel="Select Estimate"
      />
    </div>
    <div className="estimation-detail__filter-row">
      <DatePickerInput value={value.from} onChange={(from) => onChange({ ...value, from })} max={value.to || undefined} placeholder="From Date" ariaLabel="From Date" />
      <DatePickerInput value={value.to} onChange={(to) => onChange({ ...value, to })} min={value.from || undefined} placeholder="To Date" ariaLabel="To Date" />
      <div className="estimation-detail__filter-actions">
        <button type="button" className="estimation-detail__btn estimation-detail__btn--navy" onClick={onShow}>
          <FiSearch aria-hidden /> Show
        </button>
        <button type="button" className="estimation-detail__btn estimation-detail__btn--warning" onClick={onReset}>
          <FiRefreshCw aria-hidden /> Reset
        </button>
      </div>
    </div>
  </div>
);

export default DetailFilters;
