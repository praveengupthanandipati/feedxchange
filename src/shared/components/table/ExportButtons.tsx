import { useState } from "react";
import { DownloadIcon, FileTextIcon } from "../icon";
import { exportTableCsv, exportTablePdf } from "./tableExport";
import type { TableColumn } from "./table.types";
import "./Table.scss";

interface ExportButtonsProps<T> {
  /** Report name: the PDF title and the file name. */
  name: string;
  /** The columns to export (row actions are left out). */
  columns: TableColumn<T>[];
  /** Every row to export (all filtered rows, not only the current page). */
  rows: T[];
  /** A line under the PDF title, e.g. the filters in use. */
  subtitle?: string;
}

/**
 * The CSV and PDF buttons of the shared Table's toolbar, for screens that show their rows as cards rather than a table.
 * A screen with a table uses the Table's own `exportName` instead, so the buttons sit in its toolbar.
 */
function ExportButtons<T>({ name, columns, rows, subtitle }: ExportButtonsProps<T>) {
  const [busy, setBusy] = useState(false);
  const pdf = async () => {
    setBusy(true);
    try {
      await exportTablePdf(name, columns, rows, subtitle);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="table-export-buttons">
      <button
        type="button"
        className="table-toolbar__btn"
        onClick={() => exportTableCsv(name, columns, rows)}
        disabled={rows.length === 0}
        title="Download these rows as a CSV file (opens in Excel)"
      >
        <DownloadIcon aria-hidden /> CSV
      </button>
      <button
        type="button"
        className="table-toolbar__btn"
        onClick={pdf}
        disabled={rows.length === 0 || busy}
        aria-busy={busy || undefined}
        title="Download these rows as a PDF report"
      >
        <FileTextIcon aria-hidden /> PDF
      </button>
    </span>
  );
}

export default ExportButtons;
