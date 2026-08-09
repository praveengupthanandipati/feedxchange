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
}

const DriversFilters = ({
  keyword,
  onKeywordChange,
  experienceYears,
  onExperienceYearsChange,
  experienceYearsOptions,
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
