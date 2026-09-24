import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiFileText } from "react-icons/fi";
import SearchableSelect from "../../../../../components/dropdown/SearchableSelect";
import InfoPanel from "../InfoPanel";
import ContractSummaryPanel from "../../../contract-trucks/ContractSummaryPanel";
import { timeOptions } from "../contractDispatch.options";
import {
  useGetContractByContractNumberQuery,
  useGetTruckAssignmentTypesQuery,
} from "../../../../../store/contractsApi";
import { useGetTransporterProfileSummaryQuery } from "../../../../../store/transportersApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../../../store/trucksApi";
import DriverSelectFields from "../../../contract-trucks/DriverSelectFields";
import {
  useGetScheduleTrucksDispatchDetailsQuery,
  useAddContractTrucksMutation,
  useGetAllTrucksByContractQuery,
} from "../../../../../store/contractTrucksApi";
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import { formatApiDateTime, splitApiDateTimeForForm } from "../../../../../utils/apiDateTime";
import "../../../assign-transports/Assigntransports.scss";
import "../../../assign-transports/instant-truck-assignment/InstantTruckAssignment.scss";
import "../contractDispatch.shared.scss";

interface FormState {
  truck: string;
  driverName: string;
  driverPhone: string;
  date: string;
  time: string;
  qty: string;
  freight: string;
  lrNumber: string;
  trackingUrl: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const DEFAULT_DISPATCH_STATUS_ID = 1;
const REDIRECT_DELAY_MS = 1500;

interface AddTruckToScheduleFormProps {
  contractNumber: string;
  transporterId: number;
  dispatchScheduleTransporterId: number;
}

const AddTruckToScheduleForm = ({
  contractNumber,
  transporterId,
  dispatchScheduleTransporterId,
}: AddTruckToScheduleFormProps) => {
  const navigate = useNavigate();
  const { data: contract } = useGetContractByContractNumberQuery(contractNumber);
  const contractId = contract?.id ?? 0;

  const { data: scheduleDetails, isFetching: loadingSchedule } = useGetScheduleTrucksDispatchDetailsQuery(
    { contractId, transporterId },
    { skip: !contractId || !transporterId },
  );
  const detail = scheduleDetails?.find(
    (item) => item.dispatchScheduleTransporterId === dispatchScheduleTransporterId,
  );

  // Trucks already added against this schedule request, so the form can offer what is left.
  const { data: contractTrucks } = useGetAllTrucksByContractQuery({ contractId }, { skip: !contractId });
  const assignedQty = useMemo(
    () =>
      (contractTrucks ?? [])
        .filter((truck) => truck.dispatchScheduleTransporterId === dispatchScheduleTransporterId)
        .reduce((total, truck) => total + truck.quantityMT, 0),
    [contractTrucks, dispatchScheduleTransporterId],
  );

  const { data: assignmentTypes } = useGetTruckAssignmentTypesQuery();
  const { data: transporters } = useGetTransporterProfileSummaryQuery();
  const { data: trucks } = useGetAllActiveTruckDetailsQuery();
  const [addContractTrucks, { isLoading: saving }] = useAddContractTrucksMutation();

  const scheduleTypeId = useMemo(
    () =>
      (assignmentTypes ?? []).find((type) => type.truckAssignmentTypeName.toLowerCase().includes("sched"))
        ?.truckAssignmentTypeId,
    [assignmentTypes],
  );

  const transporterName =
    transporters?.find((t) => t.profileId === transporterId)?.legalName ?? `Transporter #${transporterId}`;

  const truckOptions = useMemo(
    () => (trucks ?? []).map((t) => ({ value: String(t.truckId), label: t.truckNumber })),
    [trucks],
  );

  const [form, setForm] = useState<FormState>({
    truck: "",
    driverName: "",
    driverPhone: "",
    date: "",
    time: "",
    qty: "",
    freight: "",
    lrNumber: "",
    trackingUrl: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [saved, setSaved] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const acceptedQty = detail?.acceptedQuantityMT ?? detail?.offeredQuantityMT ?? 0;
  const remainingQty = Math.max(acceptedQty - (detail?.cancelledQuantityMT ?? 0) - assignedQty, 0);

  useEffect(() => {
    if (!detail || prefilled) return;
    const { date, time } = splitApiDateTimeForForm(detail.scheduleDateTime);
    setForm({
      truck: "",
      driverName: "",
      driverPhone: "",
      date,
      time,
      qty: String(remainingQty || acceptedQty),
      freight: String(detail.acceptedFreightPerMT ?? detail.offeredFreightPerMT),
      lrNumber: "",
      trackingUrl: "",
    });
    setPrefilled(true);
  }, [detail, prefilled, remainingQty, acceptedQty]);

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

    if (!form.truck) nextErrors.truck = "Select a truck.";
    if (!form.driverName.trim()) nextErrors.driverName = "Driver name is required.";

    if (!form.driverPhone.trim()) {
      nextErrors.driverPhone = "Driver contact number is required.";
    } else if (!/^\d{7,15}$/.test(form.driverPhone.trim())) {
      nextErrors.driverPhone = "Enter a valid phone number (digits only).";
    }

    if (!form.date) nextErrors.date = "Date is required.";
    if (!form.time) nextErrors.time = "Time is required.";

    if (!form.qty.trim()) {
      nextErrors.qty = "Truck quantity is required.";
    } else if (!/^\d+(\.\d+)?$/.test(form.qty.trim()) || Number(form.qty) <= 0) {
      nextErrors.qty = "Enter a valid quantity greater than 0.";
    } else if (remainingQty > 0 && Number(form.qty) > remainingQty) {
      // The API does not report what is left on a schedule, so it is checked here.
      nextErrors.qty = `Only ${remainingQty} MT of this accepted request is still unassigned.`;
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
    if (!detail || !scheduleTypeId) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError("");
    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    const assignedOn = new Date(`${form.date}T${form.time}`).toISOString();

    try {
      const succeeded = await addContractTrucks({
        contractId: detail.contractId,
        truckAssignmentTypeId: scheduleTypeId,
        dispatchScheduleTransporterId: detail.dispatchScheduleTransporterId,
        transporterProfileId: detail.transporterProfileId,
        truckId: Number(form.truck),
        driverId: Number(form.driverName),
        assignedOn,
        lrNumber: form.lrNumber.trim(),
        quantityMT: Number(form.qty),
        freightPerMT: Number(form.freight),
        fromAddressId: detail.fromAddressId,
        toAddressId: detail.toAddressId,
        dispatchStatusId: DEFAULT_DISPATCH_STATUS_ID,
        createdBy: currentUserId,
      }).unwrap();

      if (!succeeded) {
        setSubmitError("The server rejected adding this truck to the schedule. Please try again.");
        return;
      }

      setSaved(true);
    } catch {
      setSubmitError("Failed to add the truck to this schedule. Please try again.");
    }
  };

  if (loadingSchedule) {
    return <p className="assign-truck-drawer__notice">Loading schedule request…</p>;
  }

  if (!detail) {
    return (
      <InfoPanel
        icon={FiFileText}
        title="Schedule Request Not Found"
        description="This schedule request could not be found. Go back to Manage Schedule and open Add Truck from an accepted request."
        action={{
          label: "Go to Manage Schedule",
          to: `/truck-management/open-pending-contracts/manage-schedule?contract=${encodeURIComponent(contractNumber)}`,
        }}
      />
    );
  }

  return (
    <div className="assign-truck-drawer__body">
      {saved && (
        <div className="dispatch-form-success">
          <FiCheckCircle aria-hidden />
          Truck added to this schedule and shared with the seller for loading.
          <button type="button" onClick={() => setSaved(false)} aria-label="Dismiss">
            <FiX aria-hidden />
          </button>
        </div>
      )}

      <div className="assign-truck-drawer__bill-box">
        <span className="assign-truck-drawer__label">Schedule Request</span>
        <div className="assign-truck-drawer__grid">
          <div className="assign-truck-drawer__field">
            <span className="assign-truck-drawer__label">Transporter</span>
            <strong>{transporterName}</strong>
          </div>
          <div className="assign-truck-drawer__field">
            <span className="assign-truck-drawer__label">Scheduled For</span>
            <strong>{formatApiDateTime(detail.scheduleDateTime)}</strong>
          </div>
          <div className="assign-truck-drawer__field">
            <span className="assign-truck-drawer__label">Accepted Qty @ Freight</span>
            <strong>
              {detail.acceptedQuantityMT ?? detail.offeredQuantityMT} MT @ ₹
              {detail.acceptedFreightPerMT ?? detail.offeredFreightPerMT}/MT
            </strong>
          </div>
          <div className="assign-truck-drawer__field">
            <span className="assign-truck-drawer__label">Assigned / Remaining</span>
            <strong>
              {assignedQty} MT assigned · {remainingQty} MT remaining
            </strong>
          </div>
          <div className="assign-truck-drawer__field assign-truck-drawer__field--full">
            <span className="assign-truck-drawer__label">Loading → Delivery</span>
            <strong>
              {detail.loadingAddress} → {detail.deliveryAddress}
            </strong>
          </div>
        </div>
      </div>

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
          value={{ driverId: form.driverName, driverPhone: form.driverPhone }}
          onChange={({ driverId, driverPhone }) =>
            setForm((prev) => ({ ...prev, driverName: driverId, driverPhone }))
          }
          nameError={errors.driverName}
          phoneError={errors.driverPhone}
        />

        <div className="assign-truck-drawer__field">
          <label className="assign-truck-drawer__label" htmlFor="assign-date">
            Date <span className="assign-truck-drawer__required">*</span>
          </label>
          <input
            id="assign-date"
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
      </div>
    </div>
  );
};

const AddTruckToSchedule = () => {
  const [searchParams] = useSearchParams();
  const { selectedContract, setSelectedContract } = useSelectedContract();
  // Falls back to the contract picked earlier, so opening this screen from the menu
  // without one in the URL still shows data rather than an empty state.
  const contractNumber = searchParams.get("contract") ?? selectedContract ?? "";
  const transporterId = Number(searchParams.get("transporterId") ?? 0);
  const dispatchScheduleTransporterId = Number(searchParams.get("dispatchScheduleTransporterId") ?? 0);

  useEffect(() => {
    if (contractNumber) setSelectedContract(contractNumber);
  }, [contractNumber, setSelectedContract]);

  const hasFullContext = Boolean(contractNumber) && Boolean(transporterId) && Boolean(dispatchScheduleTransporterId);

  return (
    <div className="assign-transports-page">
      <div className="assign-transports-card">
        <div className="assign-transports-card__header">
          <h1>
            Add Truck to Schedule
            {contractNumber && (
              <span className="assign-transports-card__contract-no"> — Contract: {contractNumber}</span>
            )}
          </h1>
          <Link
            to={
              contractNumber
                ? `/truck-management/open-pending-contracts/manage-schedule?contract=${encodeURIComponent(contractNumber)}`
                : "/truck-management/open-pending-contracts"
            }
            className="assign-transports-card__back"
          >
            <FiArrowLeft aria-hidden /> Back to Manage Schedule
          </Link>
        </div>

        {hasFullContext ? (
          <>
            <ContractSummaryPanel contractNumber={contractNumber} />
            <AddTruckToScheduleForm
              contractNumber={contractNumber}
              transporterId={transporterId}
              dispatchScheduleTransporterId={dispatchScheduleTransporterId}
            />
          </>
        ) : (
          <InfoPanel
            icon={FiFileText}
            title="No Schedule Selected"
            description="Open Manage Schedule for a contract and use Add Truck on an accepted request."
            action={{ label: "Go to Open & Pending Contracts", to: "/truck-management/open-pending-contracts" }}
          />
        )}
      </div>
    </div>
  );
};

export default AddTruckToSchedule;
