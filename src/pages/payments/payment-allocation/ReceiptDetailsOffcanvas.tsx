import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import {
  money,
  receipts,
  type ReceiptContractSplit,
  type ReceiptInvoiceSplit,
} from "./paymentAllocation.data";
import "./ReceiptDetailsOffcanvas.scss";

type TabKey = "invoice" | "contract";

const tabs: { key: TabKey; label: string }[] = [
  { key: "invoice", label: "Invoice Payment Split Details" },
  { key: "contract", label: "Contract Payment Split Details" },
];

const dateSort = (date: string) => date.split("-").reverse().join("");

const invoiceColumns: TableColumn<ReceiptInvoiceSplit & { sNo: number }>[] = [
  { key: "sNo", header: "S.No", sortable: true },
  { key: "date", header: "Date of Pay", sortable: true, sortValue: (row) => dateSort(row.date) },
  { key: "contractNumber", header: "Contract #", sortable: true },
  { key: "invoiceNumber", header: "Invoice #", sortable: true },
  { key: "amount", header: "Amount", sortable: true, render: (row) => money(row.amount) },
];

const contractColumns: TableColumn<ReceiptContractSplit & { sNo: number }>[] = [
  { key: "sNo", header: "S.No", sortable: true },
  { key: "date", header: "Date of Pay", sortable: true, sortValue: (row) => dateSort(row.date) },
  { key: "contractNumber", header: "Contract #", sortable: true },
  { key: "amount", header: "Amount", sortable: true, render: (row) => money(row.amount) },
];

interface ReceiptDetailsOffcanvasProps {
  open: boolean;
  receiptId: string;
  onClose: () => void;
}

const ReceiptDetailsOffcanvas = ({ open, receiptId, onClose }: ReceiptDetailsOffcanvasProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("invoice");

  useEffect(() => {
    if (open) setActiveTab("invoice");
  }, [open, receiptId]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const receipt = receipts.find((item) => item.id === receiptId) ?? null;

  const invoiceRows = useMemo(
    () => (receipt?.invoiceSplits ?? []).map((split, index) => ({ ...split, sNo: index + 1 })),
    [receipt],
  );
  const contractRows = useMemo(
    () => (receipt?.contractSplits ?? []).map((split, index) => ({ ...split, sNo: index + 1 })),
    [receipt],
  );

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next: TabKey = activeTab === "invoice" ? "contract" : "invoice";
    setActiveTab(next);
    document.getElementById(`receipt-tab-${next}`)?.focus();
  };

  return createPortal(
    <>
      <div className={`receipt-details-offcanvas__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`receipt-details-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-details-title"
      >
        <div className="receipt-details-offcanvas__header">
          <div className="receipt-details-offcanvas__heading">
            <h2 id="receipt-details-title">Receipt Details</h2>
            {receipt && <span>{receipt.label}</span>}
          </div>
          <button type="button" className="receipt-details-offcanvas__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="receipt-details-offcanvas__body">
          <div className="receipt-details-offcanvas__tabs" role="tablist" aria-label="Receipt split details">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                id={`receipt-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`receipt-panel-${tab.key}`}
                tabIndex={activeTab === tab.key ? 0 : -1}
                className={activeTab === tab.key ? "is-active" : ""}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={handleTabKeyDown}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            id={`receipt-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`receipt-tab-${activeTab}`}
            className="receipt-details-offcanvas__panel"
          >
            {activeTab === "invoice" ? (
              <Table
                columns={invoiceColumns}
                data={invoiceRows}
                rowKey={(row) => row.id}
                emptyMessage="This receipt has not been split across any invoices yet."
                className="receipt-details-offcanvas__table"
              />
            ) : (
              <Table
                columns={contractColumns}
                data={contractRows}
                rowKey={(row) => row.id}
                emptyMessage="This receipt has not been split across any contracts yet."
                className="receipt-details-offcanvas__table"
              />
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ReceiptDetailsOffcanvas;
