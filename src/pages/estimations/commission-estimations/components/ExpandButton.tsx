import { FiChevronDown, FiChevronRight } from "react-icons/fi";

interface ExpandButtonProps {
  expanded: boolean;
  contractNo: string;
  onToggle: () => void;
}

const ExpandButton = ({ expanded, contractNo, onToggle }: ExpandButtonProps) => (
  <button
    type="button"
    className="commission-estimations__expand"
    onClick={onToggle}
    aria-expanded={expanded}
    aria-label={expanded ? `Hide invoices for contract ${contractNo}` : `Show invoices for contract ${contractNo}`}
  >
    {expanded ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
  </button>
);

export default ExpandButton;
