import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FiLink, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import { useGetBusinessProfileSummaryQuery } from "../../../store/businessProfilesApi";
import {
  useLazyGetAllContractsByFiltersQuery,
  useGetAllContractStatusesQuery,
  useLazyGetContractByContractIdQuery,
  useUpdateContractStatusMutation,
  type PendingContractApiResponse,
  type GetContractDto,
} from "../../../store/contractsApi";
import { financialYearOptions } from "./contractStatus.data";
import "../NewContract.scss";
import "../ContractDetail.scss";
import "./ContractchangeStatus.scss";

interface DetailFieldProps {
  label: string;
  value: ReactNode;
  full?: boolean;
}

const DetailField = ({ label, value, full }: DetailFieldProps) => (
  <div className={`detail-field ${full ? "new-contract__grid--full" : ""}`}>
    <span className="detail-field__label">{label}</span>
    <p className="detail-field__value">{value || "—"}</p>
  </div>
);

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const formatDisplayDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
};

interface GetContractsDrawerProps {
  open: boolean;
  seller: string;
  buyer: string;
  sellerOptions: { value: string; label: string }[];
  buyerOptions: { value: string; label: string }[];
  rows: PendingContractApiResponse[] | null;
  loading: boolean;
  onSellerChange: (value: string) => void;
  onBuyerChange: (value: string) => void;
  onGetContracts: () => void;
  onAdd: (row: PendingContractApiResponse) => void;
  onClose: () => void;
}

const GetContractsDrawer = ({
  open,
  seller,
  buyer,
  sellerOptions,
  buyerOptions,
  rows,
  loading,
  onSellerChange,
  onBuyerChange,
  onGetContracts,
  onAdd,
  onClose,
}: GetContractsDrawerProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const columns: TableColumn<PendingContractApiResponse>[] = useMemo(
    () => [
      {
        key: "contractDate",
        header: "C.Date",
        sortable: true,
        render: (row) => formatDisplayDate(row.contractDate),
        sortValue: (row) => new Date(row.contractDate).getTime(),
        exportValue: (row) => formatDisplayDate(row.contractDate),
      },
      { key: "contractNumber", header: "Contract #", sortable: true },
      { key: "buyerName", header: "Buyer", sortable: true },
      { key: "sellerName", header: "Seller", sortable: true },
      { key: "productName", header: "Product", sortable: true },
      {
        key: "quantity",
        header: "Total MTs",
        sortable: true,
        align: "right",
        render: (row) => `${row.basicDetails.quantity} ${row.basicDetails.quantityMeasure}`,
        sortValue: (row) => row.basicDetails.quantity,
        exportValue: (row) => `${row.basicDetails.quantity} ${row.basicDetails.quantityMeasure}`,
      },
      {
        key: "contractRate",
        header: "Rate MT",
        sortable: true,
        align: "right",
        render: (row) => formatINR(row.basicDetails.contractRate),
        sortValue: (row) => row.basicDetails.contractRate,
        exportValue: (row) => formatINR(row.basicDetails.contractRate),
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <button
            type="button"
            className="get-contracts-drawer__add-btn"
            onClick={() => onAdd(row)}
          >
            Add
          </button>
        ),
      },
    ],
    [onAdd],
  );

  return createPortal(
    <>
      <div
        className={`get-contracts-drawer__backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
      />
      <div
        className={`get-contracts-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="get-contracts-drawer-title"
      >
        <div className="get-contracts-drawer__header">
          <h2 id="get-contracts-drawer-title">Get Contracts</h2>
          <button
            type="button"
            className="get-contracts-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div className="get-contracts-drawer__body">
          <div className="get-contracts-drawer__filters">
            <div className="form-field">
              <span className="form-field__label">Select Seller</span>
              <SearchableSelect
                options={sellerOptions}
                value={seller}
                onChange={onSellerChange}
                placeholder="Select Seller"
                ariaLabel="Select Seller"
              />
            </div>
            <div className="form-field">
              <span className="form-field__label">Select Buyer</span>
              <SearchableSelect
                options={buyerOptions}
                value={buyer}
                onChange={onBuyerChange}
                placeholder="Select Buyer"
                ariaLabel="Select Buyer"
              />
            </div>
          </div>

          <button
            type="button"
            className="get-contracts-drawer__submit"
            onClick={onGetContracts}
            disabled={loading}
          >
            {loading ? "Loading…" : "Get Contracts"}
          </button>

          {rows !== null && (
            <Table
              columns={columns}
              data={rows}
              rowKey={(row) => row.contractNumber}
              emptyMessage="No contracts found for the selected Seller and Buyer."
            />
          )}
        </div>
      </div>
    </>,
    document.body,
  );
};

const ContractchangeStatus = () => {
  const navigate = useNavigate();

  const [financialYear, setFinancialYear] = useState(financialYearOptions[2]?.value ?? "");
  const [contractNumber, setContractNumber] = useState("");
  const [contractCloseDate, setContractCloseDate] = useState(todayISO());
  const [record, setRecord] = useState<GetContractDto | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [status, setStatus] = useState("");
  const [reviewRemarks, setReviewRemarks] = useState("");

  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSeller, setDrawerSeller] = useState("");
  const [drawerBuyer, setDrawerBuyer] = useState("");
  const [drawerRows, setDrawerRows] = useState<PendingContractApiResponse[] | null>(null);

  const { data: businessProfiles } = useGetBusinessProfileSummaryQuery();
  const businessProfileOptions = useMemo(
    () =>
      (businessProfiles ?? []).map((profile) => ({
        value: String(profile.profileId),
        label: profile.legalName,
      })),
    [businessProfiles],
  );

  const { data: contractStatusOptions } = useGetAllContractStatusesQuery();
  const statusOptions = useMemo(
    () =>
      (contractStatusOptions ?? [])
        .filter((option) => option.isActive)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((option) => ({ value: option.name, label: option.displayName })),
    [contractStatusOptions],
  );

  const [searchContracts, { isFetching: searching }] = useLazyGetAllContractsByFiltersQuery();
  const [searchDrawerContracts, { isFetching: drawerLoading }] = useLazyGetAllContractsByFiltersQuery();
  const [fetchContract, { isFetching: loadingContract }] = useLazyGetContractByContractIdQuery();
  const [updateContractStatus, { isLoading: updating }] = useUpdateContractStatusMutation();

  const loadContract = async (contractId: number) => {
    const contract = await fetchContract(contractId).unwrap();
    setError("");
    setRecord(contract);
    setDetailsVisible(true);
    setStatus(contract.basicDetails?.calculatedStatus ?? "");
  };

  const handleSearch = async () => {
    const trimmed = contractNumber.trim();
    if (!trimmed) {
      setError("Please enter a contract number to search.");
      setRecord(null);
      return;
    }

    try {
      const rows = await searchContracts({ SearchText: trimmed }).unwrap();
      const match = rows.find(
        (row) => row.contractNumber?.toLowerCase() === trimmed.toLowerCase(),
      );

      if (!match) {
        setError(`No contract found for number "${trimmed}".`);
        setRecord(null);
        return;
      }

      await loadContract(match.contractId);
    } catch {
      setError("Failed to search for the contract.");
      setRecord(null);
    }
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    setDrawerSeller("");
    setDrawerBuyer("");
    setDrawerRows(null);
  };

  const handleGetContracts = async () => {
    try {
      const rows = await searchDrawerContracts({}).unwrap();
      const sellerId = drawerSeller ? Number(drawerSeller) : null;
      const buyerId = drawerBuyer ? Number(drawerBuyer) : null;
      setDrawerRows(
        rows.filter(
          (row) => (!sellerId || row.sellerId === sellerId) && (!buyerId || row.buyerId === buyerId),
        ),
      );
    } catch {
      setError("Failed to fetch contracts for the selected Seller and Buyer.");
    }
  };

  const handleAddFromDrawer = async (row: PendingContractApiResponse) => {
    setContractNumber(row.contractNumber);
    setDrawerOpen(false);

    try {
      await loadContract(row.contractId);
    } catch {
      setError(`No contract details found for number "${row.contractNumber}".`);
      setRecord(null);
    }
  };

  const handleChange = async () => {
    if (!record) {
      setError("Search and select a valid contract before changing its status.");
      return;
    }
    if (!contractCloseDate) {
      setError("Contract Close Date is required.");
      return;
    }
    if (!status) {
      setError("Please select a status.");
      return;
    }

    const currentUserId = Number(localStorage.getItem("userId")) || 0;

    try {
      await updateContractStatus({
        contractId: record.id,
        calculatedStatus: status,
        reviewRemarks: reviewRemarks.trim() || undefined,
        actionPerformedBy: currentUserId,
      }).unwrap();

      setError("");
      navigate("/contracts");
    } catch {
      setError("Failed to update contract status.");
    }
  };

  const basicDetails = record?.basicDetails;
  const contractValue =
    basicDetails?.contractRate != null && basicDetails?.quantity != null
      ? formatINR(basicDetails.contractRate * basicDetails.quantity)
      : "";

  return (
    <div className="contract-change-status">
      <div className="contract-change-status__card">
        <h1 className="contract-change-status__title">Contract Change Status</h1>

        <div className="contract-change-status__fields new-contract__grid">
          <div className="form-field">
            <span className="form-field__label">Financial Year</span>
            <SearchableSelect
              options={financialYearOptions}
              value={financialYear}
              onChange={setFinancialYear}
              ariaLabel="Financial Year"
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="contractNumber">
              Contract Number <span className="form-field__required">*</span>
            </label>
            <div className="contract-change-status__input-group">
              <input
                id="contractNumber"
                type="text"
                className="form-field__control"
                placeholder="Enter Contract Number"
                value={contractNumber}
                onChange={(event) => setContractNumber(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <button
                type="button"
                className="contract-change-status__search-btn"
                onClick={handleOpenDrawer}
                aria-label="Get contracts"
                title="Get contracts"
              >
                <FiLink aria-hidden />
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="contractCloseDate">
              Contract Close Date <span className="form-field__required">*</span>
            </label>
            <input
              id="contractCloseDate"
              type="date"
              className="form-field__control"
              value={contractCloseDate}
              onChange={(event) => setContractCloseDate(event.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="new-contract__error" role="alert">
            {error}
          </p>
        )}

        <div className="contract-change-status__details">
          <div className="contract-change-status__details-header">
            <h2>Contract Details</h2>
            <button
              type="button"
              className="new-contract__summary-toggle"
              onClick={() => setDetailsVisible((prev) => !prev)}
            >
              {detailsVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {detailsVisible ? "Hide" : "Show"}
            </button>
          </div>

          {!record ? (
            <p className="contract-change-status__placeholder">
              {searching || loadingContract
                ? "Loading contract details…"
                : "Enter a contract number and search to view contract details."}
            </p>
          ) : (
            detailsVisible && (
              <div className="new-contract__grid">
                <DetailField label="Contract Number" value={record.contractNumber} />
                <DetailField label="Contract Date" value={formatDisplayDate(record.contractDate)} />
                <DetailField label="Seller" value={record.sellerName} />
                <DetailField label="Buyer" value={record.buyerName} />

                <DetailField label="Product Name" value={record.productName} />
                <DetailField label="Delivery Type" value={basicDetails?.deliveryType} />
                <DetailField
                  label="Contract Quantity"
                  value={
                    basicDetails?.quantity != null
                      ? `${basicDetails.quantity} ${basicDetails.quantityMeasure ?? ""}`
                      : ""
                  }
                />

                <DetailField
                  label="Invoice Rate per MT"
                  value={basicDetails?.contractRate != null ? formatINR(basicDetails.contractRate) : ""}
                />
                <DetailField
                  label="GST %"
                  value={basicDetails?.gstPercentage != null ? `${basicDetails.gstPercentage}%` : ""}
                />
                <DetailField
                  label="Invoice Net Rate per MT"
                  value={basicDetails?.netRate != null ? formatINR(basicDetails.netRate) : ""}
                />
                <DetailField label="Contract Value" value={contractValue} />
              </div>
            )
          )}
        </div>

        <div className="contract-change-status__toggle-bar">
          <div className="form-field">
            <span className="form-field__label">Status</span>
            <SearchableSelect
              options={statusOptions}
              value={status}
              onChange={setStatus}
              placeholder="Select Status"
              ariaLabel="Status"
              disabled={!record}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="reviewRemarks">
              Review Remarks
            </label>
            <input
              id="reviewRemarks"
              type="text"
              className="form-field__control"
              placeholder="Optional remarks"
              value={reviewRemarks}
              onChange={(event) => setReviewRemarks(event.target.value)}
              disabled={!record}
            />
          </div>
        </div>
      </div>

      <div className="contract-change-status__actions">
        <Link to="/contracts" className="contract-change-status__cancel">
          Cancel
        </Link>
        <button
          type="button"
          className="contract-change-status__submit"
          onClick={handleChange}
          disabled={updating}
        >
          {updating ? "Changing…" : "Change"}
        </button>
      </div>

      <GetContractsDrawer
        open={drawerOpen}
        seller={drawerSeller}
        buyer={drawerBuyer}
        sellerOptions={businessProfileOptions}
        buyerOptions={businessProfileOptions}
        rows={drawerRows}
        loading={drawerLoading}
        onSellerChange={setDrawerSeller}
        onBuyerChange={setDrawerBuyer}
        onGetContracts={handleGetContracts}
        onAdd={handleAddFromDrawer}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default ContractchangeStatus;
