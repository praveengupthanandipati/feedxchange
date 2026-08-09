import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FiLink, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import ToggleSwitch from "../../../components/toggle/ToggleSwitch";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import {
  financialYearOptions,
  contractStatusRecords,
  drawerSellerOptions,
  drawerBuyerOptions,
  getContractsRows,
  type ContractStatusRecord,
  type GetContractsRow,
} from "./contractStatus.data";
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

interface GetContractsDrawerProps {
  open: boolean;
  seller: string;
  buyer: string;
  rows: GetContractsRow[] | null;
  onSellerChange: (value: string) => void;
  onBuyerChange: (value: string) => void;
  onGetContracts: () => void;
  onAdd: (row: GetContractsRow) => void;
  onClose: () => void;
}

const GetContractsDrawer = ({
  open,
  seller,
  buyer,
  rows,
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

  const columns: TableColumn<GetContractsRow>[] = useMemo(
    () => [
      { key: "sNo", header: "S.No", sortable: true, width: "4rem" },
      { key: "cDate", header: "C.Date", sortable: true },
      { key: "contractNumber", header: "Contract #", sortable: true },
      { key: "buyer", header: "Buyer", sortable: true },
      { key: "seller", header: "Seller", sortable: true },
      { key: "product", header: "Product", sortable: true },
      { key: "totalMTs", header: "Total MTs", sortable: true, align: "right" },
      {
        key: "rateMT",
        header: "Rate MT",
        sortable: true,
        align: "right",
        render: (row) => formatINR(row.rateMT),
        exportValue: (row) => formatINR(row.rateMT),
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
                options={drawerSellerOptions}
                value={seller}
                onChange={onSellerChange}
                placeholder="Select Seller"
                ariaLabel="Select Seller"
              />
            </div>
            <div className="form-field">
              <span className="form-field__label">Select Buyer</span>
              <SearchableSelect
                options={drawerBuyerOptions}
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
          >
            Get Contracts
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
  const [record, setRecord] = useState<ContractStatusRecord | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(true);

  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [contractClosed, setContractClosed] = useState(false);

  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSeller, setDrawerSeller] = useState("");
  const [drawerBuyer, setDrawerBuyer] = useState("");
  const [drawerRows, setDrawerRows] = useState<GetContractsRow[] | null>(null);

  const activateRecord = (found: ContractStatusRecord) => {
    setFinancialYear(found.financialYear);
    setError("");
    setRecord(found);
    setDetailsVisible(true);
    setDeliveryCompleted(found.deliveryCompleted);
    setPaymentDone(found.paymentDone);
    setContractClosed(found.contractClosed);
  };

  const handleSearch = () => {
    const trimmed = contractNumber.trim();
    if (!trimmed) {
      setError("Please enter a contract number to search.");
      setRecord(null);
      return;
    }

    const found = contractStatusRecords.find((row) => row.contractNumber === trimmed);

    if (!found) {
      setError(`No contract found for number "${trimmed}".`);
      setRecord(null);
      return;
    }

    activateRecord(found);
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    setDrawerSeller("");
    setDrawerBuyer("");
    setDrawerRows(null);
  };

  const handleGetContracts = () => {
    const sellerLabel = drawerSellerOptions.find((option) => option.value === drawerSeller)?.label;
    const buyerLabel = drawerBuyerOptions.find((option) => option.value === drawerBuyer)?.label;
    setDrawerRows(
      getContractsRows.filter(
        (row) => (!sellerLabel || row.seller === sellerLabel) && (!buyerLabel || row.buyer === buyerLabel),
      ),
    );
  };

  const handleAddFromDrawer = (row: GetContractsRow) => {
    setContractNumber(row.contractNumber);
    setDrawerOpen(false);

    const found = contractStatusRecords.find((r) => r.contractNumber === row.contractNumber);
    if (found) {
      activateRecord(found);
    } else {
      setError(`No contract details found for number "${row.contractNumber}".`);
      setRecord(null);
    }
  };

  const handleChange = () => {
    if (!record) {
      setError("Search and select a valid contract before changing its status.");
      return;
    }
    if (!contractCloseDate) {
      setError("Contract Close Date is required.");
      return;
    }
    if (contractClosed && (!deliveryCompleted || !paymentDone)) {
      setError("Delivery Completed and Payment Done must be enabled before closing the contract.");
      return;
    }

    setError("");
    navigate("/contracts");
  };

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
              Enter a contract number and search to view contract details.
            </p>
          ) : (
            detailsVisible && (
              <div className="new-contract__grid">
                <DetailField label="Contract Number" value={record.contractNumber} />
                <DetailField label="Contract Date" value={record.contractDate} />
                <DetailField label="Seller" value={record.seller} />
                <DetailField label="Buyer" value={record.buyer} />

                <DetailField label="Product Name" value={record.productName} />
                <DetailField label="Delivery Type" value={record.deliveryType} />
                <DetailField label="Contract Quantity" value={record.contractQuantity} />
                <DetailField label="Supplied Quantity" value={record.suppliedQuantity} />

                <DetailField label="Invoice Rate per MT" value={record.invoiceRatePerMT} />
                <DetailField label="GST %" value={record.gstPercent} />
                <DetailField label="Invoice Net Rate per MT" value={record.invoiceNetRatePerMT} />
                <DetailField label="Contract Value" value={record.contractValue} />

                <DetailField label="Total Invoices Amount" value={record.totalInvoicesAmount} />
                <DetailField
                  label="Total Invoices Net Amount (+D)"
                  value={record.totalInvoicesNetAmount}
                />
                <DetailField label="Paid Amount" value={record.paidAmount} />
              </div>
            )
          )}
        </div>

        <div className="contract-change-status__toggle-bar">
          <ToggleSwitch
            checked={deliveryCompleted}
            onChange={setDeliveryCompleted}
            onLabel="Delivery Completed"
            offLabel="Delivery Completed"
            ariaLabel="Delivery Completed"
            disabled={!record}
          />
          <ToggleSwitch
            checked={paymentDone}
            onChange={setPaymentDone}
            onLabel="Payment Done"
            offLabel="Payment Done"
            ariaLabel="Payment Done"
            disabled={!record}
          />
          <ToggleSwitch
            checked={contractClosed}
            onChange={setContractClosed}
            onLabel="Contract Closed"
            offLabel="Contract Closed"
            ariaLabel="Contract Closed"
            disabled={!record}
          />
        </div>
      </div>

      <div className="contract-change-status__actions">
        <Link to="/contracts" className="contract-change-status__cancel">
          Cancel
        </Link>
        <button type="button" className="contract-change-status__submit" onClick={handleChange}>
          Change
        </button>
      </div>

      <GetContractsDrawer
        open={drawerOpen}
        seller={drawerSeller}
        buyer={drawerBuyer}
        rows={drawerRows}
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