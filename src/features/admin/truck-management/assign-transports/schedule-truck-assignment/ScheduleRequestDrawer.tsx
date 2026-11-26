import { useMemo, useEffect, useState } from "react";
import TimePickerInput from "../../../../../shared/components/dropdown/TimePickerInput";
import { createPortal } from "react-dom";
import { SaveIcon, XIcon } from "../../../../../shared/components/icon";
import DatePickerInput from "../../../../../shared/components/dropdown/DatePickerInput";
import MultiSelect from "../../../../../shared/components/dropdown/MultiSelect";
import { currentTimeValue, isPastDateTime, todayDateValue } from "../../open-pending-contracts/contract-trucks/contractDispatch.options";
import { useRouteTransporters } from "../../../usermanagement/transporters/useRouteTransporters";
import { isSuperAdmin } from "../../../../../core/auth/session";
import TransporterRouteHint from "../../../usermanagement/transporters/TransporterRouteHint";
import { useGetTransporterProfileSummaryQuery } from "../../../../../core/store/transportersApi";
import AddressSelectField from "../../contract-trucks/AddressSelectField";
import { useGetScheduleStatusesQuery } from "../../../../../core/store/contractsApi";
import { useScheduleContractTrucksMutation } from "../../../../../core/store/contractTrucksApi";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";
import type { ScheduleTruckRow } from "./scheduleTruckAssignment.data";
import "./ScheduleTruckAssignment.scss";
import { useNotifyPrompt } from "../../../../../shared/notifications/useNotifyPrompt";

type BillChangeOption = "direct" | "changeToBeDone";

const DEFAULT_BILL_MESSAGE =
  "Kindly contact FeedXchange team or Buyer for Bill Change and release the vehicle with correct bill";

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
  remarks: string;
  autoApprove: boolean;
  billChangeRequired: boolean;
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
  remarks: "",
  autoApprove: false,
  billChangeRequired: false,
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
  contractId: number;
  sellerId: number;
  buyerId: number;
  onClose: () => void;
  onSave: (row: ScheduleTruckRow) => void;
}

const ScheduleRequestDrawer = ({
  open,
  editingRow = null,
  contractId,
  sellerId,
  buyerId,
  onClose,
  onSave,
}: ScheduleRequestDrawerProps) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  // The address fields hold ids; these keep the labels for the saved row.
  const [loadingAddressLabel, setLoadingAddressLabel] = useState("");
  const [deliveryAddressLabel, setDeliveryAddressLabel] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const { data: transporters } = useGetTransporterProfileSummaryQuery();
  const { data: scheduleStatuses } = useGetScheduleStatusesQuery();
  const [scheduleContractTrucks, { isLoading: saving }] = useScheduleContractTrucksMutation();
  const notify = useNotifyPrompt();

  // when editing, the transporters already on the request stay offered
  const editingRowTransporterIds = useMemo(() => (editingRow?.transporterProfileIds ?? []).map(String), [editingRow]);
  // The route comes first: only the transporters serving the loading state -> delivery state are offered
  const route = useRouteTransporters({
    transporters,
    sellerId,
    buyerId,
    loadingAddressId: form.loadingAddress,
    deliveryAddressId: form.deliveryAddress,
    keepIds: editingRowTransporterIds,
  });
  const { eligibleIds, statesReady } = route;
  // a change of address can leave a picked transporter off the route: drop it
  useEffect(() => {
    if (!statesReady) return;
    setForm((prev) => {
      const kept = prev.transporters.filter((id) => eligibleIds.has(id));
      return kept.length === prev.transporters.length ? prev : { ...prev, transporters: kept, autoApprove: kept.length > 1 ? false : prev.autoApprove };
    });
  }, [statesReady, eligibleIds]);

  useEffect(() => {
    if (!open) return;

    if (editingRow) {
      const { date, time } = parseScheduleDateTime(editingRow.scheduleDateTime);
      setForm({
        billChangeOption: "direct",
        billChangeMessage: DEFAULT_BILL_MESSAGE,
        transporters: editingRow.transporterProfileIds.map(String),
        loadingAddress: String(editingRow.fromAddressId),
        deliveryAddress: String(editingRow.toAddressId),
        date,
        time,
        qty: parseNumeric(editingRow.qty),
        freight: parseNumeric(editingRow.freight),
        remarks: editingRow.remarks,
        autoApprove: editingRow.autoApprove,
        billChangeRequired: editingRow.billChangeRequired ?? false,
      });
    } else {
      // a new request starts at the current time (hours and minutes), which can be changed
      setForm({ ...initialFormState, time: currentTimeValue() });
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
    else if (!editingRow && isPastDateTime(form.date, form.time)) nextErrors.time = "Date and time can't be in the past.";

    if (!form.qty.trim()) {
      nextErrors.qty = "Truck quantity is required.";
    } else if (!/^\d+(\.\d+)?$/.test(form.qty.trim()) || Number(form.qty) <= 0) {
      nextErrors.qty = "Enter a valid quantity greater than 0.";
    }

    // Freight is optional: left empty it goes as 0 and the transporter states its own freight when answering.
    if (form.freight.trim() && (!/^\d+(\.\d+)?$/.test(form.freight.trim()) || Number(form.freight) < 0)) {
      nextErrors.freight = "Enter a valid freight amount (0 or more), or leave it empty.";
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError("");

    const newRow: ScheduleTruckRow = {
      id: editingRow?.id ?? `str-${Date.now()}`,
      status: editingRow?.status ?? "Pending",
      autoApprove: form.autoApprove,
      billChangeRequired: form.billChangeRequired,
      scheduleDateTime: formatScheduleDate(form.date, form.time),
      scheduleValue: new Date(`${form.date}T${form.time}`).getTime(),
      transporterProfileIds: form.transporters.map(Number),
      fromAddressId: Number(form.loadingAddress),
      loadingAddress: loadingAddressLabel || form.loadingAddress,
      toAddressId: Number(form.deliveryAddress),
      deliveryAddress: deliveryAddressLabel || form.deliveryAddress,
      remarks: form.remarks.trim(),
      qty: `${form.qty} MT`,
      freight: `₹${(form.freight.trim() ? Number(form.freight) : 0).toLocaleString("en-IN")}`,
      trucksAssigned: editingRow?.trucksAssigned ?? 0,
    };

    if (editingRow) {
      // No update endpoint exists yet for scheduled requests — apply the edit locally only.
      onSave(newRow);
      onClose();
      return;
    }

    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const defaultStatus =
        scheduleStatuses?.find((s) => s.statusName.toLowerCase() === "planned") ?? scheduleStatuses?.[0];

      const created = await scheduleContractTrucks({
        transporters: form.transporters.map(Number),
        contractId,
        scheduleDateTime: new Date(`${form.date}T${form.time}`).toISOString(),
        quantityMT: Number(form.qty),
        remainingQuantityMT: Number(form.qty),
        fromAddressId: Number(form.loadingAddress),
        toAddressId: Number(form.deliveryAddress),
        scheduleStatusId: defaultStatus?.scheduleStatusId ?? 1,
        remarks: form.remarks.trim(),
        freightPerMT: form.freight.trim() ? Number(form.freight) : 0,
        autoApprove: form.autoApprove,
        billChangeRequired: form.billChangeRequired,
        createdBy: currentUserId,
        createdOn: new Date().toISOString(),
      }).unwrap();

      if (!created.succeeded) {
        setSubmitError("The server rejected this scheduled request. Please try again.");
        return;
      }

      // Offer to notify the transporters first; the drawer closes once the dialog is done (or at once without permission).
      notify.ask(
        { eventCode: "DISPATCH_SCHEDULED", title: "Notify the transporters about this truck request", contractId, sourceEntityType: "DispatchSchedule", sourceEntityId: created.dispatchScheduleId },
        () => {
          onSave(newRow);
          onClose();
        },
      );
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to save the scheduled request. Please try again."));
    }
  };

  return createPortal(
    <>
      <div className={`schedule-request-drawer__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`schedule-request-drawer ${open ? "is-open" : ""}`}
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
            <XIcon aria-hidden />
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

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label">
                Select Loading Address <span className="schedule-request-drawer__required">*</span>
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
                <p className="schedule-request-drawer__error">{errors.loadingAddress}</p>
              )}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label">
                Select Delivery Address <span className="schedule-request-drawer__required">*</span>
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
                <p className="schedule-request-drawer__error">{errors.deliveryAddress}</p>
              )}
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label" htmlFor="schedule-date">
                Date <span className="schedule-request-drawer__required">*</span>
              </label>
              <DatePickerInput
                id="schedule-date"
                value={form.date}
                min={!editingRow ? todayDateValue() : undefined}
                onChange={(value) => setField("date", value)}
                ariaLabel="Date"
              />
              {errors.date && <p className="schedule-request-drawer__error">{errors.date}</p>}
            </div>

            <div className="schedule-request-drawer__field schedule-request-drawer__field--full">
              <label className="schedule-request-drawer__label">
                Select Transporter <span className="schedule-request-drawer__required">*</span>
              </label>
              <MultiSelect
                options={route.options}
                disabled={!route.enabled}
                value={form.transporters}
                onChange={(value) => setField("transporters", value)}
                placeholder={route.placeholder}
                ariaLabel="Select Transporter"
              />
              {errors.transporters && (
                <p className="schedule-request-drawer__error">{errors.transporters}</p>
              )}
              {route.emptyMessage && <p className="schedule-request-drawer__hint">{route.emptyMessage}</p>}
              <TransporterRouteHint
                selectedIds={form.transporters}
                transporters={transporters}
                sellerId={sellerId}
                buyerId={buyerId}
                loadingAddressId={form.loadingAddress}
                deliveryAddressId={form.deliveryAddress}
              />
            </div>

            <div className="schedule-request-drawer__field">
              <label className="schedule-request-drawer__label">
                Time <span className="schedule-request-drawer__required">*</span>
              </label>
              {/* Type HH:MM, or pick from the small Hours / Minutes panel; starts at the current time. */}
              <TimePickerInput
                className="schedule-request-drawer__control"
                value={form.time}
                min={!editingRow && form.date === todayDateValue() ? currentTimeValue() : undefined}
                onChange={(value) => setField("time", value)}
                ariaLabel="Time"
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
                Freight Charges
              </label>
              <input
                id="schedule-freight"
                type="text"
                inputMode="decimal"
                className="schedule-request-drawer__control"
                placeholder="Optional (e.g. ₹1800/MT) - empty means 0"
                value={form.freight}
                onChange={(event) => setField("freight", event.target.value)}
              />
              {errors.freight && <p className="schedule-request-drawer__error">{errors.freight}</p>}
            </div>

            <div className="schedule-request-drawer__field schedule-request-drawer__field--full">
              <label className="schedule-request-drawer__label" htmlFor="schedule-remarks">
                Remarks
              </label>
              <textarea
                id="schedule-remarks"
                className="schedule-request-drawer__textarea"
                placeholder="Optional remarks"
                value={form.remarks}
                onChange={(event) => setField("remarks", event.target.value)}
              />
            </div>

            {/* Auto Approve is a Super Admin tool: nobody else is told a freight can be approved automatically */}
            {isSuperAdmin() && (
            <div className="schedule-request-drawer__field schedule-request-drawer__field--checkbox">
              <label className="schedule-request-drawer__checkbox">
                <input
                  type="checkbox"
                  checked={form.autoApprove}
                  onChange={(event) => setField("autoApprove", event.target.checked)}
                />
                Auto Approve
              </label>
              {form.autoApprove && (
                <p className="schedule-request-drawer__hint">
                  The transporter must state its freight. If neither you nor FeedXchange approves or revises it within 10 minutes, it is approved
                  automatically, and everyone involved is notified.
                </p>
              )}
            </div>
            )}

            <div className="schedule-request-drawer__field schedule-request-drawer__field--checkbox">
              <label className="schedule-request-drawer__checkbox">
                <input
                  type="checkbox"
                  checked={form.billChangeRequired}
                  onChange={(event) => setField("billChangeRequired", event.target.checked)}
                />
                Bill Change Required
              </label>
              <p className="schedule-request-drawer__hint">
                Tick this when the goods must be re-billed (for example a re-assigned truck). Transporters see it on their request.
              </p>
            </div>
          </div>
          {submitError && <p className="schedule-request-drawer__error">{submitError}</p>}
        </div>

        <div className="schedule-request-drawer__footer">
          <button type="button" className="schedule-request-drawer__save" onClick={handleSave} disabled={saving}>
            <SaveIcon aria-hidden /> {saving ? "Saving…" : "Save & Send"}
          </button>
          <button type="button" className="schedule-request-drawer__cancel" onClick={onClose} disabled={saving}>
            <XIcon aria-hidden /> Cancel
          </button>
        </div>
      </div>
      {notify.element}
    </>,
    document.body,
  );
};

export default ScheduleRequestDrawer;
