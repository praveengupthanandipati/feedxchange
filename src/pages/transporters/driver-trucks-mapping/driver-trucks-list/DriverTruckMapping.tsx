import { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import DriverTruckMappingFilters from "./DriverTruckMappingFilters";
import Pagination from "./Pagination";
import DriverTruckMappingOffcanvas from "./DriverTruckMappingOffcanvas";
import { buildDriverTruckMappingColumns } from "./driverTruckMapping.columns";
import { DRIVER_OPTIONS, MOCK_DRIVER_TRUCK_MAPPINGS, TRUCK_OPTIONS } from "./driverTruckMapping.mock";
import type { DriverTruckMapping, DriverTruckMappingFormValues } from "./driverTruckMapping.types";
import "./DriverTruckMapping.scss";

const PAGE_SIZE = 10;

interface FilterOption {
  value: string;
  label: string;
}

function buildStringOptions(values: string[], allLabel: string): FilterOption[] {
  const unique = Array.from(new Set(values.filter(Boolean))).sort();
  return [{ value: "All", label: allLabel }, ...unique.map((value) => ({ value, label: value }))];
}

function getExportCellValue(row: DriverTruckMapping, column: TableColumn<DriverTruckMapping>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const DriverTruckMappingPage = () => {
  // TODO: replace with a real driverTruckMappingApi (RTK Query) once the
  // backend exposes GetAllDriverTruckMappings / trucks / drivers endpoints.
  const [rows, setRows] = useState<DriverTruckMapping[]>(MOCK_DRIVER_TRUCK_MAPPINGS);
  const [truckFilter, setTruckFilter] = useState("All");
  const [driverFilter, setDriverFilter] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<DriverTruckMapping | null>(null);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [offcanvasMode, setOffcanvasMode] = useState<"create" | "edit">("create");
  const [activeRow, setActiveRow] = useState<DriverTruckMapping | null>(null);

  const handleOpenCreate = () => {
    setOffcanvasMode("create");
    setActiveRow(null);
    setOffcanvasOpen(true);
  };

  const handleOpenEdit = (row: DriverTruckMapping) => {
    setOffcanvasMode("edit");
    setActiveRow(row);
    setOffcanvasOpen(true);
  };

  const handleDelete = (row: DriverTruckMapping) => {
    setPendingDeleteRow(row);
  };

  const confirmDelete = () => {
    if (!pendingDeleteRow) return;
    // TODO: call the real delete mutation once the backend exposes one.
    setRows((prev) => prev.filter((row) => row.mappingId !== pendingDeleteRow.mappingId));
    setPendingDeleteRow(null);
  };

  const handleSave = (values: DriverTruckMappingFormValues) => {
    const truck = TRUCK_OPTIONS.find((item) => item.truckId === values.truckId);
    const driver = DRIVER_OPTIONS.find((item) => item.driverId === values.driverId);
    if (!truck || !driver) return;

    if (values.mappingId) {
      setRows((prev) =>
        prev.map((row) =>
          row.mappingId === values.mappingId
            ? {
                ...row,
                truckId: truck.truckId,
                truckNumber: truck.truckNumber,
                driverId: driver.driverId,
                driverName: driver.driverName,
                driverPhone: driver.mobileNumber,
                assignedFrom: values.assignedFrom,
                assignmentReason: values.assignmentReason,
                isPrimary: values.isPrimary,
                actionPerformedBy: values.actionPerformedBy,
              }
            : row,
        ),
      );
    } else {
      const nextId = Math.max(0, ...rows.map((row) => row.mappingId)) + 1;
      setRows((prev) => [
        {
          mappingId: nextId,
          truckId: truck.truckId,
          truckNumber: truck.truckNumber,
          driverId: driver.driverId,
          driverName: driver.driverName,
          driverPhone: driver.mobileNumber,
          assignedFrom: values.assignedFrom,
          assignmentReason: values.assignmentReason,
          isPrimary: values.isPrimary,
          actionPerformedBy: values.actionPerformedBy,
        },
        ...prev,
      ]);
    }

    setOffcanvasOpen(false);
  };

  const columns = useMemo(
    () =>
      buildDriverTruckMappingColumns({
        onView: handleOpenEdit,
        onEdit: handleOpenEdit,
        onDelete: handleDelete,
      }),
    [],
  );

  const truckFilterOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.truckNumber), "Search by Truck"),
    [rows],
  );
  const driverFilterOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.driverName), "Search by Driver"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [truckFilter, driverFilter]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (truckFilter !== "All" && row.truckNumber !== truckFilter) return false;
      if (driverFilter !== "All" && row.driverName !== driverFilter) return false;
      return true;
    });
  }, [rows, truckFilter, driverFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleExport = () => {
    const exportColumns = columns.filter((column) => column.key !== "actions");
    const headerRow = exportColumns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = exportColumns
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
    link.download = "driver-truck-mapping.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="driver-truck-mapping-page">
      <div className="driver-truck-mapping-card">
        <div className="driver-truck-mapping-card__header">
          <h1>Driver-Truck Mapping</h1>
          <div className="driver-truck-mapping-card__actions">
            <button
              type="button"
              className="driver-truck-mapping-btn driver-truck-mapping-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="driver-truck-mapping-btn driver-truck-mapping-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="driver-truck-mapping-btn driver-truck-mapping-btn--primary"
              onClick={handleOpenCreate}
            >
              <FiPlus aria-hidden /> Create Map
            </button>
          </div>
        </div>

        {filtersVisible && (
          <DriverTruckMappingFilters
            truckNumber={truckFilter}
            onTruckNumberChange={setTruckFilter}
            truckOptions={truckFilterOptions}
            driverName={driverFilter}
            onDriverNameChange={setDriverFilter}
            driverOptions={driverFilterOptions}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.mappingId)}
          emptyMessage="No driver-truck mappings match the current filters."
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

      <DriverTruckMappingOffcanvas
        open={offcanvasOpen}
        mode={offcanvasMode}
        initialValues={activeRow}
        truckOptions={TRUCK_OPTIONS}
        driverOptions={DRIVER_OPTIONS}
        onClose={() => setOffcanvasOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this mapping?"
        message={`This will permanently delete the mapping between "${pendingDeleteRow?.truckNumber}" and "${pendingDeleteRow?.driverName}". This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default DriverTruckMappingPage;
