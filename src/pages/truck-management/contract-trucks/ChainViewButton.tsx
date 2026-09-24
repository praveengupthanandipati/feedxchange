import { FiLink } from "react-icons/fi";
import { useGetContractTruckChainOverviewQuery } from "../../../store/contractTrucksApi";

interface ChainViewButtonProps {
  contractDispatchId: number;
  onClick: () => void;
}

/**
 * GetAllTrucksByContract says nothing about chains, so each truck is asked for its own
 * overview. The button appears only once the truck sits on more than one contract —
 * i.e. it has been re-assigned.
 */
const ChainViewButton = ({ contractDispatchId, onClick }: ChainViewButtonProps) => {
  const requestingUserId = Number(localStorage.getItem("userId")) || 0;
  const { data: overview } = useGetContractTruckChainOverviewQuery(
    { contractDispatchId, requestingUserId },
    { skip: !contractDispatchId },
  );

  if (!overview || overview.truck.legCount < 2) return null;

  return (
    <button
      type="button"
      className="truck-tracking-drawer__reassign-btn"
      onClick={onClick}
      title="See every contract this truck is on"
    >
      <FiLink aria-hidden /> View Chain
    </button>
  );
};

export default ChainViewButton;
