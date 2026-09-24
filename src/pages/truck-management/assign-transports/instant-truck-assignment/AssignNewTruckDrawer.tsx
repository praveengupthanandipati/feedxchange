import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSave } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import { timeOptions } from "../assignTransportsOptions.data";
import { useGetTransporterProfileSummaryQuery } from "../../../../store/transportersApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../../store/trucksApi";
import DriverSelectFields from "../../contract-trucks/DriverSelectFields";
import AddressSelectField from "../../contract-trucks/AddressSelectField";
import {
  useAddContractTrucksMutation,
  useUpdateContractTrucksMutation,
} from "../../../../store/contractTrucksApi";
import type { InstantTruckRow } from "./instantTruckAssignment.data";
import "./InstantTruckAssignment.scss";

type BillChangeOption = "direct" | "changeToBeDone";

interface FormState {
  billChangeOption: BillChangeOption;
  billChangeMessage: string;
  transporter: string;
  truck: string;
  driverName: string;
  driverPhone: string;
  loadingAddress: string;
  deliveryAddress: string;
  date: string;
  time: string;
  qty: string;
  freight: string;
  lrNumber: string;
  trackingUrl: string;
}

const initialFormState: FormState = {
  billChangeOption: "direct",
  billChangeMessage: "",
  transporter: "",
  truck: "",
  driverName: "",
  driverPhone: "",
  loadingAddress: "",
  deliveryAddress: "",
  date: "",
  time: "",
  qty: "",
  freight: "",
  lrNumber: "",
  trackingUrl: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function formatScheduleDate(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  return `${Number(day)}/${Number(month)}/${year} ${time}`;
}

function parseScheduleDateTime(value: string): { date: string; time: string } {
  const [datePart, time] = value.split(" ");
  const [day, month, year] = (datePart ?? "").split("/");
  if (!day || !month || !year) return { date: "", time: time ?? "" };
  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { date, time: time ?? "" };
}

function parseNumeric(value: string): string {
  return value.replace(/[^\d.]/g, "");
}

function getCurrentDateValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTimeValue(): string {
  return `${String(new Date().getHours()).padStart(2, "0")}:00`;
}

interface AssignNewTruckDrawerProps {
  open: boolean;
  editingRow?: InstantTruckRow | null;
  contractId: number;
  sellerId: number;
  buyerId: number;
  truckAssignmentTypeId: number;
  onClose: () => void;
  onSave: (row: InstantTruckRow) => void;
}

const DEFAULT_DISPATCH_STATUS_ID = 1;

const AssignNewTruckDrawer = ({
  open,
  editingRow = null,
  contractId,
  sellerId,
  buyerId,
  truckAssignmentTypeId,
  onClose,
  onSave,
}: AssignNewTruckDrawerProps) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  // form.driverName and the address fields hold ids; these keep the labels for the saved row.
  const [driverNameLabel, setDriverNameLabel] = useState("");
  const [loadingAddressLabel, setLoadingAddressLabel] = useState("");
  const [deliveryAddressLabel, setDeliveryAddressLabel] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const { data: transporters } = useGetTransporterProfileSummaryQuery();
  const { data: trucks } = useGetAllActiveTruckDetailsQuery();

  const [addContractTrucks, { isLoading: adding }] = useAddContractTrucksMutation();
  const [updateContractTrucks, { isLoading: updating }] = useUpdateContractTrucksMutation();
  const saving = adding || updating;

  const transporterOptions = useMemo(
    () => (transporters ?? []).map((t) => ({ value: String(t.profileId), label: t.legalName })),
    [transporters],
  );
  const truckOptions = useMemo(
    () => (trucks ?? []).map((t) => ({ value: String(t.truckId), label: t.truckNumber })),
    [trucks],
  );

  useEffect(() => {
    if (!open) return;

    if (editingRow) {
      const { date, time } = parseScheduleDateTime(editingRow.scheduleDateTime);
      setForm({
        billChangeOption: "direct",
        billChangeMessage: "",
        transporter: String(editingRow.transporterProfileId),
        truck: String(editingRow.truckId),
        driverName: String(editingRow.driverId),
        driverPhone: editingRow.driverPhone,
        loadingAddress: String(editingRow.fromAddressId),
        deliveryAddress: String(editingRow.toAddressId),
        date,
        time,
        qty: parseNumeric(editingRow.qty),
        freight: parseNumeric(editingRow.freight),
        lrNumber: editingRow.lrNumber,
        trackingUrl: editingRow.trackingUrl === "-" ? "" : editingRow.trackingUrl,
      });
      setDriverNameLabel(editingRow.driverName);
      setLoadingAddressLabel(editingRow.loadingAddress);
      setDeliveryAddressLabel(editingRow.deliveryAddress);
    } else {
      setForm({ ...initialFormState, date: getCurrentDateValue(), time: getCurrentTimeValue() });
      setDriverNameLabel("");
      setLoadingAddressLabel("");
      setDeliveryAddressLabel("");
    }
    setErrors({});
    setSubmitError("");
  }, [open, editingRow]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.transporter) nextErrors.transporter = "Select a transporter.";
    if (!form.truck) nextErrors.truck = "Select a truck.";
    if (!form.driverName.trim()) nextErrors.driverName = "Driver name is required.";

    if (!form.driverPhone.trim()) {
      nextErrors.driverPhone = "Driver contact number is required.";
    } else if (!/^\d{7,15}$/.test(form.driverPhone.trim())) {
      nextErrors.driverPhone = "Enter a valid phone number (digits only).";
    }

    if (!form.loadingAddress) nextErrors.loadingAddress = "Select a loading address.";
    if (!form.deliveryAddress) nextErrors.deliveryAddress = "Select a delivery address.";
    if (
      form.loadingAddress &&
      form.deliveryAddress &&
      form.loadingAddress === form.deliveryAddress
    ) {
      nextErrors.deliveryAddress = "Delivery address must be different from loading address.";
    }

    if (!form.date) nextErrors.date = "Schedule date is required.";
    if (!form.time) nextErrors.time = "Schedule time is required.";

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

    if (form.trackingUrl.trim() && !/^https?:\/\/.+/i.test(form.trackingUrl.trim())) {
      nextErrors.trackingUrl = "Enter a valid URL starting with http:// or https://";
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError("");

    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    const assignedOn = new Date(`${form.date}T${form.time}`).toISOString();
    const nowIso = new Date().toISOString();

    const transporterName =
      transporterOptions.find((option) => option.value === form.transporter)?.label ?? form.transporter;
    const truckNo = truckOptions.find((option) => option.value === form.truck)?.label ?? form.truck;

    try {
      let contractTruckId = editingRow?.contractTruckId ?? null;

      if (editingRow?.contractTruckId) {
        const succeeded = await updateContractTrucks({
          contractTruckId: editingRow.contractTruckId,
          updateContractTruck: {
            contractDispatchId: editingRow.contractTruckId,
            contractId,
            // Carried from the row: an edit must not re-type the assignment or drop
            // its link to the schedule it came from.
            truckAssignmentTypeId: editingRow.truckAssignmentTypeId || truckAssignmentTypeId,
            scheduledNotificationId: editingRow.dispatchScheduleTransporterId,
            transporterProfileId: Number(form.transporter),
            truckId: Number(form.truck),
            driverId: Number(form.driverName),
            assignedOn,
            lrNumber: form.lrNumber.trim(),
            quantityMT: Number(form.qty),
            freightPerMT: Number(form.freight),
            fromAddressId: Number(form.loadingAddress),
            toAddressId: Number(form.deliveryAddress),
            // Status is changed from the status screen, and the audit fields belong
            // to whoever created the dispatch — editing must leave all three alone.
            dispatchStatusId: editingRow.dispatchStatusId || DEFAULT_DISPATCH_STATUS_ID,
            createdBy: editingRow.createdBy || currentUserId,
            createdOn: editingRow.createdOn || nowIso,
            modifiedBy: currentUserId,
            modifiedOn: nowIso,
          },
        }).unwrap();
        if (!succeeded) {
          setSubmitError("The server rejected this update. Please try again.");
          return;
        }
      } else {
        const succeeded = await addContractTrucks({
          contractId,
          truckAssignmentTypeId,
          dispatchScheduleTransporterId: 0,
          transporterProfileId: Number(form.transporter),
          truckId: Number(form.truck),
          driverId: Number(form.driverName),
          assignedOn,
          lrNumber: form.lrNumber.trim(),
          quantityMT: Number(form.qty),
          freightPerMT: Number(form.freight),
          fromAddressId: Number(form.loadingAddress),
          toAddressId: Number(form.deliveryAddress),
          dispatchStatusId: DEFAULT_DISPATCH_STATUS_ID,
          createdBy: currentUserId,
        }).unwrap();
        if (!succeeded) {
          setSubmitError("The server rejected this truck assignment. Please try again.");
          return;
        }
      }

      const newRow: InstantTruckRow = {
        id: editingRow?.id ?? `itr-${Date.now()}`,
        contractTruckId,
        status: editingRow?.status ?? "Assigned",
        dispatchStatusId: editingRow?.dispatchStatusId ?? DEFAULT_DISPATCH_STATUS_ID,
        truckAssignmentTypeId: editingRow?.truckAssignmentTypeId ?? truckAssignmentTypeId,
        dispatchScheduleTransporterId: editingRow?.dispatchScheduleTransporterId ?? 0,
        createdBy: editingRow?.createdBy ?? currentUserId,
        createdOn: editingRow?.createdOn ?? nowIso,
        scheduleDateTime: formatScheduleDate(form.date, form.time),
        scheduleValue: new Date(`${form.date}T${form.time}`).getTime(),
        transporterProfileId: Number(form.transporter),
        transporterName,
        truckId: Number(form.truck),
        truckNo,
        driverId: Number(form.driverName),
        driverName: driverNameLabel || form.driverName,
        driverPhone: form.driverPhone.trim(),
        fromAddressId: Number(form.loadingAddress),
        loadingAddress: loadingAddressLabel || form.loadingAddress,
        toAddressId: Number(form.deliveryAddress),
        deliveryAddress: deliveryAddressLabel || form.deliveryAddress,
        lrNumber: form.lrNumber.trim(),
        qty: `${form.qty} MT`,
        freight: `₹${Number(form.freight).toLocaleString("en-IN")}`,
        trackingUrl: form.trackingUrl.trim() || "-",
      };

      onSave(newRow);
      onClose();
    } catch {
      setSubmitError("Failed to save the truck assignment. Please try again.");
    }
  };

  return createPortal(
    <>
      <div className={`assign-truck-drawer__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`assign-truck-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-truck-drawer-title"
      >
        <div className="assign-truck-drawer__header">
          <h2 id="assign-truck-drawer-title">
            {editingRow ? "Edit Truck Assignment" : "Assign New Truck"}
          </h2>
          <button type="button" className="assign-truck-drawer__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="assign-truck-drawer__body">
          <div className="assign-truck-drawer__bill-box">
            <span className="assign-truck-drawer__label">Bill Change Option</span>
            <div className="assign-truck-drawer__radio-group">
              <label className="assign-truck-drawer__radio">
                <input
                  type="radio"
                  name="billChangeOption"
                  checked={form.billChangeOption === "direct"}
                  onChange={() => setField("billChangeOption", "direct")}
                />
                Direct Bill
              </label>
              <label className="assign-truck-drawer__radio">
                <input
                  type="radio"
                  name="billChangeOption"
                  checked={form.billChangeOption === "changeToBeDone"}
                  onChange={() => setField("billChangeOption", "changeToBeDone")}
                />
                Change to Be Done Bill
              </label>
            </div>

            {form.billChangeOption === "changeToBeDone" && (
              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label" htmlFor="bill-change-message">
                  Bill Change Message
                </label>
                <textarea
                  id="bill-change-message"
                  className="assign-truck-drawer__textarea"
                  placeholder="Kindly contact SSRTS team or Buyer for Bill Change..."
                  value={form.billChangeMessage}
                  onChange={(event) => setField("billChangeMessage", event.target.value)}
                />
              </div>
            )}
          </div>

          <div className="assign-truck-drawer__grid">
            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label">
                Select Transporter <span className="assign-truck-drawer__required">*</span>
              </label>
              <SearchableSelect
                options={transporterOptions}
                value={form.transporter}
                onChange={(value) => setField("transporter", value)}
                placeholder="Select Transporter"
                ariaLabel="Select Transporter"
              />
              {errors.transporter && (
                <p className="assign-truck-drawer__error">{errors.transporter}</p>
              )}
            </div>

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
              value={{
                driverId: form.driverName,
                driverPhone: form.driverPhone,
                driverLabel: driverNameLabel,
              }}
              onChange={({ driverId, driverPhone, driverLabel }) => {
                setForm((prev) => ({ ...prev, driverName: driverId, driverPhone }));
                setDriverNameLabel(driverLabel ?? "");
              }}
              nameError={errors.driverName}
              phoneError={errors.driverPhone}
            />

            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label">
                Select Loading Address <span className="assign-truck-drawer__required">*</span>
              </label>
              <AddressSelectField
                profileId={sellerId}
                value={form.loadingAddress}
                onChange={(addressId, label) => {
                  setField("loadingAddress", addressId);
                  setLoadingAddressLabel(label);
                }}
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
                onChange={(addressId, label) => {
                  setField("deliveryAddress", addressId);
                  setDeliveryAddressLabel(label);
                }}
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
              <label className="assign-truck-drawer__label" htmlFor="schedule-date">
                Date <span className="assign-truck-drawer__required">*</span>
              </label>
              <input
                id="schedule-date"
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
              <label className="assign-truck-drawer__label" htmlFor="truck-qty">
                Truck Qty <span className="assign-truck-drawer__required">*</span>
              </label>
              <input
                id="truck-qty"
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
              <label className="assign-truck-drawer__label" htmlFor="freight-charges">
                Freight Charges <span className="assign-truck-drawer__required">*</span>
              </label>
              <input
                id="freight-charges"
                type="text"
                inputMode="decimal"
                className="assign-truck-drawer__control"
                placeholder="Freight Charges (e.g. ₹50,000)"
                value={form.freight}
                onChange={(event) => setField("freight", event.target.value)}
              />
              {errors.freight && <p className="assign-truck-drawer__error">{errors.freight}</p>}
            </div>

            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label" htmlFor="lr-number">
                LR Number
              </label>
              <input
                id="lr-number"
                type="text"
                className="assign-truck-drawer__control"
                placeholder="Lorry Receipt Number"
                value={form.lrNumber}
                onChange={(event) => setField("lrNumber", event.target.value)}
              />
            </div>

            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label" htmlFor="tracking-url">
                Truck Tracking URL
              </label>
              <input
                id="tracking-url"
                type="text"
                className="assign-truck-drawer__control"
                placeholder="Truck Tracking URL (e.g. https://maps.google.com)"
                value={form.trackingUrl}
                onChange={(event) => setField("trackingUrl", event.target.value)}
              />
              {errors.trackingUrl && <p className="assign-truck-drawer__error">{errors.trackingUrl}</p>}
            </div>
          </div>

          <p className="assign-truck-drawer__notice">
            Click on &quot;Save.&quot; The Truck details will then be shared with the Seller for Loading.
          </p>
          {submitError && <p className="assign-truck-drawer__error">{submitError}</p>}
        </div>

        <div className="assign-truck-drawer__footer">
          <button type="button" className="assign-truck-drawer__save" onClick={handleSave} disabled={saving}>
            <FiSave aria-hidden /> {saving ? "Saving…" : "Save & Send"}
          </button>
          <button type="button" className="assign-truck-drawer__cancel" onClick={onClose} disabled={saving}>
            <FiX aria-hidden /> Cancel
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AssignNewTruckDrawer;
