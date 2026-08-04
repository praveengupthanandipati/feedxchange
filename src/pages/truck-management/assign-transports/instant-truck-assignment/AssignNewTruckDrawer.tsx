import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSave } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import MultiSelect from "../../../../components/dropdown/MultiSelect";
import {
  transporterOptions,
  truckOptions,
  addressOptions,
  timeOptions,
} from "../assignTransportsOptions.data";
import type { InstantTruckRow } from "./instantTruckAssignment.data";
import "./InstantTruckAssignment.scss";

type BillChangeOption = "direct" | "changeToBeDone";

interface FormState {
  billChangeOption: BillChangeOption;
  billChangeMessage: string;
  transporters: string[];
  truck: string;
  driverName: string;
  driverPhone: string;
  loadingAddress: string;
  deliveryAddress: string;
  date: string;
  time: string;
  qty: string;
  freight: string;
  trackingUrl: string;
}

const initialFormState: FormState = {
  billChangeOption: "direct",
  billChangeMessage: "",
  transporters: [],
  truck: "",
  driverName: "",
  driverPhone: "",
  loadingAddress: "",
  deliveryAddress: "",
  date: "",
  time: "",
  qty: "",
  freight: "",
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

interface AssignNewTruckDrawerProps {
  open: boolean;
  editingRow?: InstantTruckRow | null;
  onClose: () => void;
  onSave: (row: InstantTruckRow) => void;
}

const AssignNewTruckDrawer = ({ open, editingRow = null, onClose, onSave }: AssignNewTruckDrawerProps) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    if (editingRow) {
      const { date, time } = parseScheduleDateTime(editingRow.scheduleDateTime);
      setForm({
        billChangeOption: "direct",
        billChangeMessage: "",
        transporters: editingRow.transporterName.split(", ").filter(Boolean),
        truck: editingRow.truckNo,
        driverName: editingRow.driverName,
        driverPhone: editingRow.driverPhone,
        loadingAddress: editingRow.loadingAddress,
        deliveryAddress: editingRow.deliveryAddress,
        date,
        time,
        qty: parseNumeric(editingRow.qty),
        freight: parseNumeric(editingRow.freight),
        trackingUrl: editingRow.trackingUrl === "-" ? "" : editingRow.trackingUrl,
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
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

    if (form.transporters.length === 0) nextErrors.transporters = "Select at least one transporter.";
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

  const handleSave = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newRow: InstantTruckRow = {
      id: editingRow?.id ?? `itr-${Date.now()}`,
      status: editingRow?.status ?? "Assigned",
      scheduleDateTime: formatScheduleDate(form.date, form.time),
      scheduleValue: new Date(`${form.date}T${form.time}`).getTime(),
      transporterName: form.transporters.join(", "),
      truckNo: form.truck,
      driverName: form.driverName.trim(),
      driverPhone: form.driverPhone.trim(),
      loadingAddress: form.loadingAddress,
      deliveryAddress: form.deliveryAddress,
      qty: `${form.qty} MT`,
      freight: `₹${Number(form.freight).toLocaleString("en-IN")}`,
      trackingUrl: form.trackingUrl.trim() || "-",
    };

    onSave(newRow);
    onClose();
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
            <div className="assign-truck-drawer__field assign-truck-drawer__field--full">
              <label className="assign-truck-drawer__label">
                Select Transporter <span className="assign-truck-drawer__required">*</span>
              </label>
              <MultiSelect
                options={transporterOptions}
                value={form.transporters}
                onChange={(value) => setField("transporters", value)}
                placeholder="Select Transporter(s)"
                ariaLabel="Select Transporter"
              />
              {errors.transporters && (
                <p className="assign-truck-drawer__error">{errors.transporters}</p>
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

            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label" htmlFor="driver-name">
                Driver Name <span className="assign-truck-drawer__required">*</span>
              </label>
              <input
                id="driver-name"
                type="text"
                className="assign-truck-drawer__control"
                placeholder="Driver Name"
                value={form.driverName}
                onChange={(event) => setField("driverName", event.target.value)}
              />
              {errors.driverName && <p className="assign-truck-drawer__error">{errors.driverName}</p>}
            </div>

            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label" htmlFor="driver-phone">
                Driver Contact No <span className="assign-truck-drawer__required">*</span>
              </label>
              <input
                id="driver-phone"
                type="tel"
                className="assign-truck-drawer__control"
                placeholder="Driver Contact No"
                value={form.driverPhone}
                onChange={(event) => setField("driverPhone", event.target.value)}
              />
              {errors.driverPhone && <p className="assign-truck-drawer__error">{errors.driverPhone}</p>}
            </div>

            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label">
                Select Loading Address <span className="assign-truck-drawer__required">*</span>
              </label>
              <SearchableSelect
                options={addressOptions}
                value={form.loadingAddress}
                onChange={(value) => setField("loadingAddress", value)}
                placeholder="Select Loading Address"
                ariaLabel="Select Loading Address"
              />
              {errors.loadingAddress && (
                <p className="assign-truck-drawer__error">{errors.loadingAddress}</p>
              )}
            </div>

            <div className="assign-truck-drawer__field">
              <label className="assign-truck-drawer__label">
                Select Delivery Address <span className="assign-truck-drawer__required">*</span>
              </label>
              <SearchableSelect
                options={addressOptions}
                value={form.deliveryAddress}
                onChange={(value) => setField("deliveryAddress", value)}
                placeholder="Select Delivery Address"
                ariaLabel="Select Delivery Address"
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
        </div>

        <div className="assign-truck-drawer__footer">
          <button type="button" className="assign-truck-drawer__save" onClick={handleSave}>
            <FiSave aria-hidden /> Save &amp; Send
          </button>
          <button type="button" className="assign-truck-drawer__cancel" onClick={onClose}>
            <FiX aria-hidden /> Cancel
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AssignNewTruckDrawer;
