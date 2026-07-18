import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronUp, FiChevronDown, FiAlertCircle } from "react-icons/fi";
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
}: TableProps<T>) {
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

  return (
    <div className={`table-wrapper ${minHeight ? "table-wrapper--min-height" : ""}`}>
      <table className="table">
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
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width, textAlign: column.align }}
                className={column.sortable ? "is-sortable" : ""}
                onClick={() => handleSort(column)}
              >
                <span className="table__header-label">
                  {column.header}
                  {column.headerTooltip && <InfoTooltip text={column.headerTooltip} />}
                  {column.sortable && (
                    <span className="table__sort-icons">
                      <FiChevronUp
                        className={sortKey === column.key && sortDirection === "asc" ? "is-active" : ""}
                      />
                      <FiChevronDown
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
          {sortedData.length === 0 ? (
            <tr>
              <td
                className="table__empty"
                colSpan={columns.length + (selectable ? 1 : 0)}
              >
                <div className="table__empty-alert" role="status">
                  <FiAlertCircle aria-hidden />
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row) => {
              const key = rowKey(row);
              const isSelected = selectedSet.has(key);
              return (
                <tr key={key} className={isSelected ? "is-selected" : ""}>
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
                  {columns.map((column) => (
                    <td key={column.key} style={{ textAlign: column.align }}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
