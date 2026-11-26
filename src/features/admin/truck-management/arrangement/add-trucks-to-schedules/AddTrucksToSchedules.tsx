import { useState } from "react";
import { CalendarIcon, LayersIcon, ListChecksIcon, TruckIcon, ZapIcon } from "../../../../../shared/components/icon";
import { useAuth } from "../../../../../core/auth/AuthContext";
import AcceptedSchedules from "../../assign-transports/transporter-requests/AcceptedSchedules";
import InstantTrucks from "../../assign-transports/transporter-requests/InstantTrucks";
import FilterDropdown, { type FilterOption } from "../schedules-management/FilterDropdown";
import { DATE_PRESETS, presetRange, shortDate, type DatePreset } from "../periods";
import "../../open-pending-contracts/contract-trucks/manage-schedule/ManageSchedule.scss";
import "../../assign-transports/transporter-requests/TransporterRequests.scss";
// the filter bar, pills and dropdown share the Schedules Management styles
import "../schedules-management/SchedulesManagement.scss";
import "./AddTrucksToSchedules.scss";

type Kind = "both" | "scheduled" | "instant";
const KINDS: { key: Kind; label: string; hint: string; icon: typeof TruckIcon }[] = [
  { key: "both", label: "Both", hint: "Scheduled and instant trucks", icon: LayersIcon },
  { key: "scheduled", label: "Scheduled", hint: "Trucks for the schedules you accepted", icon: ListChecksIcon },
  { key: "instant", label: "Instant", hint: "Trucks added straight to a contract", icon: ZapIcon },
];

type Period = "all" | DatePreset;
const PERIOD_OPTIONS: FilterOption<Period>[] = [
  { value: "all", label: "All dates", icon: LayersIcon },
  ...DATE_PRESETS.map((p) => ({ value: p.key as Period, label: p.label, icon: CalendarIcon })),
];

/**
 * Transporters > Schedules Management > Add Trucks to Schedules: the accepted schedules still short of trucks (add, edit and delete
 * trucks on them) and the instant trucks (edit until loaded). A transporter sees its own; FeedXchange staff see every transporter's.
 * Filters: which kind of truck, and a date period (schedule date for scheduled trucks, assigned date for instant trucks).
 */
const AddTrucksToSchedules = () => {
  const { roleName, businessUnitType } = useAuth();
  const isTransporterUser = `${roleName} ${businessUnitType}`.toLowerCase().includes("transport");

  const [kind, setKind] = useState<Kind>("both");
  // All dates by default: schedules still waiting for trucks can be from an earlier month.
  const [period, setPeriod] = useState<Period>("all");
  const [custom, setCustom] = useState(() => {
    const [from, to] = presetRange("thisMonth");
    return { from, to };
  });

  const [from, to] =
    period === "all" ? [undefined, undefined]
      : period === "custom" ? [custom.from || undefined, custom.to || undefined]
        : presetRange(period);
  const customInvalid = period === "custom" && !!custom.from && !!custom.to && custom.from > custom.to;
  const range = customInvalid ? { from: undefined, to: undefined } : { from, to };

  return (
    <div className="transporter-requests">
      <div className="transporter-requests__header">
        <h1>
          <TruckIcon aria-hidden /> Add Trucks to Schedules
        </h1>
        <p>
          {isTransporterUser
            ? "Add trucks to the schedules you accepted, and edit your instant trucks until they are loaded."
            : "Trucks transporters added to their accepted schedules, and their instant trucks."}
        </p>
      </div>

      <section className="schedules-mgmt__filters add-trucks-filters" aria-label="Filters">
        <fieldset className="schedules-mgmt__filter schedules-mgmt__filter--wide">
          <legend><TruckIcon aria-hidden /> Trucks</legend>
          <div className="schedules-mgmt__pills">
            {KINDS.map(({ key, label, hint, icon: Glyph }) => (
              <button key={key} type="button" title={hint} className={kind === key ? "is-active" : undefined} onClick={() => setKind(key)} aria-pressed={kind === key}>
                <Glyph aria-hidden /> {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="schedules-mgmt__filter schedules-mgmt__filter--dd">
          <span><CalendarIcon aria-hidden /> Date</span>
          <FilterDropdown label="Date" value={period} emptyValue="all" options={PERIOD_OPTIONS} onChange={setPeriod} />
        </div>

        {period === "custom" && (
          <div className="schedules-mgmt__dates add-trucks-filters__dates">
            <label>
              From <input type="date" value={custom.from} max={custom.to || undefined} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
            </label>
            <label>
              To <input type="date" value={custom.to} min={custom.from || undefined} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
            </label>
          </div>
        )}

        <p className="add-trucks-filters__note">
          {customInvalid
            ? "Pick a From date on or before the To date."
            : from && to
              ? <>{from === to ? <>On <b>{shortDate(from)}</b></> : <><b>{shortDate(from)}</b> – <b>{shortDate(to)}</b></>} · by schedule date (scheduled) and assigned date (instant)</>
              : "All dates"}
        </p>
      </section>

      {kind !== "instant" && <AcceptedSchedules showTransporter={!isTransporterUser} from={range.from} to={range.to} />}
      {kind !== "scheduled" && <InstantTrucks showTransporter={!isTransporterUser} from={range.from} to={range.to} />}
    </div>
  );
};

export default AddTrucksToSchedules;
