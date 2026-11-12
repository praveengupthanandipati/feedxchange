import { SearchIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import ClearFiltersButton from "../../../../../shared/components/filters/ClearFiltersButton";

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
  /** Shows the ✕ that resets the filters and search. */
  onClear?: () => void;
}

const DriversFilters = ({
  keyword,
  onKeywordChange,
  experienceYears,
  onExperienceYearsChange,
  experienceYearsOptions,
  onClear,
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

      <div className="drivers-filters__search">
        <SearchIcon aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by name, mobile, license number"
        />
      </div>
      {onClear && <ClearFiltersButton onClick={onClear} />}
    </div>
  );
};

export default DriversFilters;
