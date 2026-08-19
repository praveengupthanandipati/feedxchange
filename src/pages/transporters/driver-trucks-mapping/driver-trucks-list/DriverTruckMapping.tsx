import { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import SuccessToast from "../../../../components/toast/SuccessToast";
import { useSuccessToast } from "../../../../components/toast/useSuccessToast";
import DriverTruckMappingFilters from "./DriverTruckMappingFilters";
import Pagination from "./Pagination";
import DriverTruckMappingOffcanvas from "./DriverTruckMappingOffcanvas";
import { buildDriverTruckMappingColumns, type DriverTruckMappingRow } from "./driverTruckMapping.columns";
import {
  useGetAllMappingsQuery,
  useAddMappingMutation,
  useReleaseMappingMutation,
  type DriverTruckMapping,
} from "../../../../store/driverTruckMappingApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../../store/trucksApi";
import { useGetAllActiveDriversQuery } from "../../../../store/driversApi";
import type { DriverTruckMappingFormValues } from "./driverTruckMapping.types";
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

function getExportCellValue(row: DriverTruckMappingRow, column: TableColumn<DriverTruckMappingRow>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const DriverTruckMappingPage = () => {
  const { data, isLoading, error } = useGetAllMappingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: trucks = [] } = useGetAllActiveTruckDetailsQuery();
  const { data: drivers = [] } = useGetAllActiveDriversQuery();
  const [addMapping] = useAddMappingMutation();
  const [releaseMapping] = useReleaseMappingMutation();

  const driverPhoneById = useMemo(
    () => new Map(drivers.map((driver) => [driver.driverId, driver.mobileNumber])),
    [drivers],
  );
  const rows: DriverTruckMappingRow[] = useMemo(
    () => (data ?? []).map((row) => ({ ...row, driverPhone: driverPhoneById.get(row.driverId) ?? "" })),
    [data, driverPhoneById],
  );

  const [truckFilter, setTruckFilter] = useState("All");
  const [driverFilter, setDriverFilter] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingReleaseRow, setPendingReleaseRow] = useState<DriverTruckMapping | null>(null);
  const [releaseReason, setReleaseReason] = useState("");
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [offcanvasMode, setOffcanvasMode] = useState<"create" | "view">("create");
  const [activeRow, setActiveRow] = useState<DriverTruckMapping | null>(null);
  const { message: successMessage, showSuccessMessage } = useSuccessToast();

  const handleOpenCreate = () => {
    setOffcanvasMode("create");
    setActiveRow(null);
    setOffcanvasOpen(true);
  };

  const handleOpenView = (row: DriverTruckMapping) => {
    setOffcanvasMode("view");
    setActiveRow(row);
    setOffcanvasOpen(true);
  };

  const handleRelease = (row: DriverTruckMapping) => {
    setReleaseReason("");
    setReleaseError(null);
    setPendingReleaseRow(row);
  };

  const confirmRelease = async () => {
    if (!pendingReleaseRow) return;

    const actionPerformedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await releaseMapping({
        mappingId: pendingReleaseRow.mappingId,
        releasedReason: releaseReason.trim(),
        actionPerformedBy,
      }).unwrap();
      setPendingReleaseRow(null);
      showSuccessMessage("Driver-truck mapping released successfully");
    } catch (err) {
      setReleaseError(err instanceof Error ? err.message : "Failed to release mapping.");
    }
  };

  const handleSave = async (values: DriverTruckMappingFormValues) => {
    try {
      await addMapping({
        truckId: values.truckId,
        driverId: values.driverId,
        assignedFrom: values.assignedFrom,
        assignmentReason: values.assignmentReason,
        isPrimary: values.isPrimary,
        actionPerformedBy: values.actionPerformedBy,
      }).unwrap();
      setOffcanvasOpen(false);
      showSuccessMessage("Driver-truck mapping added successfully");
    } catch {
      // TODO: surface a form-level error once the offcanvas supports one.
    }
  };

  const columns = useMemo(
    () =>
      buildDriverTruckMappingColumns({
        onView: handleOpenView,
        onDelete: handleRelease,
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
      <SuccessToast message={successMessage} />
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
          emptyMessage={
            isLoading
              ? "Loading driver-truck mappings…"
              : error
                ? "Failed to load driver-truck mappings."
                : "No driver-truck mappings match the current filters."
          }
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
        truckOptions={trucks}
        driverOptions={drivers}
        actionPerformedBy={Number(localStorage.getItem("userId")) || 0}
        onClose={() => setOffcanvasOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={pendingReleaseRow !== null}
        title="Release this mapping?"
        message={
          releaseError ||
          `This will release the mapping between "${pendingReleaseRow?.truckNumber}" and "${pendingReleaseRow?.driverName}".`
        }
        confirmLabel="Release"
        reasonLabel="Reason for release"
        reasonValue={releaseReason}
        onReasonChange={setReleaseReason}
        onConfirm={confirmRelease}
        onCancel={() => setPendingReleaseRow(null)}
      />
    </div>
  );
};

export default DriverTruckMappingPage;
