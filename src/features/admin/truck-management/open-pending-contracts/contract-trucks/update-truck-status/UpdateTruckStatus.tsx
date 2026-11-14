import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, DownloadIcon, FileTextIcon, PenIcon, SaveIcon, TruckIcon, UploadIcon } from "../../../../../../shared/components/icon";
import InfoPanel from "../InfoPanel";
import SearchableSelect from "../../../../../../shared/components/dropdown/SearchableSelect";
import ContractSummaryPanel from "../../../contract-trucks/ContractSummaryPanel";
import PendingContractSelector from "../../../contract-trucks/PendingContractSelector";
import EditContractTruckModal from "../../../contract-trucks/EditContractTruckModal";
import {
  useContractTruckDetails,
  type ContractTruckDetail,
} from "../../../contract-trucks/useContractTruckDetails";
import {
  downloadTruckInvoice,
  getApiErrorMessage,
  useGetContractTruckDispatchStatusesQuery,
  useGetTruckInvoicesByContractQuery,
  useUpdateContractTruckStatusMutation,
  useUploadTruckInvoiceMutation,
  type TruckInvoice,
} from "../../../../../../core/store/contractTrucksApi";
import { useGetContractByContractNumberQuery } from "../../../../../../core/store/contractsApi";
import { useSelectedContract } from "../../../../../../core/context/SelectedContractContext";
import { usePermission } from "../../../../../../core/auth/AuthContext";
import "../../../assign-transports/Assigntransports.scss";
import "./UpdateTruckStatus.scss";

const MAX_INVOICE_FILE_SIZE_MB = 5;
const ALLOWED_INVOICE_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

// GetContractTruckDispatchStatuses still returns every status (Loading, InTransit,
// Delivered too). Until the backend narrows it, only these two can be set from here;
// a truck starts out Assigned and that stays its default.
const SELECTABLE_STATUS_NAMES = ["loaded", "cancelled"];

function statusModifier(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("deliver")) return "delivered";
  if (normalized.includes("transit")) return "transit";
  if (normalized.includes("load")) return "loaded";
  return "assigned";
}

interface UpdateTruckStatusRowProps {
  /** The contract the trucks belong to (the seller invoice is opened for it). */
  contractNumber: string;
  truck: ContractTruckDetail;
  statusOptions: { value: string; label: string }[];
  sellerId: number;
  buyerId: number;
  /** The invoice already stored for this truck, if any. */
  invoice?: TruckInvoice;
}

const UpdateTruckStatusRow = ({ contractNumber, truck, statusOptions, sellerId, buyerId, invoice }: UpdateTruckStatusRowProps) => {
  const [selectedStatusId, setSelectedStatusId] = useState(String(truck.dispatchStatusId));
  /**
   * Loaded is not set by hand here: picking it opens Create Seller Invoice with this contract and truck filled in,
   * and saving that invoice marks the truck Loaded. Any other status is picked and saved here as before.
   */
  const canEnterSellerInvoice = usePermission("seller-invoice.view");
  const handleStatusPick = (value: string) => {
    const label = statusOptions.find((option) => option.value === value)?.label.trim().toLowerCase();
    if (label === "loaded") {
      setError("");
      // Without Seller Invoice access the redirect would be blocked: say who can do it instead.
      if (!canEnterSellerInvoice) {
        setError("A truck becomes Loaded when its seller invoice is saved. Please ask someone with Seller Invoice access to enter it.");
        return;
      }
      // Contract, truck, dispatch and the truck's quantity are filled in on the invoice.
      const query = new URLSearchParams({
        contract: contractNumber,
        truck: truck.truckNumber,
        dispatch: String(truck.contractTruckId),
        qty: String(truck.raw?.quantityMT ?? ""),
      });
      navigate(`/admin/payments/seller-invoice?${query.toString()}`);
      return;
    }
    setSelectedStatusId(value);
  };
  const [updateContractTruckStatus, { isLoading: saving }] = useUpdateContractTruckStatusMutation();
  const navigate = useNavigate();
  const [uploadTruckInvoice, { isLoading: uploading }] = useUploadTruckInvoiceMutation();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [invoiceFileName, setInvoiceFileName] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [editing, setEditing] = useState(false);
  const invoiceInputRef = useRef<HTMLInputElement | null>(null);

  const hasChanged = selectedStatusId !== String(truck.dispatchStatusId);
  const isLoaded = truck.status.trim().toLowerCase() === "loaded";
  // The current status stays in the list so the dropdown can show it; the rest of the
  // choices are the two this screen is allowed to set.
  const rowStatusOptions = statusOptions.filter(
    (option) =>
      option.value === String(truck.dispatchStatusId) ||
      SELECTABLE_STATUS_NAMES.includes(option.label.trim().toLowerCase()),
  );

  const selectedStatusLabel = statusOptions.find((option) => option.value === selectedStatusId)?.label ?? "";
  // Exact matches: "Loading" is not "Loaded".
  const selectedStatus = selectedStatusLabel.trim().toLowerCase();
  const isCancelled = truck.status.trim().toLowerCase() === "cancelled";
  const selectedIsCancelled = selectedStatus === "cancelled";
  const selectedIsLoaded = selectedStatus === "loaded";
  // Neither can be moved back to Assigned, so both are the end of the road for this row.
  const isFinalStatus = isLoaded || isCancelled;
  // A truck becomes Loaded by saving its seller invoice; the invoice copy (scan / PDF) can then be attached here
  // until one is stored.
  const showUploadInvoice = isLoaded && !invoice && !invoiceFileName;
  const isAssigned = truck.status.trim().toLowerCase() === "assigned";
  // Dispatch details stay editable only while the truck is, and stays, merely assigned.
  const showEditDetails = isAssigned && !selectedIsLoaded && !selectedIsCancelled;

  const handleUpdate = async () => {
    setError("");
    setSaved(false);
    const currentUserId = Number(localStorage.getItem("userId")) || 0;

    // (Loaded never reaches here: picking it opens Create Seller Invoice, see handleStatusPick.)
    try {
      const succeeded = await updateContractTruckStatus({
        contractDispatchId: truck.contractTruckId,
        dispatchStatusId: Number(selectedStatusId),
        modifiedBy: currentUserId,
      }).unwrap();

      if (!succeeded) {
        setError("The server rejected this status update. Please try again.");
        return;
      }
      setSaved(true);
      // (Loaded is not saved here; its "truck loaded" notification is offered after the seller invoice is saved.)
    } catch (error) {
      setError(getApiErrorMessage((error as { data?: unknown })?.data) || "Failed to update truck status. Please try again.");
    }
  };

  const handleInvoiceChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setInvoiceFileName("");
    setInvoiceError("");

    if (!ALLOWED_INVOICE_FILE_TYPES.includes(file.type)) {
      setInvoiceError("Unsupported file format. Upload a JPG, PNG or PDF.");
      return;
    }
    if (file.size > MAX_INVOICE_FILE_SIZE_MB * 1024 * 1024) {
      setInvoiceError(`Invoice must be ${MAX_INVOICE_FILE_SIZE_MB} MB or smaller.`);
      return;
    }

    try {
      // Stored against this truck's dispatch, so it can be downloaded again later.
      await uploadTruckInvoice({
        contractDispatchId: truck.contractTruckId,
        file,
        modifiedBy: Number(localStorage.getItem("userId")) || 0,
      }).unwrap();
      setInvoiceFileName(file.name);
    } catch (uploadError) {
      const data = uploadError && typeof uploadError === "object" ? (uploadError as { data?: unknown }).data : undefined;
      setInvoiceError(getApiErrorMessage(data) || "Failed to upload invoice. Please try again.");
    }
  };

  const handleInvoiceDownload = async () => {
    setInvoiceError("");
    setDownloading(true);
    try {
      await downloadTruckInvoice(truck.contractTruckId, invoice?.fileName ?? invoiceFileName);
    } catch (downloadError) {
      setInvoiceError(downloadError instanceof Error ? downloadError.message : "Failed to download the invoice.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="update-truck-status-card">
      <div className="update-truck-status-card__header">
        <span className="update-truck-status-card__truck">
          <TruckIcon aria-hidden /> {truck.truckNumber}
        </span>

        <span className="update-truck-status-card__meta">
          <span>
            Transporter: <strong>{truck.transporterName}</strong>
          </span>
          <span>
            Qty: <strong>{truck.finalQty}</strong>
          </span>
          <span>
            LR: <strong>{truck.lrNumber}</strong>
          </span>
        </span>

        {/* The dropdown already shows the current status, so the pill is only for
            trucks that have no dropdown. */}
        {isFinalStatus && (
          <span className="update-truck-status-card__current">
            <span
              className={`update-truck-status-card__status update-truck-status-card__status--${statusModifier(
                truck.status,
              )}`}
            >
              {truck.status}
            </span>
          </span>
        )}

        <div className="update-truck-status-card__control">
          {/* Loaded and cancelled are final on the server, so they get no dropdown. */}
          {!isFinalStatus && (
            <SearchableSelect
              options={rowStatusOptions}
              value={selectedStatusId}
              onChange={handleStatusPick}
              placeholder="Select Status"
              ariaLabel={`Update status for ${truck.truckNumber}`}
            />
          )}

          {showUploadInvoice && (
            <>
              <button
                type="button"
                className="update-truck-status-card__upload"
                onClick={() => invoiceInputRef.current?.click()}
                disabled={uploading}
              >
                <UploadIcon aria-hidden /> {uploading ? "Uploading…" : "Upload Invoice"}
              </button>
              <input
                ref={invoiceInputRef}
                type="file"
                className="update-truck-status-card__file-input"
                accept={ALLOWED_INVOICE_FILE_TYPES.join(",")}
                onChange={handleInvoiceChange}
                aria-label={`Upload invoice for ${truck.truckNumber}`}
              />
            </>
          )}

          {invoice && (
            <button
              type="button"
              className="update-truck-status-card__upload"
              onClick={handleInvoiceDownload}
              disabled={downloading}
              title={invoice.fileName}
            >
              <DownloadIcon aria-hidden /> {downloading ? "Downloading…" : "Download Invoice"}
            </button>
          )}

          {!isFinalStatus && (
            <button
              type="button"
              className="update-truck-status-card__save"
              onClick={handleUpdate}
              disabled={!hasChanged || saving}
            >
              <SaveIcon aria-hidden /> {saving ? "Updating…" : selectedIsLoaded ? "Create Invoice" : "Update"}
            </button>
          )}

          {showEditDetails && (
            <button
              type="button"
              className="update-truck-status-card__edit"
              onClick={() => setEditing(true)}
            >
              <PenIcon aria-hidden /> Edit Details
            </button>
          )}
        </div>
      </div>

      {saved && <p className="update-truck-status-card__success">Status updated.</p>}
      {error && <p className="update-truck-status-card__error">{error}</p>}
      {invoiceFileName && (
        <p className="update-truck-status-card__success">Invoice uploaded: {invoiceFileName}</p>
      )}
      {invoiceError && <p className="update-truck-status-card__error">{invoiceError}</p>}

      {editing && (
        <EditContractTruckModal
          open={editing}
          truck={truck.raw}
          sellerId={sellerId}
          buyerId={buyerId}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setSaved(true);
          }}
        />
      )}
    </div>
  );
};

const UpdateTruckStatusContent = ({ contractNumber }: { contractNumber: string }) => {
  const { trucks, isLoading, isError: trucksFailed } = useContractTruckDetails(contractNumber, true);
  const { data: dispatchStatuses } = useGetContractTruckDispatchStatusesQuery();
  const { data: contract } = useGetContractByContractNumberQuery(contractNumber);
  const { data: invoices } = useGetTruckInvoicesByContractQuery({ contractId: contract?.id ?? 0 }, { skip: !contract?.id });

  const statusOptions = (dispatchStatuses ?? []).map((status) => ({
    value: String(status.dispatchStatusId),
    label: status.displayName,
  }));

  if (isLoading) {
    return <p className="update-truck-status-card__empty">Loading trucks…</p>;
  }

  if (trucks.length === 0 && trucksFailed) {
    return (
      <InfoPanel
        icon={TruckIcon}
        title="Trucks Could Not Be Loaded"
        description="The trucks for this contract could not be loaded. Please try again."
      />
    );
  }

  if (trucks.length === 0) {
    return (
      <InfoPanel
        icon={TruckIcon}
        title="No Trucks Yet"
        description="This contract has no trucks assigned yet. Use Add Instant Truck or Schedule Dispatch first."
      />
    );
  }

  return (
    <div className="update-truck-status-list">
      {trucks.map((truck) => (
        <UpdateTruckStatusRow
          key={truck.contractTruckId}
          contractNumber={contractNumber}
          truck={truck}
          statusOptions={statusOptions}
          invoice={invoices?.find((item) => item.contractDispatchId === truck.contractTruckId)}
          sellerId={contract?.sellerId ?? 0}
          buyerId={contract?.buyerId ?? 0}
        />
      ))}
    </div>
  );
};

const UpdateTruckStatus = () => {
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
            Update Truck Status
            {contractNumber && (
              <span className="assign-transports-card__contract-no"> — Contract: {contractNumber}</span>
            )}
          </h1>
          <Link to="/admin/truck-management/open-pending-contracts" className="assign-transports-card__back">
            <ArrowLeftIcon aria-hidden /> Back to Open &amp; Pending Contracts
          </Link>
        </div>

        <PendingContractSelector
          value={contractNumber}
          onChange={(value) => setSearchParams({ contract: value })}
        />

        {contractNumber ? (
          <>
            <ContractSummaryPanel contractNumber={contractNumber} />
            <UpdateTruckStatusContent contractNumber={contractNumber} />
          </>
        ) : (
          <InfoPanel
            icon={FileTextIcon}
            title="No Contract Selected"
            description="Open a contract from the Open & Pending Contracts list and use Update Truck Status there."
            action={{ label: "Go to Open & Pending Contracts", to: "/admin/truck-management/open-pending-contracts" }}
          />
        )}
      </div>
    </div>
  );
};

export default UpdateTruckStatus;
