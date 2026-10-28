import { DownloadIcon, RotateCcwIcon, SearchIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import { STATUS_OPTIONS } from "../registrationDetails.data";

interface RegistrationFiltersProps {
  search: string;
  status: string;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onExport: () => void;
  onReset: () => void;
}

/** Filters apply as you type / pick, so there's no Apply button. */
const RegistrationFilters = ({ search, status, resultCount, onSearchChange, onStatusChange, onExport, onReset }: RegistrationFiltersProps) => (
  <div className="registrations__filters">
    <div className="registrations__filter registrations__filter--search">
      <label htmlFor="registrations-search">Search</label>
      <div className="registrations__search">
        <SearchIcon aria-hidden />
        <input
          id="registrations-search"
          type="search"
          autoComplete="off"
          placeholder="Search registration details..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>

    <div className="registrations__filter registrations__filter--status">
      <div className="registrations__filter-label">
        <span>Status Filter</span>
        <small aria-live="polite">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </small>
      </div>
      <SearchableSelect options={STATUS_OPTIONS} value={status} onChange={onStatusChange} placeholder="All statuses" ariaLabel="Status Filter" clearable />
    </div>

    <div className="registrations__filter-actions">
      <button type="button" className="registrations__btn registrations__btn--success" onClick={onExport} disabled={resultCount === 0}>
        <DownloadIcon aria-hidden /> Export
      </button>
      <button type="button" className="registrations__btn registrations__btn--outline" onClick={onReset} disabled={!search && !status}>
        <RotateCcwIcon aria-hidden /> Reset
      </button>
    </div>
  </div>
);

export default RegistrationFilters;
