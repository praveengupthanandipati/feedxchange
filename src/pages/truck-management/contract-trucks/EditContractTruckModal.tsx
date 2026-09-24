import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiEdit2, FiX } from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import DriverSelectFields from "./DriverSelectFields";
import AddressSelectField from "./AddressSelectField";
import { timeOptions } from "../open-pending-contracts/contract-trucks/contractDispatch.options";
import { useGetAllActiveTruckDetailsQuery } from "../../../store/trucksApi";
import { useGetAllActiveDriversQuery } from "../../../store/driversApi";
import { useUpdateContractTrucksMutation, type TruckByContract } from "../../../store/contractTrucksApi";
import { splitApiDateTimeForForm } from "../../../utils/apiDateTime";
import "../assign-transports/instant-truck-assignment/InstantTruckAssignment.scss";
import "../../../components/dialog/ConfirmDialog.scss";
import "./EditContractTruckModal.scss";

interface FormState {
  truck: string;
  driverId: string;
  driverPhone: string;
  loadingAddress: string;
  deliveryAddress: string;
  date: string;
  time: string;
  qty: string;
  freight: string;
  lrNumber: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

interface EditContractTruckModalProps {
  open: boolean;
  /** The dispatch row being edited, straight from GetAllTrucksByContract. */
  truck: TruckByContract;
  /** Profiles the loading and delivery addresses belong to. */
  sellerId: number;
  buyerId: number;
  onClose: () => void;
  onSaved: () => void;
}

/** Edits an assigned truck's dispatch details; status itself is changed on the row behind this. */
const EditContractTruckModal = ({
  open,
  truck,
  sellerId,
  buyerId,
  onClose,
  onSaved,
}: EditContractTruckModalProps) => {
  const { data: trucks } = useGetAllActiveTruckDetailsQuery(undefined, { skip: !open });
  const { data: drivers } = useGetAllActiveDriversQuery(undefined, { skip: !open });
  const [updateContractTrucks, { isLoading: saving }] = useUpdateContractTrucksMutation();

  const [form, setForm] = useState<FormState>({
    truck: "",
    driverId: "",
    driverPhone: "",
    loadingAddress: "",
    deliveryAddress: "",
    date: "",
    time: "",
    qty: "",
    freight: "",
    lrNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const truckOptions = useMemo(
    () => (trucks ?? []).map((t) => ({ value: String(t.truckId), label: t.truckNumber })),
    [trucks],
  );

  useEffect(() => {
    if (!open) return;
    const { date, time } = splitApiDateTimeForForm(truck.assignedOn);
    setForm({
      truck: String(truck.truckId),
      driverId: String(truck.driverId),
      driverPhone: "",
      loadingAddress: String(truck.fromAddressId),
      deliveryAddress: String(truck.toAddressId),
      date,
      time,
      qty: String(truck.quantityMT),
      freight: String(truck.freightPerMT),
      lrNumber: truck.lrNumber ?? "",
    });
    setErrors({});
    setSubmitError("");
  }, [open, truck]);

  // The dispatch row carries only the driver id, so the phone is filled in once the drivers load.
  useEffect(() => {
    if (!open || !drivers) return;
    setForm((prev) =>
      prev.driverPhone
        ? prev
        : {
            ...prev,
            driverPhone: drivers.find((d) => d.driverId === truck.driverId)?.mobileNumber ?? "",
          },
    );
  }, [open, drivers, truck.driverId]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.truck) nextErrors.truck = "Select a truck.";
    if (!form.driverId) nextErrors.driverId = "Select a driver.";
    if (!form.driverPhone.trim()) nextErrors.driverPhone = "Driver contact number is required.";
    if (!form.loadingAddress) nextErrors.loadingAddress = "Select a loading address.";
    if (!form.deliveryAddress) nextErrors.deliveryAddress = "Select a delivery address.";
    if (form.loadingAddress && form.loadingAddress === form.deliveryAddress) {
      nextErrors.deliveryAddress = "Delivery address must be different from loading address.";
    }
    if (!form.date) nextErrors.date = "Date is required.";
    if (!form.time) nextErrors.time = "Time is required.";

    if (!form.qty.trim()) {
      nextErrors.qty = "Truck quantity is required.";
    } else if (!/^\d+(\.\d+)?$/.test(form.qty.trim()) || Number(form.qty) <= 0) {
      nextErrors.qty = "Enter a valid quantity greater than 0.";
    }

    if (!form.freight.trim()) {
      nextErrors.freight = "Freight charges are required.";
    } else if (!/^\d+(\.\d+)?$/.test(form.freight.trim()) || Number(form.freight) <= 0) {
      nextErrors.freight = "Enter a valid freight amount greater than 0.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError("");
    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    const nowIso = new Date().toISOString();

    try {
      const succeeded = await updateContractTrucks({
        contractTruckId: truck.contractDispatchId,
        updateContractTruck: {
          contractDispatchId: truck.contractDispatchId,
          contractId: truck.contractId,
          truckAssignmentTypeId: truck.truckAssignmentTypeId,
          scheduledNotificationId: truck.dispatchScheduleTransporterId ?? 0,
          transporterProfileId: truck.transporterProfileId,
          truckId: Number(form.truck),
          driverId: Number(form.driverId),
          assignedOn: new Date(`${form.date}T${form.time}`).toISOString(),
          lrNumber: form.lrNumber.trim(),
          quantityMT: Number(form.qty),
          freightPerMT: Number(form.freight),
          fromAddressId: Number(form.loadingAddress),
          toAddressId: Number(form.deliveryAddress),
          // Status is changed from the row itself, so it is carried over unchanged.
          dispatchStatusId: truck.dispatchStatusId,
          createdBy: truck.createdBy,
          createdOn: truck.createdOn,
          modifiedBy: currentUserId,
          modifiedOn: nowIso,
        },
      }).unwrap();

      if (!succeeded) {
        setSubmitError("The server rejected this update. Please try again.");
        return;
      }

      onSaved();
    } catch {
      setSubmitError("Failed to update this truck. Please try again.");
    }
  };

  return createPortal(
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div
        className="confirm-dialog edit-contract-truck-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-contract-truck-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog__icon edit-contract-truck-modal__icon">
          <FiEdit2 aria-hidden />
        </div>
        <h2 id="edit-contract-truck-title" className="confirm-dialog__title">
          Edit Truck {truck.registrationNumber}
        </h2>
        <p className="confirm-dialog__message">
          {truck.legalName} · {truck.truckAssignmentTypeName}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="edit-contract-truck-modal__scroll">
            <div className="assign-truck-drawer__grid">
              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label">
                  Select Truck <span className="assign-truck-drawer__required">*</span>
                </label>
                <SearchableSelect
                  options={truckOptions}
                  value={form.truck}
                  onChange={(value) => setField("truck", value)}
                  placeholder="Select Truck"
                  ariaLabel="Select Truck"
                />
                {errors.truck && <p className="assign-truck-drawer__error">{errors.truck}</p>}
              </div>

              <DriverSelectFields
                value={{ driverId: form.driverId, driverPhone: form.driverPhone }}
                onChange={({ driverId, driverPhone }) =>
                  setForm((prev) => ({ ...prev, driverId, driverPhone }))
                }
                nameError={errors.driverId}
                phoneError={errors.driverPhone}
              />

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label">
                  Select Loading Address <span className="assign-truck-drawer__required">*</span>
                </label>
                <AddressSelectField
                  profileId={sellerId}
                  value={form.loadingAddress}
                  onChange={(addressId) => setField("loadingAddress", addressId)}
                  placeholder="Select Loading Address"
                  ariaLabel="Select Loading Address"
                  modalTitle="New Loading Address"
                />
                {errors.loadingAddress && (
                  <p className="assign-truck-drawer__error">{errors.loadingAddress}</p>
                )}
              </div>

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label">
                  Select Delivery Address <span className="assign-truck-drawer__required">*</span>
                </label>
                <AddressSelectField
                  profileId={buyerId}
                  value={form.deliveryAddress}
                  onChange={(addressId) => setField("deliveryAddress", addressId)}
                  placeholder="Select Delivery Address"
                  ariaLabel="Select Delivery Address"
                  modalTitle="New Delivery Address"
                  defaultUnloading
                />
                {errors.deliveryAddress && (
                  <p className="assign-truck-drawer__error">{errors.deliveryAddress}</p>
                )}
              </div>

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label" htmlFor="edit-truck-date">
                  Date <span className="assign-truck-drawer__required">*</span>
                </label>
                <input
                  id="edit-truck-date"
                  type="date"
                  className="assign-truck-drawer__control"
                  value={form.date}
                  onChange={(event) => setField("date", event.target.value)}
                />
                {errors.date && <p className="assign-truck-drawer__error">{errors.date}</p>}
              </div>

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label">
                  Time <span className="assign-truck-drawer__required">*</span>
                </label>
                <SearchableSelect
                  options={timeOptions}
                  value={form.time}
                  onChange={(value) => setField("time", value)}
                  placeholder="00:00"
                  ariaLabel="Select Time"
                />
                {errors.time && <p className="assign-truck-drawer__error">{errors.time}</p>}
              </div>

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label" htmlFor="edit-truck-qty">
                  Truck Qty <span className="assign-truck-drawer__required">*</span>
                </label>
                <input
                  id="edit-truck-qty"
                  type="text"
                  inputMode="decimal"
                  className="assign-truck-drawer__control"
                  placeholder="Truck Qty (e.g. 20 MT)"
                  value={form.qty}
                  onChange={(event) => setField("qty", event.target.value)}
                />
                {errors.qty && <p className="assign-truck-drawer__error">{errors.qty}</p>}
              </div>

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label" htmlFor="edit-truck-freight">
                  Freight Charges <span className="assign-truck-drawer__required">*</span>
                </label>
                <input
                  id="edit-truck-freight"
                  type="text"
                  inputMode="decimal"
                  className="assign-truck-drawer__control"
                  placeholder="Freight Charges"
                  value={form.freight}
                  onChange={(event) => setField("freight", event.target.value)}
                />
                {errors.freight && <p className="assign-truck-drawer__error">{errors.freight}</p>}
              </div>

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label" htmlFor="edit-truck-lr">
                  LR Number
                </label>
                <input
                  id="edit-truck-lr"
                  type="text"
                  className="assign-truck-drawer__control"
                  placeholder="Lorry Receipt Number"
                  value={form.lrNumber}
                  onChange={(event) => setField("lrNumber", event.target.value)}
                />
              </div>
            </div>
          </div>

          {submitError && (
            <p className="assign-truck-drawer__error" role="alert">
              {submitError}
            </p>
          )}

          <div className="confirm-dialog__actions">
            <button type="button" className="confirm-dialog__cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="confirm-dialog__confirm edit-contract-truck-modal__confirm"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>

        <button type="button" className="edit-contract-truck-modal__close" onClick={onClose} aria-label="Close">
          <FiX aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default EditContractTruckModal;
