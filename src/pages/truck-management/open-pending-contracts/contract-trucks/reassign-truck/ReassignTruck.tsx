import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiTruck } from "react-icons/fi";
import InfoPanel from "../InfoPanel";
import SearchableSelect from "../../../../../components/dropdown/SearchableSelect";
import { useGetAllActiveDriversQuery } from "../../../../../store/driversApi";
import { useGetProfileAddressQuery } from "../../../../../store/userProfilesCommonApi";
import {
  useGetAllOpenAndPendingContractsQuery,
  useGetContractByContractNumberQuery,
  type OpenAndPendingContract,
} from "../../../../../store/contractsApi";
import {
  getApiErrorMessage,
  useGetContractTruckChainOverviewQuery,
  useReassignContractTruckMutation,
  type ContractTruckChainOverview,
} from "../../../../../store/contractTrucksApi";
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import { splitApiDateTimeForForm } from "../../../../../utils/apiDateTime";
import "./ReassignTruck.scss";
// The header row is shared with the Contract chain screen.
import "../truck-chain/ContractTruckChain.scss";

function formatQty(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${value.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} MT`;
}

function formatFreight(value: number | null | undefined): string {
  if (value == null) return "-";
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / MT`;
}

function formatAddress(address: { officeName: string; addressLine1: string; city: string; pincode: string }) {
  return [address.officeName, address.addressLine1, address.city, address.pincode]
    .filter(Boolean)
    .join(", ");
}

/**
 * GetAllOpenAndPendingContracts prefixes the city onto the party, as in
 * "Adilabad - Vimal Agro Exports", while the chain returns the bare name. Both are
 * reduced to the name before comparing.
 */
function samePartyName(listName: string | null | undefined, partyName: string): boolean {
  if (!listName || !partyName) return false;
  const bare = (value: string) => value.split(" - ").pop()?.trim().toLowerCase() ?? "";
  return bare(listName) === bare(partyName);
}

/**
 * Whether a listed contract carries the same product as the one being re-assigned.
 * Matched on product id when the list carries one, falling back to the name — the
 * list endpoint only guarantees productName.
 */
function sameProduct(
  row: OpenAndPendingContract,
  sourceProductId: number | null,
  sourceProductName: string | null,
): boolean {
  if (sourceProductId != null && row.productId != null) return row.productId === sourceProductId;
  if (!sourceProductName || !row.productName) return false;
  return row.productName.trim().toLowerCase() === sourceProductName.trim().toLowerCase();
}

interface ReassignFormProps {
  contractNumber: string;
  contractTruckId: number;
  overview: ContractTruckChainOverview;
}

const ReassignForm = ({ contractNumber, contractTruckId, overview }: ReassignFormProps) => {
  const navigate = useNavigate();
  const { truck, legs } = overview;

  const sourceLeg = legs.find((leg) => leg.contractDispatchId === contractTruckId) ?? legs[0];

  // Either party on the source leg can re-assign the truck. Each has a yard on it: the
  // seller's is where the leg loads, the buyer's is where it delivers.
  const parties = useMemo(
    () =>
      sourceLeg
        ? [
            {
              id: sourceLeg.sellerProfileId,
              name: sourceLeg.sellerName,
              yardAddressId: sourceLeg.fromAddressId,
              yardAddress: sourceLeg.loadingAddress,
            },
            {
              id: sourceLeg.buyerProfileId,
              name: sourceLeg.buyerName,
              yardAddressId: sourceLeg.toAddressId,
              yardAddress: sourceLeg.deliveryAddress,
            },
          ]
        : [],
    [sourceLeg],
  );

  const { data: sourceContract, isFetching: loadingSource } =
    useGetContractByContractNumberQuery(contractNumber);
  const { data: openContracts } = useGetAllOpenAndPendingContractsQuery();
  const { data: drivers } = useGetAllActiveDriversQuery();
  const [reassignContractTruck, { isLoading: saving }] = useReassignContractTruckMutation();

  const driverPhone = drivers?.find((d) => d.driverId === truck.driverId)?.mobileNumber ?? "";

  const [targetContractNumber, setTargetContractNumber] = useState("");
  const [loadingAddressId, setLoadingAddressId] = useState("");
  const [lrNumber, setLrNumber] = useState("");
  const [assignedOn, setAssignedOn] = useState("");
  const [freightMode, setFreightMode] = useState<"same" | "override">("same");
  const [freightOverride, setFreightOverride] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const { data: targetContract, isFetching: loadingTarget } = useGetContractByContractNumberQuery(
    targetContractNumber,
    { skip: !targetContractNumber },
  );

  // Every open contract either party is on — as buyer or seller — for the product on the
  // truck. A truck carries one product, so a contract for anything else can never be a
  // valid target.
  const targetOptions = useMemo(() => {
    if (!sourceContract) return [];

    return (openContracts ?? []).filter(
      (row) =>
        row.contractNumber !== contractNumber &&
        parties.some((party) => samePartyName(row.buyer, party.name) || samePartyName(row.seller, party.name)) &&
        sameProduct(row, sourceContract.productId, sourceContract.productName),
    );
  }, [openContracts, contractNumber, parties, sourceContract]);

  // The role a party holds on the chosen target, matched on profile id once the contract
  // has loaded and on the listed name until then.
  const targetRow = targetOptions.find((row) => row.contractNumber === targetContractNumber);
  const roleOnTarget = (party: (typeof parties)[number]): "seller" | "buyer" | null => {
    if (targetContract?.sellerId || targetContract?.buyerId) {
      if (targetContract.sellerId === party.id) return "seller";
      if (targetContract.buyerId === party.id) return "buyer";
      return null;
    }
    if (samePartyName(targetRow?.seller, party.name)) return "seller";
    if (samePartyName(targetRow?.buyer, party.name)) return "buyer";
    return null;
  };

  // The party on the target re-assigns it. Selling on the target sends the truck
  // downstream: it loads at their yard and is delivered to the target's buyer. Buying on
  // it sends the truck upstream: it loads at the target's seller and is delivered to their yard.
  const actingParty = parties.find((party) => roleOnTarget(party) !== null);
  const isDownstream = actingParty ? roleOnTarget(actingParty) === "seller" : false;

  // The end of the new leg away from the acting party's yard is picked from the other
  // party's addresses on the target contract.
  const counterpartyId = (isDownstream ? targetContract?.buyerId : targetContract?.sellerId) ?? 0;
  const { data: counterpartyAddresses } = useGetProfileAddressQuery(String(counterpartyId), {
    skip: !counterpartyId,
  });

  useEffect(() => {
    if (!sourceLeg || assignedOn) return;
    const { date, time } = splitApiDateTimeForForm(sourceLeg.assignedOn);
    if (date && time) setAssignedOn(`${date}T${time}`);
  }, [sourceLeg, assignedOn]);

  if (!sourceLeg) {
    return (
      <InfoPanel
        icon={FiTruck}
        title="Truck Not Found"
        description="This truck has no chain on the contract. Open View All Trucks and use Re-assign on one of its trucks."
        action={{
          label: "Go to View All Trucks",
          to: `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`,
        }}
      />
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!targetContractNumber) nextErrors.targetContract = "Select the contract to re-assign onto.";
    if (!loadingAddressId)
      nextErrors.loadingAddress = `Select the ${isDownstream ? "delivery" : "loading"} address for this leg.`;
    if (!lrNumber.trim()) nextErrors.lrNumber = "LR number is required for this leg.";
    if (!assignedOn) nextErrors.assignedOn = "Assigned on is required.";
    if (freightMode === "override") {
      if (!freightOverride.trim()) nextErrors.freight = "Enter the freight for this leg.";
      else if (!/^\d+(\.\d+)?$/.test(freightOverride.trim()) || Number(freightOverride) <= 0)
        nextErrors.freight = "Enter a valid freight amount greater than 0.";
    }
    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!targetContract?.id || !actingParty) {
      setSubmitError("That contract could not be loaded. Pick it again.");
      return;
    }

    setSubmitError("");

    try {
      const { succeeded, errorMessage } = await reassignContractTruck({
        sourceContractDispatchId: sourceLeg.contractDispatchId,
        targetContractId: targetContract.id,
        reassignedByProfileId: actingParty.id,
        // One end is the acting party's yard on the source leg; the other was picked above.
        loadingAddressId: isDownstream ? actingParty.yardAddressId : Number(loadingAddressId),
        deliveryAddressId: isDownstream ? Number(loadingAddressId) : actingParty.yardAddressId,
        lrNumber: lrNumber.trim(),
        assignedOn: new Date(assignedOn).toISOString(),
        freightPerMT: freightMode === "same" ? sourceLeg.freightPerMT : Number(freightOverride),
        createdBy: Number(localStorage.getItem("userId")) || 0,
      }).unwrap();

      if (!succeeded) {
        setSubmitError(errorMessage || "The server rejected this re-assignment. Please try again.");
        return;
      }

      navigate(
        `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`,
      );
    } catch (error) {
      // A refusal sent with an error status carries its reason in the body.
      const data = error && typeof error === "object" ? (error as { data?: unknown }).data : undefined;
      setSubmitError(getApiErrorMessage(data) || "Failed to re-assign this truck. Please try again.");
    }
  };

  return (
    <>
      <div className="reassign-truck__layout reassign-truck__layout--single">
        <div className="reassign-truck__main">
          <section className="reassign-truck__panel reassign-truck__source">
            <div className="reassign-truck__source-head">
              <span className="reassign-truck__source-truck">
                <FiTruck aria-hidden />
                <strong>{truck.registrationNumber}</strong>
              </span>
              <span className="reassign-truck__status">{truck.dispatchStatusName}</span>
            </div>
            <p className="reassign-truck__source-sub">
              {sourceLeg.contractNumber} · {sourceLeg.sellerName} → {sourceLeg.buyerName}
            </p>

            <div className="reassign-truck__source-grid">
              <div>
                <span>Transporter</span>
                <strong>{truck.transporterName}</strong>
              </div>
              <div>
                <span>Driver</span>
                <strong>
                  {truck.driverName}
                  {driverPhone ? ` · ${driverPhone}` : ""}
                </strong>
              </div>
              <div>
                <span>Quantity</span>
                <strong>{formatQty(truck.quantityMT)}</strong>
              </div>
              <div>
                <span>LR Number</span>
                <strong>{sourceLeg.lrNumber || "-"}</strong>
              </div>
              <div>
                <span>Freight</span>
                <strong>{formatFreight(sourceLeg.freightPerMT)}</strong>
              </div>
              <div>
                <span>Delivers to</span>
                <strong>{sourceLeg.deliveryAddress}</strong>
              </div>
            </div>

          </section>

          <section className="reassign-truck__panel">
            <h2 className="reassign-truck__panel-title">Re-assignment Details</h2>

            <div className="reassign-truck__field">
              <label>
                Re-assign onto contract <span className="reassign-truck__required">*</span>
              </label>
              <SearchableSelect
                options={targetOptions.map((row) => ({
                  value: row.contractNumber,
                  label: `${row.contractNumber} · ${row.seller ?? "-"} → ${row.buyer ?? "-"} · ${row.productName} · ${formatQty(row.pendingQuantityMT)} pending`,
                }))}
                value={targetContractNumber}
                onChange={(value) => {
                  setTargetContractNumber(value);
                  setLoadingAddressId("");
                }}
                placeholder={loadingSource ? "Loading contracts…" : "Select a contract"}
                ariaLabel="Re-assign onto contract"
              />
              {!loadingSource && targetOptions.length === 0 && (
                <p className="reassign-truck__hint">
                  No other open {sourceContract?.productName ?? ""} contract for {sourceLeg.sellerName} or{" "}
                  {sourceLeg.buyerName}
                </p>
              )}
              {errors.targetContract && <p className="reassign-truck__error">{errors.targetContract}</p>}
            </div>

            <div className="reassign-truck__field">
              <label>
                {isDownstream ? "Delivery address" : "Loading address"}{" "}
                <span className="reassign-truck__required">*</span>
              </label>
              <SearchableSelect
                options={(counterpartyAddresses ?? []).map((address) => ({
                  value: String(address.addressId),
                  label: formatAddress(address),
                }))}
                value={loadingAddressId}
                onChange={setLoadingAddressId}
                disabled={!targetContractNumber || loadingTarget}
                placeholder={
                  loadingTarget
                    ? "Loading contract…"
                    : `Select a ${isDownstream ? "delivery" : "loading"} address`
                }
                ariaLabel={isDownstream ? "Delivery address" : "Loading address"}
              />
              <p className="reassign-truck__hint">
                {actingParty
                  ? `${isDownstream ? "Loads at" : "Delivers to"} ${actingParty.yardAddress} · ${sourceLeg.contractNumber}`
                  : "Select a contract first."}
              </p>
              {errors.loadingAddress && <p className="reassign-truck__error">{errors.loadingAddress}</p>}
            </div>

            <div className="reassign-truck__row reassign-truck__row--three">
              <div className="reassign-truck__field">
                <label htmlFor="reassign-lr">
                  LR Number <span className="reassign-truck__required">*</span>
                </label>
                <input
                  id="reassign-lr"
                  type="text"
                  className="reassign-truck__control"
                  value={lrNumber}
                  onChange={(event) => setLrNumber(event.target.value)}
                />
                {errors.lrNumber && <p className="reassign-truck__error">{errors.lrNumber}</p>}
              </div>

              <div className="reassign-truck__field">
                <label htmlFor="reassign-assigned-on">Assigned on</label>
                <input
                  id="reassign-assigned-on"
                  type="datetime-local"
                  className="reassign-truck__control"
                  value={assignedOn}
                  onChange={(event) => setAssignedOn(event.target.value)}
                />
                {errors.assignedOn && <p className="reassign-truck__error">{errors.assignedOn}</p>}
              </div>

              <div className="reassign-truck__field">
                <span className="reassign-truck__label">Freight</span>
              <div className="reassign-truck__freight">
                <label
                  className={`reassign-truck__freight-option ${freightMode === "same" ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="freight-mode"
                    checked={freightMode === "same"}
                    onChange={() => setFreightMode("same")}
                  />
                  Keep {formatFreight(sourceLeg.freightPerMT)}
                </label>
                <label
                  className={`reassign-truck__freight-option ${freightMode === "override" ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="freight-mode"
                    checked={freightMode === "override"}
                    onChange={() => setFreightMode("override")}
                  />
                  Override
                  <input
                    type="text"
                    inputMode="decimal"
                    className="reassign-truck__control reassign-truck__freight-input"
                    placeholder="₹0.00"
                    value={freightOverride}
                    onChange={(event) => setFreightOverride(event.target.value)}
                    onFocus={() => setFreightMode("override")}
                    aria-label="Freight"
                  />
                </label>
              </div>
                {errors.freight && <p className="reassign-truck__error">{errors.freight}</p>}
              </div>
            </div>

            {submitError && <p className="reassign-truck__error">{submitError}</p>}

            <div className="reassign-truck__actions">
              <Link
                to={`/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`}
                className="reassign-truck__cancel"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="reassign-truck__submit"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Re-assigning…" : "Re-assign truck"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

const ReassignTruck = () => {
  const [searchParams] = useSearchParams();
  const { selectedContract, setSelectedContract } = useSelectedContract();
  // Falls back to the contract picked earlier, so opening this screen from the menu
  // without one in the URL still shows data rather than an empty state.
  const contractNumber = searchParams.get("contract") ?? selectedContract ?? "";
  const contractTruckId = Number(searchParams.get("contractTruckId") ?? 0);

  const requestingUserId = Number(localStorage.getItem("userId")) || 0;
  const { data: overview, isFetching } = useGetContractTruckChainOverviewQuery(
    { contractDispatchId: contractTruckId, requestingUserId },
    { skip: !contractTruckId },
  );

  useEffect(() => {
    if (contractNumber) setSelectedContract(contractNumber);
  }, [contractNumber, setSelectedContract]);


  return (
    <div className="reassign-truck">
      <p className="reassign-truck__breadcrumb">
        <Link to="/truck-management/open-pending-contracts">Contracts</Link>
        {contractNumber && (
          <>
            {` / ${contractNumber} / Trucks`}
            {overview ? ` / ${overview.truck.registrationNumber}` : ""}
          </>
        )}
      </p>

      <div className="truck-chain__header">
        <h1 className="reassign-truck__heading">Re-assign truck</h1>
        <Link
          to={
            contractNumber
              ? `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`
              : "/truck-management/open-pending-contracts/view-trucks"
          }
          className="reassign-truck__cancel"
        >
          <FiArrowLeft aria-hidden /> View All Trucks
        </Link>
      </div>
      {!contractNumber || !contractTruckId ? (
        <InfoPanel
          icon={FiFileText}
          title="No Truck Selected"
          description="Open a contract, go to View All Trucks and use Re-assign on the truck you want to move onto another contract."
          action={{ label: "Go to Open & Pending Contracts", to: "/truck-management/open-pending-contracts" }}
        />
      ) : isFetching ? (
        <p className="reassign-truck__notice">Loading this truck chain…</p>
      ) : !overview ? (
        <InfoPanel
          icon={FiTruck}
          title="Chain Not Available"
          description="The chain for this truck could not be loaded. Go back to View All Trucks and try again."
          action={{
            label: "Go to View All Trucks",
            to: `/truck-management/open-pending-contracts/view-trucks?contract=${encodeURIComponent(contractNumber)}`,
          }}
        />
      ) : (
        <ReassignForm
          contractNumber={contractNumber}
          contractTruckId={contractTruckId}
          overview={overview}
        />
      )}
    </div>
  );
};

export default ReassignTruck;
