import { XIcon } from "../icon";
import "./ClearFiltersButton.scss";

interface ClearFiltersButtonProps {
  onClick: () => void;
}

/** The round ✕ at the end of a list's filter bar: resets that list's filters and search (as on Business Owners). */
const ClearFiltersButton = ({ onClick }: ClearFiltersButtonProps) => (
  <button type="button" className="clear-filters-btn" onClick={onClick} title="Clear filters" aria-label="Clear filters">
    <XIcon aria-hidden />
  </button>
);

export default ClearFiltersButton;
