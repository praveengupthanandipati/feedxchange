import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import InfoPanel from "../InfoPanel";
import {
  useContractTruckDetails,
  type ContractTruckDetail,
} from "../../../contract-trucks/useContractTruckDetails";
import TruckList from "../../../contract-trucks/TruckList";
import ContractSummaryPanel from "../../../contract-trucks/ContractSummaryPanel";
import PendingContractSelector from "../../../contract-trucks/PendingContractSelector";
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import "../../../assign-transports/Assigntransports.scss";

const ViewTrucksByContractSummary = ({ contractNumber }: { contractNumber: string }) => {
  const { trucks, isLoading } = useContractTruckDetails(contractNumber, true);
  const navigate = useNavigate();

  // Reassigning puts the same truck on another contract, which is a chain of contracts
  // hanging off this dispatch rather than a new assignment of its own.
  const handleViewChain = (truck: ContractTruckDetail) => {
    navigate(
      `/truck-management/open-pending-contracts/truck-chain?contract=${encodeURIComponent(
        contractNumber,
      )}&contractTruckId=${truck.contractTruckId}`,
    );
  };

  const handleReassign = (truck: ContractTruckDetail) => {
    navigate(
      `/truck-management/open-pending-contracts/reassign-truck?contract=${encodeURIComponent(
        contractNumber,
      )}&contractTruckId=${truck.contractTruckId}`,
    );
  };

  return (
    <>
      <ContractSummaryPanel contractNumber={contractNumber} />

      <div className="assign-transports-tabs-section">
        <h2 className="assign-transports-tabs-section__title">Trucks Assigned to This Contract</h2>
        <TruckList
          trucks={trucks}
          isLoading={isLoading}
          showShare={false}
          onReassign={handleReassign}
          onViewChain={handleViewChain}
        />
      </div>
    </>
  );
};

const ViewTrucksByContract = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedContract, setSelectedContract } = useSelectedContract();
  // Falls back to the contract picked earlier, so opening this screen from the menu
  // without one in the URL still shows data rather than an empty state.
  const contractNumber = searchParams.get("contract") ?? selectedContract ?? "";

  useEffect(() => {
    if (contractNumber) setSelectedContract(contractNumber);
  }, [contractNumber, setSelectedContract]);

  return (
    <div className="assign-transports-page">
      <div className="assign-transports-card">
        <div className="assign-transports-card__header">
          <h1>
            View All Trucks By Contract
            {contractNumber && (
              <span className="assign-transports-card__contract-no"> — Contract: {contractNumber}</span>
            )}
          </h1>
          <Link to="/truck-management/open-pending-contracts" className="assign-transports-card__back">
            <FiArrowLeft aria-hidden /> Back to Open &amp; Pending Contracts
          </Link>
        </div>

        <PendingContractSelector
          value={contractNumber}
          onChange={(value) => setSearchParams({ contract: value })}
        />

        {contractNumber ? (
          <ViewTrucksByContractSummary contractNumber={contractNumber} />
        ) : (
          <InfoPanel
            icon={FiFileText}
            title="No Contract Selected"
            description="Open a contract from the Open & Pending Contracts list and use the truck icon to view its trucks, or open this page from there directly."
            action={{ label: "Go to Open & Pending Contracts", to: "/truck-management/open-pending-contracts" }}
          />
        )}
      </div>
    </div>
  );
};

export default ViewTrucksByContract;
