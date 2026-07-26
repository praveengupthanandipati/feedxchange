import { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiDownload } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import Pagination from "../promoterslist/Pagination";
import { buildPromoterDashboardColumns } from "./promoterDashboard.columns";
import { promoterContracts, type PromoterContractRow } from "./promoterDashboard.data";
import "../promoterslist/Promoters.scss";
import "./PromoterDashboard.scss";

const PAGE_SIZE = 10;

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function getExportCellValue(row: PromoterContractRow, column: TableColumn<PromoterContractRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const PromoterDashboard = () => {
  const [rows] = useState<PromoterContractRow[]>(promoterContracts);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [contractNumberInput, setContractNumberInput] = useState("");
  const [sellerInput, setSellerInput] = useState("");
  const [buyerInput, setBuyerInput] = useState("");
  const [commissionInput, setCommissionInput] = useState("");

  const [contractNumberFilter, setContractNumberFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");
  const [commissionFilter, setCommissionFilter] = useState("");

  const columns = useMemo(() => buildPromoterDashboardColumns(), []);

  useEffect(() => {
    setCurrentPage(1);
  }, [contractNumberFilter, sellerFilter, buyerFilter, commissionFilter]);

  const filteredRows = useMemo(() => {
    const contractNumberQ = contractNumberFilter.trim().toLowerCase();
    const sellerQ = sellerFilter.trim().toLowerCase();
    const buyerQ = buyerFilter.trim().toLowerCase();
    const commissionQ = commissionFilter.trim();

    return rows.filter((row) => {
      if (contractNumberQ && !row.contractNumber.toLowerCase().includes(contractNumberQ)) return false;
      if (sellerQ && !row.seller.toLowerCase().includes(sellerQ)) return false;
      if (buyerQ && !row.buyer.toLowerCase().includes(buyerQ)) return false;
      if (commissionQ && String(row.commissionPercent) !== commissionQ) return false;
      return true;
    });
  }, [rows, contractNumberFilter, sellerFilter, buyerFilter, commissionFilter]);

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const currentPageClamped = Math.min(currentPage, Math.max(totalPages, 1));
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const totalContracts = rows.length;
  const totalAmount = rows.reduce((sum, row) => sum + row.totalAmount, 0);
  const totalCommissionAmount = rows.reduce((sum, row) => sum + row.commissionAmount, 0);

  const handleApply = () => {
    setContractNumberFilter(contractNumberInput);
    setSellerFilter(sellerInput);
    setBuyerFilter(buyerInput);
    setCommissionFilter(commissionInput);
  };

  const handleReset = () => {
    setContractNumberInput("");
    setSellerInput("");
    setBuyerInput("");
    setCommissionInput("");
    setContractNumberFilter("");
    setSellerFilter("");
    setBuyerFilter("");
    setCommissionFilter("");
  };

  const handleExport = () => {
    const headerRow = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = columns
          .map((column) => `<td>${escapeHtml(getExportCellValue(row, column))}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promoter-dashboard.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="promoter-dashboard">
      <div className="promoter-dashboard__header">
        <h1>Promoter Dashboard</h1>
        <div className="promoter-dashboard__actions">
          <button
            type="button"
            className="promoter-dashboard-btn promoter-dashboard-btn--info"
            onClick={() => setFiltersVisible((prev) => !prev)}
          >
            {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            {filtersVisible ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            className="promoter-dashboard-btn promoter-dashboard-btn--warning"
            onClick={handleExport}
          >
            <FiDownload aria-hidden /> Export
          </button>
        </div>
      </div>

      <div className="promoter-dashboard__summary">
        <div className="promoter-summary promoter-summary--primary">
          <span>Total Contracts</span>
          <strong>{totalContracts}</strong>
        </div>
        <div className="promoter-summary promoter-summary--info">
          <span>Total Amount</span>
          <strong>{formatINR(totalAmount)}</strong>
        </div>
        <div className="promoter-summary promoter-summary--warning">
          <span>Commission Amount</span>
          <strong>{formatINR(totalCommissionAmount)}</strong>
        </div>
      </div>

      <div className="promoter-dashboard__card">
        {filtersVisible && (
          <div className="promoter-dashboard__filters">
            <input
              type="text"
              value={contractNumberInput}
              onChange={(event) => setContractNumberInput(event.target.value)}
              placeholder="Contract Number"
              aria-label="Filter by contract number"
            />
            <input
              type="text"
              value={sellerInput}
              onChange={(event) => setSellerInput(event.target.value)}
              placeholder="Seller"
              aria-label="Filter by seller"
            />
            <input
              type="text"
              value={buyerInput}
              onChange={(event) => setBuyerInput(event.target.value)}
              placeholder="Buyer"
              aria-label="Filter by buyer"
            />
            <input
              type="text"
              value={commissionInput}
              onChange={(event) => setCommissionInput(event.target.value)}
              placeholder="Commission %"
              aria-label="Filter by commission percent"
            />
            <button type="button" className="promoter-dashboard__apply" onClick={handleApply}>
              Apply
            </button>
            <button type="button" className="promoter-dashboard__reset" onClick={handleReset}>
              Reset
            </button>
          </div>
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No contracts match the current filters."
          minHeight
        />

        <Pagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          totalResults={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default PromoterDashboard;
