import { FiSearch } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import { transporterTypeOptions, stateOptions } from "./transporters.data";

interface TransportersFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  transporterType: string;
  onTransporterTypeChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
}

const TransportersFilters = ({
  keyword,
  onKeywordChange,
  transporterType,
  onTransporterTypeChange,
  state,
  onStateChange,
}: TransportersFiltersProps) => {
  return (
    <div className="transporters-filters">
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
