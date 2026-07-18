import { FiSearch } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import { stateOptions, districtOptions } from "./promoters.data";

interface PromotersFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
  district: string;
  onDistrictChange: (value: string) => void;
}

const PromotersFilters = ({
  keyword,
  onKeywordChange,
  state,
  onStateChange,
  district,
  onDistrictChange,
}: PromotersFiltersProps) => {
  return (
    <div className="promoters-filters">
      <SearchableSelect
        options={stateOptions}
        value={state}
        onChange={onStateChange}
        placeholder="Search by State"
        ariaLabel="Filter by state"
      />

      <SearchableSelect
        options={districtOptions}
        value={district}
        onChange={onDistrictChange}
        placeholder="Search by District"
        ariaLabel="Filter by district"
      />

      <div className="promoters-filters__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by name, referral code, phone, email"
        />
      </div>
    </div>
  );
};

export default PromotersFilters;
