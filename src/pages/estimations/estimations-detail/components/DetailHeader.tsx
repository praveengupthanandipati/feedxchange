import { FiArrowLeft, FiDownload, FiEye, FiEyeOff, FiPrinter } from "react-icons/fi";
import { Link } from "react-router-dom";

interface DetailHeaderProps {
  /** Where Back goes (View Estimations). */
  backTo: string;
  filtersVisible: boolean;
  onToggleFilters: () => void;
  onPrint: () => void;
  onDownload: () => void;
  canExport: boolean;
}

const DetailHeader = ({ backTo, filtersVisible, onToggleFilters, onPrint, onDownload, canExport }: DetailHeaderProps) => (
  <div className="estimation-detail__header">
    <h1>Estimations Detail</h1>
    <div className="estimation-detail__header-actions">
      <Link to={backTo} className="estimation-detail__back">
        <FiArrowLeft aria-hidden /> Back
      </Link>
      <button
        type="button"
        className="estimation-detail__btn estimation-detail__btn--info"
        onClick={onToggleFilters}
        aria-expanded={filtersVisible}
        aria-controls="estimation-detail-filters"
      >
        {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
      <button type="button" className="estimation-detail__btn estimation-detail__btn--warning" onClick={onPrint} disabled={!canExport}>
        <FiPrinter aria-hidden /> Print
      </button>
      <button type="button" className="estimation-detail__btn estimation-detail__btn--warning" onClick={onDownload} disabled={!canExport}>
        <FiDownload aria-hidden /> Download
      </button>
    </div>
  </div>
);

export default DetailHeader;
