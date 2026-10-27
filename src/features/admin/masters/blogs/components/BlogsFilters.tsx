import { SearchIcon } from "../../../../../shared/components/icon";
import SearchableSelect from "../../../../../shared/components/dropdown/SearchableSelect";
import { STATUS_OPTIONS } from "../blogs.data";

interface BlogsFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

/** Filters apply as you type / pick, so there's no Apply button. */
const BlogsFilters = ({ search, status, onSearchChange, onStatusChange }: BlogsFiltersProps) => (
  <div id="blogs-filters" className="blogs__filters">
    <div className="blogs__search">
      <SearchIcon aria-hidden />
      <input
        type="search"
        autoComplete="off"
        placeholder="Search by Blog Name"
        aria-label="Search by Blog Name"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
    <SearchableSelect options={STATUS_OPTIONS} value={status} onChange={onStatusChange} placeholder="Select Status" ariaLabel="Select Status" clearable />
  </div>
);

export default BlogsFilters;
