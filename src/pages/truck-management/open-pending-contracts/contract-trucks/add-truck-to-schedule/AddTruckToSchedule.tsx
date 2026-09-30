import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../../components/dropdown/SearchableSelect";
import InfoPanel from "../InfoPanel";
import ContractSummaryPanel from "../../../contract-trucks/ContractSummaryPanel";
import {
  useGetContractByContractNumberQuery,
  useGetTruckAssignmentTypesQuery,
} from "../../../../../store/contractsApi";
import { useGetTransporterProfileSummaryQuery } from "../../../../../store/transportersApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../../../store/trucksApi";
import DriverSelectFields from "../../../contract-trucks/DriverSelectFields";
import {
  useGetScheduleTrucksDispatchDetailsQuery,
  useAddMultipleTrucksMutation,
  useGetAllTrucksByContractQuery,
} from "../../../../../store/contractTrucksApi";
import { useSelectedContract } from "../../../../../context/SelectedContractContext";
import { formatApiDateTime, parseApiDateTime } from "../../../../../utils/apiDateTime";
import "../../../assign-transports/Assigntransports.scss";
import "../../../assign-transports/instant-truck-assignment/InstantTruckAssignment.scss";
import "../contractDispatch.shared.scss";
import "./AddTruckToSchedule.scss";

interface TruckRow {
  id: string;
  truck: string;
  driverName: string;
  driverPhone: string;
  qty: string;
  lrNumber: string;
}

type TruckRowErrors = Partial<Record<Exclude<keyof TruckRow, "id">, string>>;

const DEFAULT_DISPATCH_STATUS_ID = 1;
const REDIRECT_DELAY_MS = 1500;

let truckRowSeq = 0;
const newTruckRow = (qty = ""): TruckRow => ({
  id: `truck-row-${Date.now()}-${truckRowSeq++}`,
  truck: "",
  driverName: "",
  driverPhone: "",
  qty,
  lrNumber: "",
});

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
  const [addMultipleTrucks, { isLoading: saving }] = useAddMultipleTrucksMutation();

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

  const [rows, setRows] = useState<TruckRow[]>(() => [newTruckRow()]);
  const [errors, setErrors] = useState<Record<string, TruckRowErrors>>({});
  const [totalError, setTotalError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saved, setSaved] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const acceptedQty = detail?.acceptedQuantityMT ?? detail?.offeredQuantityMT ?? 0;
  const remainingQty = Math.max(acceptedQty - (detail?.cancelledQuantityMT ?? 0) - assignedQty, 0);
  // Date, time and freight were settled on the schedule request and are not editable here.
  const freightPerMT = detail ? (detail.acceptedFreightPerMT ?? detail.offeredFreightPerMT) : 0;

  // The first truck starts with whatever is still unassigned, ready to be split across more trucks.
  useEffect(() => {
    if (!detail || prefilled) return;
    setRows([newTruckRow(String(remainingQty || acceptedQty))]);
    setPrefilled(true);
  }, [detail, prefilled, remainingQty, acceptedQty]);

  const updateRow = (id: string, patch: Partial<TruckRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };
  const addRow = () => setRows((prev) => [...prev, newTruckRow()]);
  const removeRow = (id: string) => setRows((prev) => prev.filter((row) => row.id !== id));

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



  const validate = (): { rowErrors: Record<string, TruckRowErrors>; total: string } => {
    const rowErrors: Record<string, TruckRowErrors> = {};
    let total = "";
    let totalQty = 0;

    rows.forEach((row) => {
      const rowError: TruckRowErrors = {};

      if (!row.truck) {
        rowError.truck = "Select a truck.";
      } else if (rows.some((other) => other.id !== row.id && other.truck === row.truck)) {
        rowError.truck = "This truck is already in another row.";
      }
      if (!row.driverName.trim()) rowError.driverName = "Driver name is required.";

      if (!row.driverPhone.trim()) {
        rowError.driverPhone = "Driver contact number is required.";
      } else if (!/^\d{7,15}$/.test(row.driverPhone.trim())) {
        rowError.driverPhone = "Enter a valid phone number (digits only).";
      }

      if (!row.qty.trim()) {
        rowError.qty = "Truck quantity is required.";
      } else if (!/^\d+(\.\d+)?$/.test(row.qty.trim()) || Number(row.qty) <= 0) {
        rowError.qty = "Enter a valid quantity greater than 0.";
      } else {
        totalQty += Number(row.qty);
      }

      if (Object.keys(rowError).length > 0) rowErrors[row.id] = rowError;
    });

    // The API does not report what is left on a schedule, so the trucks together are checked here.
    // A fully assigned request leaves 0, which must still block rather than skip.
    if (totalQty > remainingQty) {
      total = remainingQty
        ? `These trucks add up to ${totalQty} MT, but only ${remainingQty} MT of this accepted request is still unassigned.`
        : "This accepted request is already fully assigned.";
    }

    return { rowErrors, total };
  };

  const handleSave = async () => {
    if (!detail || !scheduleTypeId) return;

    const { rowErrors, total } = validate();
    setErrors(rowErrors);
    setTotalError(total);
    if (Object.keys(rowErrors).length > 0 || total) return;

    setSubmitError("");
    const currentUserId = Number(localStorage.getItem("userId")) || 0;
    // Every truck goes out at the time the schedule request was made for.
    const assignedOn = (parseApiDateTime(detail.scheduleDateTime) ?? new Date()).toISOString();

    try {
      const succeeded = await addMultipleTrucks({
        contractId: detail.contractId,
        truckAssignmentTypeId: scheduleTypeId,
        dispatchScheduleTransporterId: detail.dispatchScheduleTransporterId,
        transporterProfileId: detail.transporterProfileId,
        freightPerMT,
        fromAddressId: detail.fromAddressId,
        toAddressId: detail.toAddressId,
        dispatchStatusId: DEFAULT_DISPATCH_STATUS_ID,
        createdBy: currentUserId,
        createdOn: new Date().toISOString(),
        trucks: rows.map((row) => ({
          truckId: Number(row.truck),
          driverId: Number(row.driverName),
          assignedOn,
          lrNumber: row.lrNumber.trim(),
          quantityMT: Number(row.qty),
        })),
      }).unwrap();

      if (!succeeded) {
        setSubmitError("The server rejected adding these trucks to the schedule. Please try again.");
        return;
      }

      setSaved(true);
    } catch {
      setSubmitError("Failed to add the trucks to this schedule. Please try again.");
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
          {rows.length > 1 ? "Trucks added" : "Truck added"} to this schedule and shared with the seller for loading.
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

      <div className="add-truck-rows">
        {rows.map((row, index) => {
          const rowErrors = errors[row.id] ?? {};
          const takenTrucks = rows.filter((other) => other.id !== row.id).map((other) => other.truck);
          return (
            <div className="add-truck-rows__row" key={row.id}>
              <div className="add-truck-rows__fields">
              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label">
                  Select Truck <span className="assign-truck-drawer__required">*</span>
                </label>
                <SearchableSelect
                  options={truckOptions.filter((option) => !takenTrucks.includes(option.value))}
                  value={row.truck}
                  onChange={(value) => updateRow(row.id, { truck: value })}
                  placeholder="Select Truck"
                  ariaLabel="Select Truck"
                />
                {rowErrors.truck && <p className="assign-truck-drawer__error">{rowErrors.truck}</p>}
              </div>

              <DriverSelectFields
                value={{ driverId: row.driverName, driverPhone: row.driverPhone }}
                onChange={({ driverId, driverPhone }) =>
                  updateRow(row.id, { driverName: driverId, driverPhone })
                }
                nameError={rowErrors.driverName}
                phoneError={rowErrors.driverPhone}
              />

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label" htmlFor={`truck-qty-${row.id}`}>
                  Truck Qty <span className="assign-truck-drawer__required">*</span>
                </label>
                <input
                  id={`truck-qty-${row.id}`}
                  type="text"
                  inputMode="decimal"
                  className="assign-truck-drawer__control"
                  placeholder="Truck Qty (e.g. 20 MT)"
                  value={row.qty}
                  onChange={(event) => updateRow(row.id, { qty: event.target.value })}
                />
                {rowErrors.qty && <p className="assign-truck-drawer__error">{rowErrors.qty}</p>}
              </div>

              <div className="assign-truck-drawer__field">
                <label className="assign-truck-drawer__label" htmlFor={`lr-number-${row.id}`}>
                  LR Number
                </label>
                <input
                  id={`lr-number-${row.id}`}
                  type="text"
                  className="assign-truck-drawer__control"
                  placeholder="Lorry Receipt Number"
                  value={row.lrNumber}
                  onChange={(event) => updateRow(row.id, { lrNumber: event.target.value })}
                />
              </div>
              </div>

              <div className="add-truck-rows__actions">
                {/* Same height as a field label, so the buttons line up with the inputs. */}
                <span className="assign-truck-drawer__label add-truck-rows__actions-spacer" aria-hidden>
                  &nbsp;
                </span>
                <div className="add-truck-rows__buttons">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      className="add-truck-rows__delete"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove truck"
                    >
                      <FiTrash2 aria-hidden />
                    </button>
                  )}
                  {index === rows.length - 1 && (
                    <button type="button" className="add-truck-rows__add" onClick={addRow} aria-label="Add truck">
                      <FiPlus aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {totalError && <p className="assign-truck-drawer__error">{totalError}</p>}

      <p className="assign-truck-drawer__notice">
        Click on &quot;{rows.length > 1 ? "Add all trucks" : "Add truck"}.&quot; The truck details will then be shared
        with the seller for loading.
      </p>
      {submitError && <p className="assign-truck-drawer__error">{submitError}</p>}

      <div className="assign-truck-drawer__footer">
        <button type="button" className="assign-truck-drawer__save" onClick={handleSave} disabled={saving}>
          <FiSave aria-hidden />{" "}
          {saving ? "Saving…" : rows.length > 1 ? "Add all trucks" : "Add truck"}
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
