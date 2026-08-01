import { FiSearch, FiX } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";

interface FilterOption {
  value: string;
  label: string;
}

interface ProductsFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions: FilterOption[];
  category: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: FilterOption[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  onClear: () => void;
}

const ProductsFilters = ({
  status,
  onStatusChange,
  statusOptions,
  category,
  onCategoryChange,
  categoryOptions,
  keyword,
  onKeywordChange,
  onClear,
}: ProductsFiltersProps) => {
  return (
    <div className="products-list-filters">
      <SearchableSelect
        options={statusOptions}
        value={status}
        onChange={onStatusChange}
        placeholder="Select Status"
        ariaLabel="Filter by status"
      />

      <SearchableSelect
        options={categoryOptions}
        value={category}
        onChange={onCategoryChange}
        placeholder="Select Categories..."
        ariaLabel="Filter by category"
      />

      <div className="products-list-filters__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by Name, Category, SKU"
        />
      </div>

      <button
        type="button"
        className="products-list-filters__clear"
        onClick={onClear}
        title="Clear filters"
        aria-label="Clear filters"
      >
        <FiX aria-hidden />
      </button>
    </div>
  );
};

export default ProductsFilters;
