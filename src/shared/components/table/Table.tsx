import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, CircleAlertIcon, Columns3Icon } from "../icon";
import { Skeleton } from "../ui";
import InfoTooltip from "../tooltip/InfoTooltip";
import type { SortDirection, TableColumn } from "./table.types";
import "./Table.scss";

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selectedRowKeys?: string[];
  onSelectRow?: (key: string) => void;
  onSelectAll?: (checked: boolean) => void;
  emptyMessage?: string;
  /** When true, the table wrapper gets a min-height of 63vh instead of hugging its content. */
  minHeight?: boolean;
  /** Key of the row currently showing its expanded detail panel. */
  expandedRowKey?: string | null;
  /** Keys of several rows to expand at once (e.g. "Expand All"); combined with `expandedRowKey`. */
  expandedRowKeys?: string[];
  /** Renders a full-width panel in a row inserted directly below the row matching `expandedRowKey`. */
  renderExpandedRow?: (row: T) => ReactNode;
  /** "light" swaps the default solid navy header for a softer, bordered look — for pages that want a quieter table. */
  variant?: "default" | "light";
  /** Extra class on the outer wrapper, for page-scoped style overrides without touching every table. */
  className?: string;
  /** Makes each data row clickable (e.g. to toggle its expanded panel) — the whole <tr>, not just a cell control. */
  onRowClick?: (row: T) => void;
  /** Shows placeholder rows instead of the empty message while the data loads. */
  loading?: boolean;
  /** Keeps the first column in view while the table scrolls sideways (the selection column too, when there is one). */
  stickyFirstColumn?: boolean;
  /** Splits the rows into pages of this size, with a pager under the table. Leave out to show every row. */
  pageSize?: number;
  /** Adds a Columns menu above the table to show or hide columns (see TableColumn.hidden / hideable). */
  columnToggle?: boolean;
  /** Below 768px each row becomes a card of "label: value" lines instead of a table that scrolls sideways. */
  mobileCards?: boolean;
}

/** Columns menu: a checkbox per column the user may hide. */
function ColumnMenu<T>({ columns, hidden, onToggle }: { columns: TableColumn<T>[]; hidden: ReadonlySet<string>; onToggle: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="table-columns" ref={ref}>
      <button type="button" className="table-columns__toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Columns3Icon aria-hidden /> Columns
      </button>
      {open && (
        <fieldset className="table-columns__menu">
          <legend className="visually-hidden">Show columns</legend>
          {columns
            .filter((column) => column.hideable !== false)
            .map((column) => (
              <label key={column.key} className="table-columns__item">
                <input type="checkbox" checked={!hidden.has(column.key)} onChange={() => onToggle(column.key)} />
                {column.header}
              </label>
            ))}
        </fieldset>
      )}
    </div>
  );
}

function defaultSortValue<T>(row: T, key: string): string | number {
  const value = (row as Record<string, unknown>)[key];
  if (typeof value === "number" || typeof value === "string") return value;
  return "";
}

function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      aria-label="Select all rows"
    />
  );
}

function Table<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedRowKeys = [],
  onSelectRow,
  onSelectAll,
  emptyMessage = "Currently no records found.",
  minHeight = false,
  expandedRowKey = null,
  expandedRowKeys,
  renderExpandedRow,
  variant = "default",
  className = "",
  onRowClick,
  loading = false,
  stickyFirstColumn = false,
  pageSize,
  columnToggle = false,
  mobileCards = false,
}: TableProps<T>) {
  const [hiddenKeys, setHiddenKeys] = useState<ReadonlySet<string>>(
    () => new Set(columnToggle ? columns.filter((column) => column.hidden).map((column) => column.key) : []),
  );
  const toggleColumn = (key: string) =>
    setHiddenKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const shownColumns = useMemo(() => columns.filter((column) => !hiddenKeys.has(column.key)), [columns, hiddenKeys]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;
    const column = columns.find((item) => item.key === sortKey);
    if (!column) return data;
    const getValue = column.sortValue ?? ((row: T) => defaultSortValue(row, column.key));

    const sorted = [...data].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);
      if (typeof valueA === "number" && typeof valueB === "number") {
        return valueA - valueB;
      }
      return String(valueA).localeCompare(String(valueB));
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [data, sortKey, sortDirection, columns]);

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  const selectedSet = useMemo(() => new Set(selectedRowKeys), [selectedRowKeys]);
  const visibleKeys = useMemo(() => sortedData.map(rowKey), [sortedData, rowKey]);
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedSet.has(key));
  const someSelected = visibleKeys.some((key) => selectedSet.has(key));

  // paging (only with pageSize): back to the first page when the rows change underneath
  const pageCount = pageSize ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);
  const pageRows = pageSize ? sortedData.slice((page - 1) * pageSize, page * pageSize) : sortedData;
  const pager = Boolean(pageSize) && sortedData.length > (pageSize ?? 0) && (
    <nav className="table-pager" aria-label="Pages">
      <span className="table-pager__range">
        {(page - 1) * (pageSize ?? 0) + 1}–{Math.min(page * (pageSize ?? 0), sortedData.length)} of {sortedData.length}
      </span>
      <button type="button" className="table-pager__btn" onClick={() => setPage((value) => value - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeftIcon aria-hidden />
      </button>
      <span className="table-pager__page" aria-current="page">
        Page {page} of {pageCount}
      </span>
      <button type="button" className="table-pager__btn" onClick={() => setPage((value) => value + 1)} disabled={page >= pageCount} aria-label="Next page">
        <ChevronRightIcon aria-hidden />
      </button>
    </nav>
  );

  const table = (
    <div
      className={`table-wrapper ${minHeight ? "table-wrapper--min-height" : ""} ${
        variant === "light" ? "table-wrapper--light" : ""
      } ${stickyFirstColumn ? "table-wrapper--sticky-first" : ""} ${mobileCards ? "table-wrapper--cards" : ""} ${className}`}
    >
      <table className={`table ${variant === "light" ? "table--light" : ""}`}>
        <thead>
          <tr>
            {selectable && (
              <th className="table__select-col">
                <SelectAllCheckbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={(checked) => onSelectAll?.(checked)}
                />
              </th>
            )}
            {shownColumns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width, textAlign: column.align }}
                className={`${column.sortable ? "is-sortable" : ""} ${column.priority === "low" ? "is-low-priority" : ""}`}
                onClick={() => handleSort(column)}
                aria-sort={
                  column.sortable
                    ? sortKey === column.key && sortDirection
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
              >
                <span className="table__header-label">
                  {/* a real button, so sorting works from the keyboard; its click bubbles to the header's onClick */}
                  {column.sortable ? (
                    <button type="button" className="table__sort-btn">
                      {column.header}
                    </button>
                  ) : (
                    column.header
                  )}
                  {column.headerTooltip && <InfoTooltip text={column.headerTooltip} />}
                  {column.sortable && (
                    <span className="table__sort-icons">
                      <ChevronUpIcon
                        className={sortKey === column.key && sortDirection === "asc" ? "is-active" : ""}
                      />
                      <ChevronDownIcon
                        className={sortKey === column.key && sortDirection === "desc" ? "is-active" : ""}
                      />
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && sortedData.length === 0 ? (
            Array.from({ length: 5 }, (_, index) => (
              <tr key={`loading-${index}`} className="table__loading-row">
                <td colSpan={shownColumns.length + (selectable ? 1 : 0)}>
                  {index === 0 ? <Skeleton /> : <span className="ui-skeleton" aria-hidden><span className="ui-skeleton__line" /></span>}
                </td>
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                className="table__empty"
                colSpan={shownColumns.length + (selectable ? 1 : 0)}
              >
                <div className="table__empty-alert" role="status">
                  <CircleAlertIcon aria-hidden />
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            pageRows.map((row) => {
              const key = rowKey(row);
              const isSelected = selectedSet.has(key);
              const isExpanded =
                Boolean(renderExpandedRow) && (expandedRowKey === key || Boolean(expandedRowKeys?.includes(key)));
              return (
                <Fragment key={key}>
                  <tr
                    className={`${isSelected ? "is-selected" : ""} ${onRowClick ? "is-clickable" : ""}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="table__select-col">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow?.(key)}
                          aria-label={`Select row ${key}`}
                        />
                      </td>
                    )}
                    {shownColumns.map((column) => (
                      <td
                        key={column.key}
                        style={{ textAlign: column.align }}
                        className={column.priority === "low" ? "is-low-priority" : undefined}
                        data-label={column.header}
                      >
                        {column.render
                          ? column.render(row)
                          : String((row as Record<string, unknown>)[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && (
                    <tr className="table__expanded-row">
                      <td colSpan={shownColumns.length + (selectable ? 1 : 0)}>
                        {renderExpandedRow!(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
      </div>
  );

  if (!columnToggle && !pager) return table;
  return (
    <div className="table-frame">
      {columnToggle && (
        <div className="table-toolbar">
          <ColumnMenu columns={columns} hidden={hiddenKeys} onToggle={toggleColumn} />
        </div>
      )}
      {table}
      {pager}
    </div>
  );
}

export default Table;
