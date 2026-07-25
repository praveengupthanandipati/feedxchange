import { FiSearch } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";

interface FilterOption {
  value: string;
  label: string;
}

interface ProductsFiltersProps {
  category: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: FilterOption[];
  keyword: string;
  onKeywordChange: (value: string) => void;
}

const ProductsFilters = ({
  category,
  onCategoryChange,
  categoryOptions,
  keyword,
  onKeywordChange,
}: ProductsFiltersProps) => {
  return (
    <div className="products-list-filters">
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
          placeholder="Search by Name, Category"
        />
      </div>
    </div>
  );
};

export default ProductsFilters;
