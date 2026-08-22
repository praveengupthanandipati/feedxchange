import { useEffect, useMemo, useState } from "react";
import { FiPrinter, FiDownload } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import { buildAccountSummaryColumns } from "./accountSummaryTab.columns";
import { accountSummaryRows, type AccountSummaryRow } from "./accountSummaryTab.data";
import "./AccountSummaryTab.scss";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function exportPartyRows(rows: AccountSummaryRow[]) {
  const bodyRows = rows
    .map((row) => `<tr><td>${row.sNo}</td><td>${escapeHtml(row.partyName)}</td></tr>`)
    .join("");
  const html = `<table><thead><tr><th>S.No</th><th>Party Name</th></tr></thead><tbody>${bodyRows}</tbody></table>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "account-summary.xls";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface AccountSummaryTabProps {
  onRegisterExport: (handler: (() => void) | null) => void;
}

const AccountSummaryTab = ({ onRegisterExport }: AccountSummaryTabProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // TODO: wire up to a real print/document API once available.
  const handlePrint = () => undefined;
  const handleDownload = () => undefined;

  const columns = useMemo(
    () => buildAccountSummaryColumns({ onPrint: handlePrint, onDownload: handleDownload }),
    [],
  );

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? accountSummaryRows.map((row) => row.id) : []);
  };

  const handlePrintAll = () => undefined;
  const handleDownloadAll = () => exportPartyRows(accountSummaryRows);

  useEffect(() => {
    onRegisterExport(() => exportPartyRows(accountSummaryRows));
    return () => onRegisterExport(null);
  }, [onRegisterExport]);

  return (
    <div className="account-summary-tab">
      <div className="account-summary-tab__toolbar">
        <button type="button" className="account-summary-tab__print-all" onClick={handlePrintAll}>
          <FiPrinter aria-hidden /> Print All
        </button>
        <button type="button" className="account-summary-tab__download-all" onClick={handleDownloadAll}>
          <FiDownload aria-hidden /> Download All
        </button>
      </div>

      <Table
        columns={columns}
        data={accountSummaryRows}
        rowKey={(row) => row.id}
        selectable
        selectedRowKeys={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        emptyMessage="No parties found."
        minHeight
        className="account-summary-tab-table"
      />
    </div>
  );
};

export default AccountSummaryTab;
