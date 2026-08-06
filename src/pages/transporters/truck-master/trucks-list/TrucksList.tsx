import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import TrucksFilters from "./TrucksFilters";
import Pagination from "./Pagination";
import { buildTruckColumns } from "./trucks.columns";
import { MOCK_TRUCKS } from "./trucks.mock";
import type { Truck } from "./trucks.types";
import "./Trucks.scss";

const PAGE_SIZE = 10;

interface FilterOption {
  value: string;
  label: string;
}

function buildStringOptions(values: string[], allLabel: string): FilterOption[] {
  const unique = Array.from(new Set(values.filter(Boolean))).sort();
  return [{ value: "All", label: allLabel }, ...unique.map((value) => ({ value, label: value }))];
}

function buildNumericOptions(values: number[], allLabel: string): FilterOption[] {
  const unique = Array.from(new Set(values)).sort((a, b) => a - b);
  return [
    { value: "All", label: allLabel },
    ...unique.map((value) => ({ value: String(value), label: String(value) })),
  ];
}

function getExportCellValue(row: Truck, column: TableColumn<Truck>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TrucksList = () => {
  const navigate = useNavigate();
  // TODO: replace with a real trucksApi (RTK Query) once the backend exposes
  // a GetAllTrucks summary endpoint; see trucks.mock.ts.
  const [rows, setRows] = useState<Truck[]>(MOCK_TRUCKS);

  const [truckNumber, setTruckNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [truckType, setTruckType] = useState("All");
  const [make, setMake] = useState("All");
  const [model, setModel] = useState("All");
  const [manufactureYear, setManufactureYear] = useState("All");
  const [capacity, setCapacity] = useState("All");
  const [fuelType, setFuelType] = useState("All");

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Truck | null>(null);

  const handleEdit = (truck: Truck) => {
    // TODO: point at the real edit route once the Truck edit page is built.
    navigate(`/truck-management/transporters/truck-master/edit/${truck.profileId}`);
  };

  const handleDelete = (truck: Truck) => {
    setPendingDeleteRow(truck);
  };

  const confirmDelete = () => {
    if (!pendingDeleteRow) return;
    // TODO: call the real delete mutation once the backend exposes one.
    setRows((prev) => prev.filter((row) => row.profileId !== pendingDeleteRow.profileId));
    setPendingDeleteRow(null);
  };

  const columns = useMemo(
    () => buildTruckColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const truckTypeOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.truckType), "Filter by Truck Type"),
    [rows],
  );
  const makeOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.make), "Filter by Make"),
    [rows],
  );
  const modelOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.model), "Filter by Model"),
    [rows],
  );
  const manufactureYearOptions = useMemo(
    () => buildNumericOptions(rows.map((row) => row.manufactureYear), "Filter by Year of Model"),
    [rows],
  );
  const capacityOptions = useMemo(
    () =>
      buildStringOptions(
        rows.map((row) => `${row.capacity} ${row.capacityUnit}`),
        "Filter by Capacity",
      ),
    [rows],
  );
  const fuelTypeOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.fuelType), "Filter by Fuel Type"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [truckNumber, registrationNumber, truckType, make, model, manufactureYear, capacity, fuelType]);

  const filteredRows = useMemo(() => {
    const truckNumberQuery = truckNumber.trim().toLowerCase();
    const registrationNumberQuery = registrationNumber.trim().toLowerCase();

    return rows.filter((row) => {
      if (truckNumberQuery && !row.truckNumber.toLowerCase().includes(truckNumberQuery)) return false;
      if (
        registrationNumberQuery &&
        !row.registrationNumber.toLowerCase().includes(registrationNumberQuery)
      )
        return false;
      if (truckType !== "All" && row.truckType !== truckType) return false;
      if (make !== "All" && row.make !== make) return false;
      if (model !== "All" && row.model !== model) return false;
      if (manufactureYear !== "All" && String(row.manufactureYear) !== manufactureYear) return false;
      if (capacity !== "All" && `${row.capacity} ${row.capacityUnit}` !== capacity) return false;
      if (fuelType !== "All" && row.fuelType !== fuelType) return false;

      return true;
    });
  }, [rows, truckNumber, registrationNumber, truckType, make, model, manufactureYear, capacity, fuelType]);

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
    link.download = "trucks.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="trucks-page">
      <div className="trucks-card">
        <div className="trucks-card__header">
          <h1>Trucks</h1>
          <div className="trucks-card__actions">
            <button
              type="button"
              className="trucks-btn trucks-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="trucks-btn trucks-btn--warning" onClick={handleExport}>
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="trucks-btn trucks-btn--primary"
              onClick={() => navigate("/truck-management/transporters/truck-master/new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <TrucksFilters
            truckNumber={truckNumber}
            onTruckNumberChange={setTruckNumber}
            registrationNumber={registrationNumber}
            onRegistrationNumberChange={setRegistrationNumber}
            truckType={truckType}
            onTruckTypeChange={setTruckType}
            truckTypeOptions={truckTypeOptions}
            make={make}
            onMakeChange={setMake}
            makeOptions={makeOptions}
            model={model}
            onModelChange={setModel}
            modelOptions={modelOptions}
            manufactureYear={manufactureYear}
            onManufactureYearChange={setManufactureYear}
            manufactureYearOptions={manufactureYearOptions}
            capacity={capacity}
            onCapacityChange={setCapacity}
            capacityOptions={capacityOptions}
            fuelType={fuelType}
            onFuelTypeChange={setFuelType}
            fuelTypeOptions={fuelTypeOptions}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.profileId)}
          emptyMessage="No trucks match the current filters."
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
        title="Remove this truck?"
        message={`This will permanently delete "${pendingDeleteRow?.truckNumber}". This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default TrucksList;
