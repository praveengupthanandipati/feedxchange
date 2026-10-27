import { ArrowLeftIcon, DownloadIcon, EyeIcon, EyeOffIcon, PrinterIcon } from "../../../../../shared/components/icon";
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
        <ArrowLeftIcon aria-hidden /> Back
      </Link>
      <button
        type="button"
        className="estimation-detail__btn estimation-detail__btn--info"
        onClick={onToggleFilters}
        aria-expanded={filtersVisible}
        aria-controls="estimation-detail-filters"
      >
        {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
      <button type="button" className="estimation-detail__btn estimation-detail__btn--warning" onClick={onPrint} disabled={!canExport}>
        <PrinterIcon aria-hidden /> Print
      </button>
      <button type="button" className="estimation-detail__btn estimation-detail__btn--warning" onClick={onDownload} disabled={!canExport}>
        <DownloadIcon aria-hidden /> Download
      </button>
    </div>
  </div>
);

export default DetailHeader;
