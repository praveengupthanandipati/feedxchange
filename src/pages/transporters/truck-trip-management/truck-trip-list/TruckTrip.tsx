import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import TruckTripFilters from "./TruckTripFilters";
import Pagination from "./Pagination";
import { buildTruckTripColumns } from "./truckTrip.columns";
import { MOCK_TRUCK_TRIPS } from "./truckTrip.mock";
import type { TruckTrip } from "./truckTrip.types";
import "./TruckTrip.scss";

const PAGE_SIZE = 10;

interface FilterOption {
  value: string;
  label: string;
}

function buildStringOptions(values: string[], allLabel: string): FilterOption[] {
  const unique = Array.from(new Set(values.filter(Boolean))).sort();
  return [{ value: "All", label: allLabel }, ...unique.map((value) => ({ value, label: value }))];
}

function getExportCellValue(row: TruckTrip, column: TableColumn<TruckTrip>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TruckTripPage = () => {
  const navigate = useNavigate();
  // TODO: replace with a real truckTripApi (RTK Query) once the backend
  // exposes GetAllTruckTrips / trucks / drivers / business profiles endpoints.
  const [rows, setRows] = useState<TruckTrip[]>(MOCK_TRUCK_TRIPS);
  const [truckFilter, setTruckFilter] = useState("All");
  const [driverFilter, setDriverFilter] = useState("All");
  const [sellerFilter, setSellerFilter] = useState("All");
  const [buyerFilter, setBuyerFilter] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<TruckTrip | null>(null);

  const handleView = (row: TruckTrip) => {
    navigate(`/truck-management/transporters/truck-trips/${row.tripId}`);
  };

  const handleEdit = (row: TruckTrip) => {
    // TODO: point at the real edit route once the Truck Trip edit page is built.
    navigate(`/truck-management/transporters/truck-trips/edit/${row.tripId}`);
  };

  const handleDelete = (row: TruckTrip) => {
    setPendingDeleteRow(row);
  };

  const confirmDelete = () => {
    if (!pendingDeleteRow) return;
    // TODO: call the real delete mutation once the backend exposes one.
    setRows((prev) => prev.filter((row) => row.tripId !== pendingDeleteRow.tripId));
    setPendingDeleteRow(null);
  };

  const columns = useMemo(
    () => buildTruckTripColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
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
  const sellerFilterOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.sellerName), "Search by Seller"),
    [rows],
  );
  const buyerFilterOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.buyerName), "Search by Buyer"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [truckFilter, driverFilter, sellerFilter, buyerFilter]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (truckFilter !== "All" && row.truckNumber !== truckFilter) return false;
      if (driverFilter !== "All" && row.driverName !== driverFilter) return false;
      if (sellerFilter !== "All" && row.sellerName !== sellerFilter) return false;
      if (buyerFilter !== "All" && row.buyerName !== buyerFilter) return false;
      return true;
    });
  }, [rows, truckFilter, driverFilter, sellerFilter, buyerFilter]);

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
    link.download = "truck-trips.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="truck-trip-page">
      <div className="truck-trip-card">
        <div className="truck-trip-card__header">
          <h1>Truck Trips</h1>
          <div className="truck-trip-card__actions">
            <button
              type="button"
              className="truck-trip-btn truck-trip-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="truck-trip-btn truck-trip-btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="truck-trip-btn truck-trip-btn--primary"
              onClick={() => navigate("/truck-management/transporters/truck-trips/new")}
            >
              <FiPlus aria-hidden /> New Trip
            </button>
          </div>
        </div>

        {filtersVisible && (
          <TruckTripFilters
            truckNumber={truckFilter}
            onTruckNumberChange={setTruckFilter}
            truckOptions={truckFilterOptions}
            driverName={driverFilter}
            onDriverNameChange={setDriverFilter}
            driverOptions={driverFilterOptions}
            sellerName={sellerFilter}
            onSellerNameChange={setSellerFilter}
            sellerOptions={sellerFilterOptions}
            buyerName={buyerFilter}
            onBuyerNameChange={setBuyerFilter}
            buyerOptions={buyerFilterOptions}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.tripId)}
          emptyMessage="No truck trips match the current filters."
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

      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this trip?"
        message={`This will permanently delete the trip for "${pendingDeleteRow?.truckNumber}" from "${pendingDeleteRow?.fromAddress}" to "${pendingDeleteRow?.toAddress}". This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default TruckTripPage;
