import { FiDownload, FiEye, FiEyeOff } from "react-icons/fi";

interface EnquiriesHeaderProps {
  filtersVisible: boolean;
  onToggleFilters: () => void;
  onExport: () => void;
  canExport: boolean;
}

const EnquiriesHeader = ({ filtersVisible, onToggleFilters, onExport, canExport }: EnquiriesHeaderProps) => (
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
        {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
      <button type="button" className="product-enquiries__btn product-enquiries__btn--warning" onClick={onExport} disabled={!canExport}>
        <FiDownload aria-hidden /> Export
      </button>
    </div>
  </div>
);

export default EnquiriesHeader;
