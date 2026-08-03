import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSave } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import MultiSelect from "../../../../components/dropdown/MultiSelect";
import {
  transporterOptions,
  addressOptions,
  timeOptions,
} from "../assignTransportsOptions.data";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";
import "./ScheduleTruckAssignment.scss";

type BillChangeOption = "direct" | "changeToBeDone";

const DEFAULT_BILL_MESSAGE =
  "Kindly contact SSRTS team or Buyer for Bill Change and release the vehicle with correct bill";

interface FormState {
  billChangeOption: BillChangeOption;
  billChangeMessage: string;
  transporters: string[];
  loadingAddress: string;
  deliveryAddress: string;
  date: string;
  time: string;
  qty: string;
  freight: string;
  autoApprove: boolean;
}

const initialFormState: FormState = {
  billChangeOption: "direct",
  billChangeMessage: DEFAULT_BILL_MESSAGE,
  transporters: [],
  loadingAddress: "",
  deliveryAddress: "",
  date: "",
  time: "",
  qty: "",
  freight: "",
  autoApprove: false,
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

interface ScheduleRequestDrawerProps {
  open: boolean;
  editingRow?: ScheduleTruckRow | null;
  onClose: () => void;
  onSave: (row: ScheduleTruckRow) => void;
}

const ScheduleRequestDrawer = ({
  open,
  editingRow = null,
  onClose,
  onSave,
}: ScheduleRequestDrawerProps) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    if (editingRow) {
      const { date, time } = parseScheduleDateTime(editingRow.scheduleDateTime);
      setForm({
        billChangeOption: "direct",
        billChangeMessage: DEFAULT_BILL_MESSAGE,
        transporters: [],
        loadingAddress: editingRow.loadingAddress,
        deliveryAddress: editingRow.deliveryAddress,
        date,
        time,
        qty: parseNumeric(editingRow.qty),
        freight: parseNumeric(editingRow.freight),
        autoApprove: editingRow.autoApprove,
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

  if (!open) return null;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (form.transporters.length === 0) nextErrors.transporters = "Select at least one transporter.";
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

    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newRow: ScheduleTruckRow = {
      id: editingRow?.id ?? `str-${Date.now()}`,
      status: editingRow?.status ?? "Pending",
      autoApprove: form.autoApprove,
      scheduleDateTime: formatScheduleDate(form.date, form.time),
      scheduleValue: new Date(`${form.date}T${form.time}`).getTime(),
      loadingAddress: form.loadingAddress,
      deliveryAddress: form.deliveryAddress,
      qty: `${form.qty} MT`,
      freight: `₹${Number(form.freight).toLocaleString("en-IN")}`,
      trucksAssigned: editingRow?.trucksAssigned ?? 0,
    };

    onSave(newRow);
    onClose();
  };

  return createPortal(
    <>
      <div className="schedule-request-drawer__backdrop is-open" onClick={onClose} />
      <div
        className="schedule-request-drawer is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-request-drawer-title"
      >
        <div className="schedule-request-drawer__header">
          <h2 id="schedule-request-drawer-title">Create / Edit Schedule</h2>
          <button
            type="button"
            className="schedule-request-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div className="schedule-request-drawer__body">
          <div className="schedule-request-drawer__bill-box">
            <span className="schedule-request-drawer__label">Bill Change Option</span>
            <div className="schedule-request-drawer__radio-group">
              <label className="schedule-request-drawer__radio">
                <input
                  type="radio"
                  name="scheduleBillChangeOption"
                  checked={form.billChangeOption === "direct"}
                  onChange={() => setField("billChangeOption", "direct")}
                />
                Direct Bill
              </label>
              <label className="schedule-request-drawer__radio">
                <input
                  type="radio"
                  name="scheduleBillChangeOption"
                  checked={form.billChangeOption === "changeToBeDone"}
                  onChange={() => setField("billChangeOption", "changeToBeDone")}
                />
                Change to Be Done Bill
              </label>
            </div>

            {form.billChangeOption === "changeToBeDone" && (
              <div className="schedule-request-drawer__field">
                <label className="schedule-request-drawer__label" htmlFor="schedule-bill-change-message">
                  Bill Change Message
                </label>
                <textarea
                  id="schedule-bill-change-message"
                  className="schedule-request-drawer__textarea"
                  value={form.billChangeMessage}
                  onChange={(event) => setField("billChangeMessage", event.target.value)}
                />
                <span className="schedule-request-drawer__hint">
                  This message will be displayed to the driver/transporter
                </span>
              </div>
            )}
          </div>

          <div className="schedule-request-drawer__grid">
            <div className="schedule-request-drawer__field schedule-request-drawer__field--full">
              <label className="schedule-request-drawer__label">
                Select Transporter <span className="schedule-request-drawer__required">*</span>
              </label>
              <MultiSelect
                options={transporterOptions}
                value={form.transporters}
                onChange={(value) => setField("transporters", value)}
                placeholder="Select Transporter(s)"
                ariaLabel="Select Transporter"
              />
              {errors.transporters && (
                <p className="schedule-request-drawer__error">{errors.transporters}</p>
              )}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label">
                Select Loading Address <span className="schedule-request-drawer__required">*</span>
              </label>
              <SearchableSelect
                options={addressOptions}
                value={form.loadingAddress}
                onChange={(value) => setField("loadingAddress", value)}
                placeholder="Select Loading Address"
                ariaLabel="Select Loading Address"
              />
              {errors.loadingAddress && (
                <p className="schedule-request-drawer__error">{errors.loadingAddress}</p>
              )}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label">
                Select Delivery Address <span className="schedule-request-drawer__required">*</span>
              </label>
              <SearchableSelect
                options={addressOptions}
                value={form.deliveryAddress}
                onChange={(value) => setField("deliveryAddress", value)}
                placeholder="Select Delivery Address"
                ariaLabel="Select Delivery Address"
              />
              {errors.deliveryAddress && (
                <p className="schedule-request-drawer__error">{errors.deliveryAddress}</p>
              )}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label" htmlFor="schedule-date">
                Date <span className="schedule-request-drawer__required">*</span>
              </label>
              <input
                id="schedule-date"
                type="date"
                className="schedule-request-drawer__control"
                value={form.date}
                onChange={(event) => setField("date", event.target.value)}
              />
              {errors.date && <p className="schedule-request-drawer__error">{errors.date}</p>}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label">
                Time <span className="schedule-request-drawer__required">*</span>
              </label>
              <SearchableSelect
                options={timeOptions}
                value={form.time}
                onChange={(value) => setField("time", value)}
                placeholder="00:00"
                ariaLabel="Select Time"
              />
              {errors.time && <p className="schedule-request-drawer__error">{errors.time}</p>}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label" htmlFor="schedule-truck-qty">
                Truck Qty <span className="schedule-request-drawer__required">*</span>
              </label>
              <input
                id="schedule-truck-qty"
                type="text"
                inputMode="decimal"
                className="schedule-request-drawer__control"
                placeholder="Truck Qty (e.g. 20 MT)"
                value={form.qty}
                onChange={(event) => setField("qty", event.target.value)}
              />
              {errors.qty && <p className="schedule-request-drawer__error">{errors.qty}</p>}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label" htmlFor="schedule-freight">
                Freight Charges <span className="schedule-request-drawer__required">*</span>
              </label>
              <input
                id="schedule-freight"
                type="text"
                inputMode="decimal"
                className="schedule-request-drawer__control"
                placeholder="Freight Charges (e.g. ₹50,000)"
                value={form.freight}
                onChange={(event) => setField("freight", event.target.value)}
              />
              {errors.freight && <p className="schedule-request-drawer__error">{errors.freight}</p>}
            </div>

            <div className="schedule-request-drawer__field schedule-request-drawer__field--checkbox">
              <label className="schedule-request-drawer__checkbox">
                <input
                  type="checkbox"
                  checked={form.autoApprove}
                  onChange={(event) => setField("autoApprove", event.target.checked)}
                />
                Auto Approve
              </label>
            </div>
          </div>
        </div>

        <div className="schedule-request-drawer__footer">
          <button type="button" className="schedule-request-drawer__save" onClick={handleSave}>
            <FiSave aria-hidden /> Save &amp; Send
          </button>
          <button type="button" className="schedule-request-drawer__cancel" onClick={onClose}>
            <FiX aria-hidden /> Cancel
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ScheduleRequestDrawer;
