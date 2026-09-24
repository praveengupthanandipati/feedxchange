import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiFileText } from "react-icons/fi";
import SearchableSelect from "../../../../../components/dropdown/SearchableSelect";
import MultiSelect from "../../../../../components/dropdown/MultiSelect";
import InfoPanel from "../InfoPanel";
import ContractSummaryPanel from "../../../contract-trucks/ContractSummaryPanel";
import PendingContractSelector from "../../../contract-trucks/PendingContractSelector";
import AddressSelectField from "../../../contract-trucks/AddressSelectField";
import { timeOptions } from "../contractDispatch.options";
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import {
  useGetContractByContractNumberQuery,
  useGetScheduleStatusesQuery,
} from "../../../../../store/contractsApi";
import { useGetTransporterProfileSummaryQuery } from "../../../../../store/transportersApi";
import { useScheduleContractTrucksMutation } from "../../../../../store/contractTrucksApi";
import "../../../assign-transports/Assigntransports.scss";
import "../../../assign-transports/schedule-truck-assignment/ScheduleTruckAssignment.scss";
import "../contractDispatch.shared.scss";

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
  remarks: string;
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
  remarks: "",
  autoApprove: false,
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const REDIRECT_DELAY_MS = 1500;

const ScheduleDispatchForm = ({ contractNumber }: { contractNumber: string }) => {
  const navigate = useNavigate();
  const { data: contract } = useGetContractByContractNumberQuery(contractNumber);
  const { data: scheduleStatuses } = useGetScheduleStatusesQuery();

  const sellerId = contract?.sellerId ?? 0;
  const buyerId = contract?.buyerId ?? 0;
  const contractId = contract?.id ?? 0;

  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: transporters } = useGetTransporterProfileSummaryQuery();
  const [scheduleContractTrucks, { isLoading: saving }] = useScheduleContractTrucksMutation();

  const transporterOptions = useMemo(
    () => (transporters ?? []).map((t) => ({ value: String(t.profileId), label: t.legalName })),
    [transporters],
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const autoApproveDisabled = form.transporters.length > 1;

  // Give the success note a moment, then go back to Manage Schedule.
  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(
      () =>
        navigate(
          `/truck-management/open-pending-contracts/manage-schedule?contract=${encodeURIComponent(
            contractNumber,
          )}`,
        ),
      REDIRECT_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [saved, navigate, contractNumber]);


  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (form.transporters.length === 0) nextErrors.transporters = "Select at least one transporter.";
    if (!form.loadingAddress) nextErrors.loadingAddress = "Select a loading address.";
    if (!form.deliveryAddress) nextErrors.deliveryAddress = "Select a delivery address.";
    if (form.loadingAddress && form.deliveryAddress && form.loadingAddress === form.deliveryAddress) {
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

  const handleReset = () => {
    setForm(initialFormState);
    setErrors({});
    setSubmitError("");
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError("");

    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const defaultStatus =
        scheduleStatuses?.find((s) => s.statusName.toLowerCase() === "planned") ?? scheduleStatuses?.[0];

      const succeeded = await scheduleContractTrucks({
        transporters: form.transporters.map(Number),
        contractId,
        scheduleDateTime: new Date(`${form.date}T${form.time}`).toISOString(),
        quantityMT: Number(form.qty),
        remainingQuantityMT: Number(form.qty),
        fromAddressId: Number(form.loadingAddress),
        toAddressId: Number(form.deliveryAddress),
        scheduleStatusId: defaultStatus?.scheduleStatusId ?? 1,
        remarks: form.remarks.trim(),
        freightPerMT: Number(form.freight),
        createdBy: currentUserId,
        createdOn: new Date().toISOString(),
        autoApprove: form.autoApprove,
      }).unwrap();

      if (!succeeded) {
        setSubmitError("The server rejected this scheduled request. Please try again.");
        return;
      }

      setSaved(true);
      handleReset();
    } catch {
      setSubmitError("Failed to save the scheduled request. Please try again.");
    }
  };

  return (
    <div className="schedule-request-drawer__body">
      {saved && (
        <div className="dispatch-form-success">
          <FiCheckCircle aria-hidden />
          Schedule request created and sent to the selected transporters.
          <button type="button" onClick={() => setSaved(false)} aria-label="Dismiss">
            <FiX aria-hidden />
          </button>
        </div>
      )}

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
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                transporters: value,
                // Auto approve covers a single transporter only, so a second one
                // clears it rather than leaving a ticked box that cannot be unticked.
                autoApprove: value.length > 1 ? false : prev.autoApprove,
              }))
            }
            placeholder="Select Transporter(s)"
            ariaLabel="Select Transporter"
          />
          {errors.transporters && <p className="schedule-request-drawer__error">{errors.transporters}</p>}
        </div>

        <div className="schedule-request-drawer__field">
          <label className="schedule-request-drawer__label">
            Select Loading Address <span className="schedule-request-drawer__required">*</span>
          </label>
          <AddressSelectField
            profileId={sellerId}
            value={form.loadingAddress}
            onChange={(addressId) => setField("loadingAddress", addressId)}
            placeholder="Select Loading Address"
            ariaLabel="Select Loading Address"
            modalTitle="New Loading Address"
          />
          {errors.loadingAddress && <p className="schedule-request-drawer__error">{errors.loadingAddress}</p>}
        </div>

        <div className="schedule-request-drawer__field">
          <label className="schedule-request-drawer__label">
            Select Delivery Address <span className="schedule-request-drawer__required">*</span>
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

        <div className="schedule-request-drawer__field schedule-request-drawer__field--checkbox">
          <label className="schedule-request-drawer__checkbox">
            <input
              type="checkbox"
              checked={form.autoApprove}
              disabled={autoApproveDisabled}
              onChange={(event) => setField("autoApprove", event.target.checked)}
            />
            Auto Approve
          </label>
          {autoApproveDisabled && (
            <p className="schedule-request-drawer__hint">
              Auto approve is available only when a single transporter is selected.
            </p>
          )}
        </div>
      </div>
      {submitError && <p className="schedule-request-drawer__error">{submitError}</p>}

      <div className="schedule-request-drawer__footer">
        <button type="button" className="schedule-request-drawer__save" onClick={handleSave} disabled={saving}>
          <FiSave aria-hidden /> {saving ? "Saving…" : "Save & Send"}
        </button>
        <button type="button" className="schedule-request-drawer__cancel" onClick={handleReset} disabled={saving}>
          <FiX aria-hidden /> Reset
        </button>
      </div>
    </div>
  );
};

const ScheduleDispatch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedContract, setSelectedContract } = useSelectedContract();
  // Falls back to the contract picked earlier, so opening this screen from the menu
  // without one in the URL still shows data rather than an empty state.
  const contractNumber = searchParams.get("contract") ?? selectedContract ?? "";

  useEffect(() => {
    if (contractNumber) setSelectedContract(contractNumber);
  }, [contractNumber, setSelectedContract]);

  return (
    <div className="assign-transports-page">
      <div className="assign-transports-card">
        <div className="assign-transports-card__header">
          <h1>
            Schedule Dispatch
            {contractNumber && (
              <span className="assign-transports-card__contract-no"> — Contract: {contractNumber}</span>
            )}
          </h1>
          <Link to="/truck-management/open-pending-contracts" className="assign-transports-card__back">
            <FiArrowLeft aria-hidden /> Back to Open &amp; Pending Contracts
          </Link>
        </div>

        <PendingContractSelector
          value={contractNumber}
          onChange={(value) => setSearchParams({ contract: value })}
        />

        {contractNumber ? (
          <>
            <ContractSummaryPanel contractNumber={contractNumber} />
            <ScheduleDispatchForm contractNumber={contractNumber} />
          </>
        ) : (
          <InfoPanel
            icon={FiFileText}
            title="No Contract Selected"
            description="Open a contract from the Open & Pending Contracts list and use Schedule Dispatch there."
            action={{ label: "Go to Open & Pending Contracts", to: "/truck-management/open-pending-contracts" }}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleDispatch;
