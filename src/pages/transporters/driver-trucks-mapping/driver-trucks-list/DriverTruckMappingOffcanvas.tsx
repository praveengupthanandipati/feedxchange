import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiX, FiTruck } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import type { DriverTruckMapping } from "../../../../store/driverTruckMappingApi";
import type { DriverOption, DriverTruckMappingFormValues, TruckOption } from "./driverTruckMapping.types";
import "./DriverTruckMappingOffcanvas.scss";

function toDateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

interface DriverTruckMappingOffcanvasProps {
  open: boolean;
  mode: "create" | "view";
  initialValues: DriverTruckMapping | null;
  truckOptions: TruckOption[];
  driverOptions: DriverOption[];
  actionPerformedBy: number;
  onClose: () => void;
  onSave: (values: DriverTruckMappingFormValues) => void;
}

const DriverTruckMappingOffcanvas = ({
  open,
  mode,
  initialValues,
  truckOptions,
  driverOptions,
  actionPerformedBy,
  onClose,
  onSave,
}: DriverTruckMappingOffcanvasProps) => {
  const readOnly = mode === "view";
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [assignedFrom, setAssignedFrom] = useState("");
  const [assignmentReason, setAssignmentReason] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      setTruckId(String(initialValues.truckId));
      setDriverId(String(initialValues.driverId));
      setAssignedFrom(toDateInputValue(initialValues.assignedFrom));
      setAssignmentReason(initialValues.assignmentReason);
      setIsPrimary(initialValues.isPrimary);
    } else {
      setTruckId("");
      setDriverId("");
      setAssignedFrom("");
      setAssignmentReason("");
      setIsPrimary(false);
    }
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const truckSelectOptions = truckOptions.map((truck) => ({
    value: String(truck.truckId),
    label: truck.truckNumber,
  }));
  const driverSelectOptions = driverOptions.map((driver) => ({
    value: String(driver.driverId),
    label: driver.driverName,
  }));

  const isValid = truckId !== "" && driverId !== "" && assignedFrom !== "";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    onSave({
      mappingId: initialValues?.mappingId ?? null,
      truckId: Number(truckId),
      driverId: Number(driverId),
      assignedFrom: new Date(assignedFrom).toISOString(),
      assignmentReason: assignmentReason.trim(),
      isPrimary,
      actionPerformedBy,
    });
  };

  return createPortal(
    <>
      <div
        className={`driver-truck-mapping-offcanvas__backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
      />
      <div
        className={`driver-truck-mapping-offcanvas ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-truck-mapping-offcanvas-title"
      >
        <div className="driver-truck-mapping-offcanvas__header">
          <h2 id="driver-truck-mapping-offcanvas-title">
            <FiTruck aria-hidden /> {mode === "create" ? "Create Map" : "Mapping Details"}
          </h2>
          <button
            type="button"
            className="driver-truck-mapping-offcanvas__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <form className="driver-truck-mapping-offcanvas__form" onSubmit={handleSubmit}>
          <div className="driver-truck-mapping-offcanvas__body">
            <div className="driver-truck-mapping-offcanvas__field">
              <label>Truck</label>
              <SearchableSelect
                options={truckSelectOptions}
                value={truckId}
                onChange={setTruckId}
                placeholder="Select Truck"
                ariaLabel="Select truck"
                disabled={readOnly}
              />
            </div>

            <div className="driver-truck-mapping-offcanvas__field">
              <label>Driver</label>
              <SearchableSelect
                options={driverSelectOptions}
                value={driverId}
                onChange={setDriverId}
                placeholder="Select Driver"
                ariaLabel="Select driver"
                disabled={readOnly}
              />
            </div>

            <div className="driver-truck-mapping-offcanvas__field">
              <label htmlFor="dtm-assigned-from">Assigned From</label>
              <input
                id="dtm-assigned-from"
                type="date"
                value={assignedFrom}
                onChange={(event) => setAssignedFrom(event.target.value)}
                required
                disabled={readOnly}
              />
            </div>

            <div className="driver-truck-mapping-offcanvas__field">
              <label htmlFor="dtm-reason">Assignment Reason</label>
              <textarea
                id="dtm-reason"
                rows={4}
                value={assignmentReason}
                onChange={(event) => setAssignmentReason(event.target.value)}
                placeholder="Reason for this assignment"
                disabled={readOnly}
              />
            </div>

            <label className="driver-truck-mapping-offcanvas__checkbox">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(event) => setIsPrimary(event.target.checked)}
                disabled={readOnly}
              />
              Mark as primary driver for this truck
            </label>
          </div>

          <div className="driver-truck-mapping-offcanvas__actions">
            <button type="button" className="driver-truck-mapping-offcanvas__cancel" onClick={onClose}>
              {readOnly ? "Close" : "Cancel"}
            </button>
            {!readOnly && (
              <button type="submit" className="driver-truck-mapping-offcanvas__submit" disabled={!isValid}>
                Create Map
              </button>
            )}
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
};

export default DriverTruckMappingOffcanvas;
