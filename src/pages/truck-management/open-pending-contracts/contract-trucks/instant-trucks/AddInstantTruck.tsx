import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiFileText } from "react-icons/fi";
import SearchableSelect from "../../../../../components/dropdown/SearchableSelect";
import InfoPanel from "../InfoPanel";
import ContractSummaryPanel from "../../../contract-trucks/ContractSummaryPanel";
import PendingContractSelector from "../../../contract-trucks/PendingContractSelector";
import DriverSelectFields from "../../../contract-trucks/DriverSelectFields";
import AddressSelectField from "../../../contract-trucks/AddressSelectField";
import { timeOptions } from "../contractDispatch.options";
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import {
  useGetContractByContractNumberQuery,
  useGetTruckAssignmentTypesQuery,
} from "../../../../../store/contractsApi";
import { useGetTransporterProfileSummaryQuery } from "../../../../../store/transportersApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../../../store/trucksApi";
import { useAddContractTrucksMutation } from "../../../../../store/contractTrucksApi";
import "../../../assign-transports/Assigntransports.scss";
import "../../../assign-transports/instant-truck-assignment/InstantTruckAssignment.scss";
import "../contractDispatch.shared.scss";

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

function getCurrentDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

function getCurrentTimeValue(): string {
  return `${String(new Date().getHours()).padStart(2, "0")}:00`;
}

const DEFAULT_DISPATCH_STATUS_ID = 1;
const REDIRECT_DELAY_MS = 1500;

const AddInstantTruckForm = ({ contractNumber }: { contractNumber: string }) => {
  const navigate = useNavigate();
  const { data: contract } = useGetContractByContractNumberQuery(contractNumber);
  const { data: assignmentTypes } = useGetTruckAssignmentTypesQuery();

  const truckAssignmentTypeId = useMemo(() => {
    const instantType = (assignmentTypes ?? []).find(
      (type) => !type.truckAssignmentTypeName.toLowerCase().includes("sched"),
    );
    return instantType?.truckAssignmentTypeId ?? assignmentTypes?.[0]?.truckAssignmentTypeId ?? 0;
  }, [assignmentTypes]);

  const sellerId = contract?.sellerId ?? 0;
  const buyerId = contract?.buyerId ?? 0;
  const contractId = contract?.id ?? 0;

  const [form, setForm] = useState<FormState>({
    ...initialFormState,
    date: getCurrentDateValue(),
    time: getCurrentTimeValue(),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: transporters } = useGetTransporterProfileSummaryQuery();
  const { data: trucks } = useGetAllActiveTruckDetailsQuery();

  const [addContractTrucks, { isLoading: saving }] = useAddContractTrucksMutation();

  const transporterOptions = useMemo(
    () => (transporters ?? []).map((t) => ({ value: String(t.profileId), label: t.legalName })),
    [transporters],
  );
  const truckOptions = useMemo(
    () => (trucks ?? []).map((t) => ({ value: String(t.truckId), label: t.truckNumber })),
    [trucks],
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };


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

    if (form.trackingUrl.trim() && !/^https?:\/\/.+/i.test(form.trackingUrl.trim())) {
      nextErrors.trackingUrl = "Enter a valid URL starting with http:// or https://";
    }

    return nextErrors;
  };

  const handleReset = () => {
    setForm({ ...initialFormState, date: getCurrentDateValue(), time: getCurrentTimeValue() });
    setErrors({});
    setSubmitError("");
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError("");
    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    const assignedOn = new Date(`${form.date}T${form.time}`).toISOString();

    try {
      const succeeded = await addContractTrucks({
        contractId,
        truckAssignmentTypeId,
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

      setSaved(true);
      handleReset();
    } catch {
      setSubmitError("Failed to save the truck assignment. Please try again.");
    }
  };

  return (
    <div className="assign-truck-drawer__body">
      {saved && (
        <div className="dispatch-form-success">
          <FiCheckCircle aria-hidden />
          Truck assigned and shared with the seller for loading.
          <button type="button" onClick={() => setSaved(false)} aria-label="Dismiss">
            <FiX aria-hidden />
          </button>
        </div>
      )}

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
          {errors.transporter && <p className="assign-truck-drawer__error">{errors.transporter}</p>}
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
          value={{ driverId: form.driverName, driverPhone: form.driverPhone }}
          onChange={({ driverId, driverPhone }) =>
            setForm((prev) => ({ ...prev, driverName: driverId, driverPhone }))
          }
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
            onChange={(addressId) => setField("loadingAddress", addressId)}
            placeholder="Select Loading Address"
            ariaLabel="Select Loading Address"
            modalTitle="New Loading Address"
          />
          {errors.loadingAddress && <p className="assign-truck-drawer__error">{errors.loadingAddress}</p>}
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
        Click on &quot;Save &amp; Send.&quot; The truck details will then be shared with the seller for loading.
      </p>
      {submitError && <p className="assign-truck-drawer__error">{submitError}</p>}

      <div className="assign-truck-drawer__footer">
        <button type="button" className="assign-truck-drawer__save" onClick={handleSave} disabled={saving}>
          <FiSave aria-hidden /> {saving ? "Saving…" : "Save & Send"}
        </button>
        <button type="button" className="assign-truck-drawer__cancel" onClick={handleReset} disabled={saving}>
          <FiX aria-hidden /> Reset
        </button>
      </div>
    </div>
  );
};

const AddInstantTruck = () => {
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
            Add Instant Truck
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
          onChange={(value) =>
            // Merged, so a truck carried in by Reassign survives picking the contract.
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("contract", value);
              return next;
            })
          }
        />

        {contractNumber ? (
          <>
            <ContractSummaryPanel contractNumber={contractNumber} />
            <AddInstantTruckForm contractNumber={contractNumber} />
          </>
        ) : (
          <InfoPanel
            icon={FiFileText}
            title="No Contract Selected"
            description="Open a contract from the Open & Pending Contracts list and use Add Instant Truck there."
            action={{ label: "Go to Open & Pending Contracts", to: "/truck-management/open-pending-contracts" }}
          />
        )}
      </div>
    </div>
  );
};

export default AddInstantTruck;
