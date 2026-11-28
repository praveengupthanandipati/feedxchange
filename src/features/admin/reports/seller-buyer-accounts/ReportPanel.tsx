import type { ReactNode } from "react";
import { CircleAlertIcon, CircleCheckBigIcon, ClockIcon, FileTextIcon, InfoIcon, PhoneIcon, TriangleAlertIcon, TruckIcon, WalletIcon, type IconComponent } from "../../../../shared/components/icon";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import type { AccountContext, ReportDef } from "./sellerBuyerAccounts.data";

/** An icon that suits the figure: time, goods, money, documents, people; otherwise the mood of the pill. */
const iconFor = (tile: SummaryTile): IconComponent => {
  const label = tile.label.toLowerCase();
  if (/days|longest|on time|against/.test(label)) return ClockIcon;
  if (/quantity|dispatch|deliver|truck/.test(label)) return TruckIcon;
  if (/amount|paid|due|unpaid|invoiced|received|refund|allocated|balance to pay|total/.test(label)) return WalletIcon;
  if (/contact/.test(label)) return PhoneIcon;
  if (/contract|invoice|advice|waiting|open|pending/.test(label)) return FileTextIcon;
  return tile.tone === "bad" ? CircleAlertIcon : tile.tone === "warn" ? TriangleAlertIcon : tile.tone === "good" ? CircleCheckBigIcon : InfoIcon;
};

export interface SummaryTile {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "good" | "warn" | "bad";
}

interface ReportPanelProps<T> {
  report: ReportDef;
  ctx: AccountContext;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  summary?: SummaryTile[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  /** Anything under the summary and above the table (a legend, a note). */
  children?: ReactNode;
  /** Leave the report's own table out (the children show the data instead). */
  hideTable?: boolean;
  /** Extra buttons in the toolbar row, after the key figures (for example Expand all / Collapse all). */
  actions?: ReactNode;
  /** Rows that show a panel below them (see renderExpandedRow). */
  expandedRowKeys?: string[];
  renderExpandedRow?: (row: T) => ReactNode;
}

/**
 * One report: line 1 its title; line 2 the key figures in one row; line 3 the buttons on the left (Expand all ...) with the row count and downloads on the right; then the table.
 * The PDF carries the report name, the two parties and the dates in use.
 */
function ReportPanel<T>({ report, ctx, columns, rows, rowKey, summary, loading, error, emptyMessage, children, actions, hideTable, expandedRowKeys, renderExpandedRow }: ReportPanelProps<T>) {
  const pills =
    summary && summary.length > 0 ? (
      <div className="sba-pills">
        {summary.map((tile) => {
          const PillIcon = iconFor(tile);
          return (
            <span key={tile.label} className={`sba-pill sba-pill--${tile.tone ?? "default"}`}>
              <PillIcon className="sba-pill__icon" aria-hidden />
              <span className="sba-pill__label">{tile.label}</span>
              <strong className="sba-pill__value">{tile.value}</strong>
              {tile.note && <small className="sba-pill__note">{tile.note}</small>}
            </span>
          );
        })}
      </div>
    ) : undefined;
  // a party already chosen in the filters is not repeated in every row
  const shownColumns = columns.filter(
    (c) => !(ctx.sellerId !== undefined && (c.key === "seller" || c.key === "sellerName")) && !(ctx.buyerId !== undefined && (c.key === "buyer" || c.key === "buyerName")),
  );
  const subtitle = `${ctx.aLabel} (${ctx.aRole}) | ${ctx.bLabel || "All " + (ctx.aRole === "Seller" ? "buyers" : "sellers")} | ${ctx.range.label}`;
  return (
    <section className="sba-report" aria-label={report.label}>
      {/* line 1: the title */}
      <header className="sba-report__head">
        <h2 title={report.hint}>{report.label}</h2>
      </header>

      {/* line 2: all the key figures in one row */}
      {pills}

      {children}

      {hideTable && !error ? null : error ? (
        <p className="sba-error" role="alert">
          {error}
        </p>
      ) : (
        <Table
          toolbar={actions}
          expandedRowKeys={expandedRowKeys}
          renderExpandedRow={renderExpandedRow}
          exportName={report.label}
          exportSubtitle={subtitle}
          columnToggle
          columns={shownColumns}
          data={rows}
          rowKey={rowKey}
          pageSize={10}
          variant="light"
          loading={loading}
          emptyMessage={loading ? "Loading…" : (emptyMessage ?? "Nothing to show for these filters.")}
        />
      )}
    </section>
  );
}

export default ReportPanel;
