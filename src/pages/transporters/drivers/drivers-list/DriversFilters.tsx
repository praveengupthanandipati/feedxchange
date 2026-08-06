import { FiSearch } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";

interface FilterOption {
  value: string;
  label: string;
}

interface DriversFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  experienceYears: string;
  onExperienceYearsChange: (value: string) => void;
  experienceYearsOptions: FilterOption[];
  state: string;
  onStateChange: (value: string) => void;
  stateOptions: FilterOption[];
  transporter: string;
  onTransporterChange: (value: string) => void;
  transporterOptions: FilterOption[];
}

const DriversFilters = ({
  keyword,
  onKeywordChange,
  experienceYears,
  onExperienceYearsChange,
  experienceYearsOptions,
  state,
  onStateChange,
  stateOptions,
  transporter,
  onTransporterChange,
  transporterOptions,
}: DriversFiltersProps) => {
  return (
    <div className="drivers-filters">
      <SearchableSelect
        options={experienceYearsOptions}
        value={experienceYears}
        onChange={onExperienceYearsChange}
        placeholder="Filter by Experience"
        ariaLabel="Filter by experience years"
      />

      <SearchableSelect
        options={stateOptions}
        value={state}
        onChange={onStateChange}
        placeholder="Filter by State"
        ariaLabel="Filter by state"
      />

      <SearchableSelect
        options={transporterOptions}
        value={transporter}
        onChange={onTransporterChange}
        placeholder="Filter by Transporter"
        ariaLabel="Filter by transporter"
      />

      <div className="drivers-filters__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by name, mobile, license number"
        />
      </div>
    </div>
  );
};

export default DriversFilters;
