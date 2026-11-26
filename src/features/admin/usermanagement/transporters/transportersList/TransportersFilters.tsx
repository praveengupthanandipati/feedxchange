import { SearchIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ClearFiltersButton from "../../../../../shared/components/filters/ClearFiltersButton";

interface FilterOption {
  value: string;
  label: string;
}

export const statusFilterOptions: FilterOption[] = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Deleted", label: "Deleted" },
];

interface TransportersFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  transporterType: string;
  onTransporterTypeChange: (value: string) => void;
  transporterTypeOptions: FilterOption[];
  state: string;
  onStateChange: (value: string) => void;
  stateOptions: FilterOption[];
  /** Serving Locations: states the transporter picks up from / delivers to. */
  sourceState: string;
  onSourceStateChange: (value: string) => void;
  sourceStateOptions: FilterOption[];
  destinationState: string;
  onDestinationStateChange: (value: string) => void;
  destinationStateOptions: FilterOption[];
  /** Shows the ✕ that resets the filters and search. */
  onClear?: () => void;
}

const TransportersFilters = ({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  transporterType,
  onTransporterTypeChange,
  transporterTypeOptions,
  state,
  onStateChange,
  stateOptions,
  sourceState,
  onSourceStateChange,
  sourceStateOptions,
  destinationState,
  onDestinationStateChange,
  destinationStateOptions,
  onClear,
}: TransportersFiltersProps) => {
  return (
    <div className="transporters-filters">
      <SearchableSelect
        options={statusFilterOptions}
        value={status}
        onChange={onStatusChange}
        placeholder="Select Status"
        ariaLabel="Filter by status"
      />

      <SearchableSelect
        options={transporterTypeOptions}
        value={transporterType}
        onChange={onTransporterTypeChange}
        placeholder="Search By transporter type"
        ariaLabel="Filter by transporter type"
      />

      <SearchableSelect
        options={stateOptions}
        value={state}
        onChange={onStateChange}
        placeholder="Filter by State"
        ariaLabel="Filter by state"
      />

      <SearchableSelect
        options={sourceStateOptions}
        value={sourceState}
        onChange={onSourceStateChange}
        placeholder="Picks up from state"
        ariaLabel="Filter by source state"
      />

      <SearchableSelect
        options={destinationStateOptions}
        value={destinationState}
        onChange={onDestinationStateChange}
        placeholder="Delivers to state"
        ariaLabel="Filter by destination state"
      />

      <div className="transporters-filters__search">
        <SearchIcon aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by company, type, location, state, mobile"
        />
      </div>
      {onClear && <ClearFiltersButton onClick={onClear} />}
    </div>
  );
};

export default TransportersFilters;
