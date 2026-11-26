import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, PlusIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import ConfirmDialog from "../../../../../shared/components/dialog/ConfirmDialog";
import SuccessToast from "../../../../../shared/components/toast/SuccessToast";
import { useSuccessToast } from "../../../../../shared/components/toast/useSuccessToast";
import TrucksFilters from "./TrucksFilters";
import Pagination from "./Pagination";
import { buildTruckColumns } from "./trucks.columns";
import {
  useGetAllActiveTruckDetailsQuery,
  useDeleteTruckDetailsMutation,
  formatCapacity,
  type Truck,
} from "../../../../../core/store/trucksApi";
import "./Trucks.scss";

import Can from "../../../../../core/auth/Can";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";

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



const TrucksList = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAllActiveTruckDetailsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteTruckDetails] = useDeleteTruckDetailsMutation();
  const rows = useMemo(() => data ?? [], [data]);

  const [truckNumber, setTruckNumber] = useState("");
  const [truckType, setTruckType] = useState("All");
  const [make, setMake] = useState("All");
  const [model, setModel] = useState("All");
  const [manufactureYear, setManufactureYear] = useState("All");
  const [capacity, setCapacity] = useState("All");
  const [fuelType, setFuelType] = useState("All");

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Truck | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { message: successMessage, showSuccessMessage } = useSuccessToast();

  const handleEdit = (truck: Truck) => {
    navigate(`/admin/truck-management/transporters/truck-master/new?id=${truck.truckId}`);
  };

  const handleView = (truck: Truck) => {
    navigate(`/admin/truck-management/transporters/truck-master/${truck.truckId}`);
  };

  const handleDelete = (truck: Truck) => {
    setDeleteError(null);
    setPendingDeleteRow(truck);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteRow) return;

    const actionPerformedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await deleteTruckDetails({
        truckId: pendingDeleteRow.truckId,
        actionPerformedBy,
      }).unwrap();
      setPendingDeleteRow(null);
      showSuccessMessage("Truck deleted successfully");
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Failed to delete truck."));
    }
  };

  const columns = useMemo(
    () => buildTruckColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }),
    [],
  );

  const truckTypeOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.truckType ?? ""), "Filter by Truck Type"),
    [rows],
  );
  const makeOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.make ?? ""), "Filter by Make"),
    [rows],
  );
  const modelOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.model ?? ""), "Filter by Model"),
    [rows],
  );
  const manufactureYearOptions = useMemo(
    () => buildNumericOptions(rows.flatMap((row) => (row.manufactureYear ? [row.manufactureYear] : [])), "Filter by Year of Model"),
    [rows],
  );
  const capacityOptions = useMemo(
    () =>
      buildStringOptions(
        rows.map((row) => formatCapacity(row)),
        "Filter by Capacity",
      ),
    [rows],
  );
  const fuelTypeOptions = useMemo(
    () => buildStringOptions(rows.map((row) => row.fuelType ?? ""), "Filter by Fuel Type"),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [truckNumber, truckType, make, model, manufactureYear, capacity, fuelType]);

  const filteredRows = useMemo(() => {
    const truckNumberQuery = truckNumber.trim().toLowerCase();

    return rows.filter((row) => {
      if (truckNumberQuery && !row.truckNumber.toLowerCase().includes(truckNumberQuery)) return false;
      if (truckType !== "All" && row.truckType !== truckType) return false;
      if (make !== "All" && row.make !== make) return false;
      if (model !== "All" && row.model !== model) return false;
      if (manufactureYear !== "All" && String(row.manufactureYear) !== manufactureYear) return false;
      if (capacity !== "All" && formatCapacity(row) !== capacity) return false;
      if (fuelType !== "All" && row.fuelType !== fuelType) return false;

      return true;
    });
  }, [rows, truckNumber, truckType, make, model, manufactureYear, capacity, fuelType]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );


  return (
    <div className="trucks-page">
      <SuccessToast message={successMessage} />
      <div className="trucks-card">
        <div className="trucks-card__header">
          <h1>Trucks</h1>
          <div className="trucks-card__actions">
            <button
              type="button"
              className="trucks-btn trucks-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <Can any={["truck-master.manage"]}>
              <button
                type="button"
                className="trucks-btn trucks-btn--primary"
                onClick={() => navigate("/admin/truck-management/transporters/truck-master/new")}
              >
                <PlusIcon aria-hidden /> New
              </button>
            </Can>
          </div>
        </div>

        {filtersVisible && (
          <TrucksFilters
            truckNumber={truckNumber}
            onTruckNumberChange={setTruckNumber}
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
            onClear={() => {
              setTruckNumber("");
              setTruckType("All");
              setMake("All");
              setModel("All");
              setManufactureYear("All");
              setCapacity("All");
              setFuelType("All");
            }}
          />
        )}

        <Table
          exportName="Trucks"
          exportData={filteredRows}
          columnToggle
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.truckId)}
          emptyMessage={
            isLoading
              ? "Loading trucks…"
              : error
                ? "Failed to load trucks."
                : "No trucks match the current filters."
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

      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this truck?"
        message={
          deleteError ||
          `This will permanently delete "${pendingDeleteRow?.truckNumber}". This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default TrucksList;
