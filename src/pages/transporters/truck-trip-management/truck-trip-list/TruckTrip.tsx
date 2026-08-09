import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import TruckTripFilters from "./TruckTripFilters";
import Pagination from "./Pagination";
import { buildTruckTripColumns } from "./truckTrip.columns";
import { useGetAllTripsQuery, type TruckTrip } from "../../../../store/truckTripApi";
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
  const { data, isLoading, error } = useGetAllTripsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [rows, setRows] = useState<TruckTrip[]>([]);
  const [truckFilter, setTruckFilter] = useState("All");
  const [driverFilter, setDriverFilter] = useState("All");
  const [businessProfileFilter, setBusinessProfileFilter] = useState("All");
  const [tripStatusFilter, setTripStatusFilter] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const handleView = (row: TruckTrip) => {
    navigate(`/truck-management/transporters/truck-trips/${row.tripId}`);
  };

  const handleEdit = (row: TruckTrip) => {
    navigate(`/truck-management/transporters/truck-trips/new?id=${row.tripId}`);
  };

  const columns = useMemo(
    () => buildTruckTripColumns({ onView: handleView, onEdit: handleEdit }),
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
  const businessProfileFilterOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.businessProfileName), "Search by Business Profile"),
    [rows],
  );
  const tripStatusFilterOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.tripStatus), "Filter by Status"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [truckFilter, driverFilter, businessProfileFilter, tripStatusFilter]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (truckFilter !== "All" && row.truckNumber !== truckFilter) return false;
      if (driverFilter !== "All" && row.driverName !== driverFilter) return false;
      if (businessProfileFilter !== "All" && row.businessProfileName !== businessProfileFilter) return false;
      if (tripStatusFilter !== "All" && row.tripStatus !== tripStatusFilter) return false;
      return true;
    });
  }, [rows, truckFilter, driverFilter, businessProfileFilter, tripStatusFilter]);

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
            businessProfileName={businessProfileFilter}
            onBusinessProfileNameChange={setBusinessProfileFilter}
            businessProfileOptions={businessProfileFilterOptions}
            tripStatus={tripStatusFilter}
            onTripStatusChange={setTripStatusFilter}
            tripStatusOptions={tripStatusFilterOptions}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.tripId)}
          emptyMessage={
            isLoading
              ? "Loading truck trips…"
              : error
                ? "Failed to load truck trips."
                : "No truck trips match the current filters."
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
    </div>
  );
};

export default TruckTripPage;
