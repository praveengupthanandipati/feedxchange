import { useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiDownload, FiCheck, FiRefreshCw } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import DetailsTab from "./details-tab/DetailsTab";
import SummaryTab from "./summary-tab/SummaryTab";
import {
  buildBuyerSummaryRows,
  defaultBuyer,
  defaultSeller,
  filterTypeOptions,
  paymentTypeOptions,
  pendingPaymentRows,
} from "./pendingPayments.data";
import "./PendingPayments.scss";

type PendingPaymentsTabId = "summary" | "details";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const PendingPayments = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<PendingPaymentsTabId>("details");

  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [selectedFilterType, setSelectedFilterType] = useState("");
  const [appliedPaymentType, setAppliedPaymentType] = useState("");
  const [appliedFilterType, setAppliedFilterType] = useState("");

  const handleApply = () => {
    setAppliedPaymentType(selectedPaymentType);
    setAppliedFilterType(selectedFilterType);
  };

  const handleReset = () => {
    setSelectedPaymentType("");
    setSelectedFilterType("");
    setAppliedPaymentType("");
    setAppliedFilterType("");
  };

  const filteredRows = useMemo(() => {
    return pendingPaymentRows.filter((row) => {
      if (appliedPaymentType === "overdue" && row.overDueDays <= 0) return false;
      if (appliedPaymentType === "on-time" && row.overDueDays > 0) return false;
      if (appliedFilterType === "high-balance" && row.balance < 20000) return false;
      if (appliedFilterType === "low-balance" && row.balance >= 20000) return false;
      return true;
    });
  }, [appliedPaymentType, appliedFilterType]);

  const buyerSummaryRows = useMemo(() => buildBuyerSummaryRows(filteredRows), [filteredRows]);

  const handleExport = () => {
    const headers = ["Invoice #", "Invoice Dt", "Buyer", "Invoice Amount", "Paid Amount", "Balance", "Over Due"];
    const headerRow = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = [
          row.invoiceNum,
          row.invoiceDate,
          row.buyerName,
          String(row.invoiceAmount),
          String(row.paidAmount),
          String(row.balance),
          `${row.overDueDays} days`,
        ]
          .map((value) => `<td>${escapeHtml(value)}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pending-payments.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pending-payments-page">
      <div className="pending-payments-card">
        <div className="pending-payments-card__header">
          <h1>Pending Payments</h1>
          <div className="pending-payments-card__actions">
            <button
              type="button"
              className="pending-payments-btn pending-payments-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="pending-payments-btn pending-payments-btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="pending-payments-filters">
            <div className="pending-payments-filters__field">
              <SearchableSelect
                options={paymentTypeOptions}
                value={selectedPaymentType}
                onChange={setSelectedPaymentType}
                placeholder="Select Payment Type"
                ariaLabel="Select Payment Type"
                clearable
              />
            </div>

            <div className="pending-payments-filters__field">
              <SearchableSelect
                options={filterTypeOptions}
                value={selectedFilterType}
                onChange={setSelectedFilterType}
                placeholder="Filter Type"
                ariaLabel="Filter Type"
                clearable
              />
            </div>

            <button type="button" className="pending-payments-filters__apply" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="pending-payments-filters__reset" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        )}

        <div className="pending-payments-parties">
          <span>
            Seller: <strong>{defaultSeller}</strong>
          </span>
          <span>
            Buyer: <strong>{defaultBuyer}</strong>
          </span>
        </div>

        <div className="pending-payments-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "summary"}
            className={activeTab === "summary" ? "is-active" : ""}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "details"}
            className={activeTab === "details" ? "is-active" : ""}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
        </div>

        {activeTab === "summary" ? (
          <SummaryTab rows={buyerSummaryRows} />
        ) : (
          <DetailsTab rows={filteredRows} />
        )}
      </div>
    </div>
  );
};

export default PendingPayments;
