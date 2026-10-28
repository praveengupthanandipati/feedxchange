import { useEffect, useMemo, useState } from "react";
import DatePickerInput from "../../../../shared/components/dropdown/DatePickerInput";
import {
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  Maximize2Icon,
  Minimize2Icon,
  RefreshCwIcon,
} from "../../../../shared/components/icon";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import Table from "../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { buildContractStatusColumns } from "./contractWiseStatus.columns";
import { contractStatusRows, filterOptions, type ContractStatusRow } from "./contractWiseStatus.data";
import "./ContractwiseStatus.scss";

function getExportCellValue(row: ContractStatusRow, column: TableColumn<ContractStatusRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const ContractSuppliesPanel = ({ row }: { row: ContractStatusRow }) => (
  <div className="contract-wise-status-supplies">
    <div className="contract-wise-status-supplies__table-wrapper">
      <table className="contract-wise-status-supplies__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice</th>
            <th>Qty</th>
            <th>Truck</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {row.supplies.map((supply) => (
            <tr key={supply.id}>
              <td>{supply.date}</td>
              <td>{supply.invoice}</td>
              <td>{supply.qty}</td>
              <td>{supply.truck}</td>
              <td>{supply.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ContractwiseStatus = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

  const expandableRows = useMemo(() => contractStatusRows.filter((row) => row.supplies.length > 0), []);
  const firstExpandableId = expandableRows[0]?.id ?? null;
  const allExpanded = expandedRowKey !== null;

  const handleToggleExpand = (row: ContractStatusRow) => {
    setExpandedRowKey((prev) => (prev === row.id ? null : row.id));
  };

  const handleToggleExpandAll = () => {
    setExpandedRowKey((prev) => (prev ? null : firstExpandableId));
  };

  const columns = useMemo(
    () => buildContractStatusColumns({ onToggleExpand: handleToggleExpand, expandedRowKey }),
    [expandedRowKey],
  );

  useEffect(() => {
    setExpandedRowKey(null);
  }, [appliedFilter, appliedDateFrom, appliedDateTo]);

  const filteredRows = useMemo(() => {
    return contractStatusRows.filter((row) => {
      if (appliedFilter === "100% Advance" && row.contractType !== "100%") return false;
      if (appliedFilter === "Credits" && row.contractType !== "Credit") return false;
      if (appliedDateFrom && row.contractDtValue < new Date(appliedDateFrom).getTime()) return false;
      if (appliedDateTo && row.contractDtValue > new Date(appliedDateTo).getTime() + 24 * 60 * 60 * 1000 - 1)
        return false;
      return true;
    });
  }, [appliedFilter, appliedDateFrom, appliedDateTo]);

  const handleApply = () => {
    setAppliedFilter(selectedFilter);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const handleReset = () => {
    setSelectedFilter("");
    setAppliedFilter("");
    setDateFrom("");
    setDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
  };

  const handleExport = () => {
    const headerRow = columns
      .filter((column) => column.key !== "expand")
      .map((column) => `<th>${escapeHtml(column.header)}</th>`)
      .join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = columns
          .filter((column) => column.key !== "expand")
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
    link.download = "contract-wise-status.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="contract-wise-status-page">
      <div className="contract-wise-status-card">
        <div className="contract-wise-status-card__header">
          <h1>Contract Wise Status</h1>
          <div className="contract-wise-status-card__actions">
            <button
              type="button"
              className="contract-wise-status-btn contract-wise-status-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="contract-wise-status-btn contract-wise-status-btn--warning"
              onClick={handleExport}
            >
              <DownloadIcon aria-hidden /> Export
            </button>
            <button
              type="button"
              className="contract-wise-status-btn contract-wise-status-btn--primary"
              onClick={handleToggleExpandAll}
              disabled={expandableRows.length === 0}
            >
              {allExpanded ? <Minimize2Icon aria-hidden /> : <Maximize2Icon aria-hidden />}
              {allExpanded ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>

        {filtersVisible && (
          <div className="contract-wise-status-filters">
            <div className="contract-wise-status-filters__field">
              <SearchableSelect
                options={filterOptions}
                value={selectedFilter}
                onChange={setSelectedFilter}
                placeholder="Select Filter"
                ariaLabel="Select Filter"
                clearable
              />
            </div>

            <div className="contract-wise-status-filters__field">
              <div className="contract-wise-status-filters__date-range">
                <DatePickerInput
                  value={dateFrom}
                  onChange={(value) => setDateFrom(value)}
                  ariaLabel="Contract date range from"
                  clearable
                />
                <span>to</span>
                <DatePickerInput
                  value={dateTo}
                  onChange={(value) => setDateTo(value)}
                  ariaLabel="Contract date range to"
                  clearable
                />
              </div>
            </div>

            <button type="button" className="contract-wise-status-filters__apply" onClick={handleApply}>
              <CheckIcon aria-hidden /> Apply
            </button>
            <button type="button" className="contract-wise-status-filters__reset" onClick={handleReset}>
              <RefreshCwIcon aria-hidden /> Reset
            </button>
          </div>
        )}

        <Table
          columns={columns}
          data={filteredRows}
          rowKey={(row) => row.id}
          emptyMessage="No contracts match the current filters."
          expandedRowKey={expandedRowKey}
          renderExpandedRow={(row) => <ContractSuppliesPanel row={row} />}
          minHeight
          className="contract-wise-status-table"
        />
      </div>
    </div>
  );
};

export default ContractwiseStatus;
