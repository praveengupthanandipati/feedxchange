import { ChevronDownIcon, ChevronRightIcon } from "../../../../../shared/components/icon";

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
    {expanded ? <ChevronDownIcon aria-hidden /> : <ChevronRightIcon aria-hidden />}
  </button>
);

export default ExpandButton;
