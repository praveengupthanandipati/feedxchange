import { EyeIcon, EyeOffIcon } from "../../../../../shared/components/icon";

interface EnquiriesHeaderProps {
  filtersVisible: boolean;
  onToggleFilters: () => void;
}

const EnquiriesHeader = ({ filtersVisible, onToggleFilters }: EnquiriesHeaderProps) => (
  <div className="product-enquiries__header">
    <h1>Product Enquiry</h1>
    <div className="product-enquiries__header-actions">
      <button
        type="button"
        className="product-enquiries__btn product-enquiries__btn--info"
        onClick={onToggleFilters}
        aria-expanded={filtersVisible}
        aria-controls="product-enquiries-filters"
      >
        {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
    </div>
  </div>
);

export default EnquiriesHeader;
