import { FiPrinter, FiDownload } from "react-icons/fi";
import type { TableColumn } from "../../../../components/table/table.types";
import { type AccountSummaryRow } from "./accountSummaryTab.data";

interface AccountSummaryColumnHandlers {
  onPrint: (row: AccountSummaryRow) => void;
  onDownload: (row: AccountSummaryRow) => void;
}

export function buildAccountSummaryColumns({
  onPrint,
  onDownload,
}: AccountSummaryColumnHandlers): TableColumn<AccountSummaryRow>[] {
  return [
    {
      key: "sNo",
      header: "S.No",
      width: "4rem",
    },
    {
      key: "partyName",
      header: "Party Name",
      sortable: true,
      render: (row) => <span className="account-summary-tab-table__party">{row.partyName}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <span className="account-summary-tab-table__actions">
          <button type="button" className="account-summary-tab-table__print" onClick={() => onPrint(row)}>
            <FiPrinter aria-hidden /> Print
          </button>
          <button type="button" className="account-summary-tab-table__download" onClick={() => onDownload(row)}>
            <FiDownload aria-hidden /> Download
          </button>
        </span>
      ),
    },
  ];
}
