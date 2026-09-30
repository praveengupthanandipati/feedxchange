import { useMemo, useState } from "react";
import { FiFileText, FiTruck, FiCheckCircle, FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  useGetContractByContractNumberQuery,
  useGetAllOpenAndPendingContractsQuery,
} from "../../../store/contractsApi";
import { useContractTruckDetails } from "./useContractTruckDetails";
import { useContractQuantitySummary } from "./useContractQuantitySummary";
import "../assign-transports/Assigntransports.scss";

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatText(value: string | null | undefined): string {
  return value?.trim() ? value : "-";
}

interface DetailEntry {
  label: string;
  value: string;
}

/** "" for anything the contract has not filled in, so the field can be left out. */
function asText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function asNumberText(value: number | null | undefined, suffix = ""): string {
  return value == null ? "" : `${value.toLocaleString("en-IN")}${suffix}`;
}

function asDate(value: string | null | undefined): string {
  if (!value) return "";
  const formatted = formatDisplayDate(value);
  return formatted === "-" ? "" : formatted;
}

function asDateRange(from: string | null | undefined, to: string | null | undefined): string {
  const start = asDate(from);
  const end = asDate(to);
  if (start && end) return start === end ? start : `${start} to ${end}`;
  return start || end;
}

interface ContractSummaryPanelProps {
  contractNumber: string;
  /**
   * Detail fields to show alongside the ones read off the contract. A field here
   * replaces the contract's own when the labels match, so a screen can show its own
   * addresses — a schedule's, say — in place of the contract's.
   */
  extraFields?: DetailEntry[];
}

const ContractSummaryPanel = ({ contractNumber, extraFields = [] }: ContractSummaryPanelProps) => {
  // Collapsed by default; the quantity cards above stay visible.
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: contract } = useGetContractByContractNumberQuery(contractNumber, { skip: !contractNumber });
  const { data: openAndPendingContracts } = useGetAllOpenAndPendingContractsQuery();
  const { trucks } = useContractTruckDetails(contractNumber, Boolean(contractNumber));

  const matchingOpenContract = useMemo(
    () => openAndPendingContracts?.find((row) => row.contractNumber === contractNumber),
    [openAndPendingContracts, contractNumber],
  );

  // Pending and arranged come from what transporters have accepted, not from the list
  // endpoint's pendingQuantityMT, which does not move when a schedule is accepted.
  const { totalQty, dispatchedQty, committedQty, availableQty } =
    useContractQuantitySummary(contractNumber);
  const pendingQty = availableQty;
  const arrangedQty = Math.max(committedQty - dispatchedQty, 0);

  // Everything the contract actually carries. Fields the contract has not filled in
  // are dropped rather than shown as "-", so the grid only ever holds real data.
  const detailFields = useMemo(() => {
    const basic = contract?.basicDetails;
    const seller = contract?.sellerConditions;
    const buyer = contract?.buyerConditions;
    const payments = contract?.paymentsInvoices;

    const fromContract: DetailEntry[] = [
      { label: "Loading Address", value: asText(seller?.loadingAddressAt) },
      { label: "Delivery Address", value: asText(buyer?.loadingAddressAt) },
      { label: "Delivery Type", value: asText(basic?.deliveryType) },
      { label: "Delivery Schedule", value: asText(seller?.deliverySchedule) },
      {
        label: "Seller Delivery Window",
        value: asDateRange(seller?.sellerFromDate, seller?.sellerToDate),
      },
      {
        label: "Buyer Delivery Window",
        value: asDateRange(buyer?.buyerFromDate, buyer?.buyerToDate),
      },
      { label: "Contract Rate", value: basic?.contractRate == null ? "" : `₹${asNumberText(basic.contractRate)}` },
      { label: "Net Rate", value: basic?.netRate == null ? "" : `₹${asNumberText(basic.netRate)}` },
      { label: "GST", value: asNumberText(basic?.gstPercentage, "%") },
      { label: "PO Tolerance", value: asNumberText(basic?.poTolerancePercentage, "%") },
      { label: "Indicative Freight", value: basic?.indicativeFreight == null ? "" : `₹${asNumberText(basic.indicativeFreight)}` },
      { label: "Payment Terms", value: asText(payments?.paymentTerms) },
      { label: "Contract Status", value: asText(basic?.calculatedStatus) },
    ].filter((field) => field.value);

    // A caller's field wins over the contract's when both use the same label.
    const overridden = new Set(extraFields.map((field) => field.label));
    return [
      ...fromContract.filter((field) => !overridden.has(field.label)),
      ...extraFields.filter((field) => field.value),
    ];
  }, [contract, extraFields]);

  return (
    <>
      <div className="assign-transports-stats">
        <div className="assign-transports-stats__card assign-transports-stats__card--navy">
          <span className="assign-transports-stats__icon">
            <FiFileText aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Contract Qty</span>
            <strong>{totalQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--success">
          <span className="assign-transports-stats__icon">
            <FiTruck aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Dispatched</span>
            <strong>{dispatchedQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--info">
          <span className="assign-transports-stats__icon">
            <FiCheckCircle aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Vehicle Arranged</span>
            <strong>{arrangedQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--warning">
          <span className="assign-transports-stats__icon">
            <FiClock aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Pending Qty</span>
            <strong>{pendingQty} MT</strong>
          </span>
        </div>
        <div className="assign-transports-stats__card assign-transports-stats__card--danger">
          <span className="assign-transports-stats__icon">
            <FiTruck aria-hidden />
          </span>
          <span className="assign-transports-stats__body">
            <span className="assign-transports-stats__label">Total Trucks Assigned</span>
            <strong>{trucks.length}</strong>
          </span>
        </div>
      </div>

      <div className="assign-transports-details">
        <div className="assign-transports-details__header" style={detailsOpen ? undefined : { marginBottom: 0 }}>
          <button
            type="button"
            className="assign-transports-details__toggle"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
          >
            <h2>Contract Details</h2>
            {detailsOpen ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
          </button>
        </div>
        {detailsOpen && (
        <div className="assign-transports-details__grid">
          <div className="assign-transports-details__field">
            <span>Seller Name</span>
            <strong>{formatText(contract?.sellerName ?? matchingOpenContract?.seller)}</strong>
          </div>
          <div className="assign-transports-details__field">
            <span>Buyer Name</span>
            <strong>{formatText(contract?.buyerName ?? matchingOpenContract?.buyer)}</strong>
          </div>
          <div className="assign-transports-details__field">
            <span>Date of Contract</span>
            <strong>{formatDisplayDate(contract?.contractDate ?? matchingOpenContract?.contractDate)}</strong>
          </div>
          <div className="assign-transports-details__field">
            <span>Product Name</span>
            <strong>{formatText(contract?.productName)}</strong>
          </div>
          {detailFields.map((field) => (
            <div className="assign-transports-details__field" key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </div>
          ))}
        </div>
        )}
      </div>
    </>
  );
};

export default ContractSummaryPanel;
