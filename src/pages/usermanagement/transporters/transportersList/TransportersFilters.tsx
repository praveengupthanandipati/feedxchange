import { FiSearch } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";

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

      <div className="transporters-filters__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by company, type, location, state, mobile"
        />
      </div>
    </div>
  );
};

export default TransportersFilters;
