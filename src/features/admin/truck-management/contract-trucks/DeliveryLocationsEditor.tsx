import { MapPinIcon, PlusIcon, Trash2Icon } from "../../../../shared/components/icon";
import AddressSelectField from "./AddressSelectField";
import SearchableSelect from "../../../../shared/components/dropdown/SearchableSelect";
import type { DeliveryPointInput } from "../../../../core/store/contractTrucksApi";
import "./DeliveryLocationsEditor.scss";

/** An extra delivery location of a truck (stop 2, 3 ...). Stop 1 is always the truck's delivery address. */
export interface ExtraStop {
  id: string;
  addressId: string;
  qty: string;
}

/** A truck's delivery locations beyond the first: the extra stops, and the optional quantity for stop 1 (used only with extra stops). */
export interface DeliveryStopsState {
  firstQty: string;
  extra: ExtraStop[];
}

export const emptyDeliveryStops = (): DeliveryStopsState => ({ firstQty: "", extra: [] });

let stopSeq = 0;
const newStop = (): ExtraStop => ({ id: `stop-${Date.now()}-${stopSeq++}`, addressId: "", qty: "" });

const isQty = (value: string) => /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) > 0;
const fmt = (value: number) => `${Math.round(value * 1000) / 1000} MT`;

/**
 * What is wrong with a truck's delivery locations, or "" when they are fine (or when there is only the one delivery address).
 * Quantities are optional; the given ones must not exceed the truck's load and, when every stop has one, must add up to it.
 */
export const validateDeliveryStops = (
  stops: DeliveryStopsState,
  primaryAddressId: string,
  loadingAddressId: string,
  truckQty: string,
): string => {
  if (stops.extra.length === 0) return "";
  if (!primaryAddressId) return "Select the delivery address first; it is the first delivery location.";
  if (stops.extra.some((s) => !s.addressId)) return "Select an address for every extra delivery location, or remove it.";
  const all = [primaryAddressId, ...stops.extra.map((s) => s.addressId)];
  if (new Set(all).size !== all.length) return "The same address is listed more than once.";
  if (loadingAddressId && all.includes(loadingAddressId)) return "A delivery location cannot be the loading address.";
  const qtys = [stops.firstQty, ...stops.extra.map((s) => s.qty)];
  if (qtys.some((q) => q.trim() && !isQty(q))) return "A location's quantity must be a number greater than 0, or left blank.";
  const given = qtys.filter((q) => q.trim()).reduce((sum, q) => sum + Number(q), 0);
  const load = isQty(truckQty) ? Number(truckQty) : null;
  if (load !== null && given > load + 1e-9) return `The locations' quantities add up to ${fmt(given)}, more than the truck's ${fmt(load)}.`;
  if (load !== null && qtys.every((q) => q.trim()) && Math.abs(given - load) > 1e-9)
    return `The locations' quantities add up to ${fmt(given)}, but the truck carries ${fmt(load)}. Leave one blank or make them match.`;
  return "";
};

/** The deliveryPoints to send: undefined for a single delivery address (the request stays exactly as before). */
export const toDeliveryPoints = (stops: DeliveryStopsState, primaryAddressId: string): DeliveryPointInput[] | undefined => {
  if (stops.extra.length === 0) return undefined;
  const qty = (value: string) => (value.trim() ? Number(value) : undefined);
  return [
    { addressId: Number(primaryAddressId), quantityMT: qty(stops.firstQty) },
    ...stops.extra.map((s) => ({ addressId: Number(s.addressId), quantityMT: qty(s.qty) })),
  ];
};

interface DeliveryLocationsEditorProps {
  /** The buyer: extra locations are the buyer's addresses. */
  buyerId: number;
  /** Shown for stop 1 (the truck's delivery address), e.g. its name or "Select the delivery address above". */
  primaryLabel: string;
  value: DeliveryStopsState;
  onChange: (next: DeliveryStopsState) => void;
  error?: string;
  /** For unique field ids when the editor appears once per truck row. */
  idPrefix: string;
  /**
   * The addresses to pick from, when the user cannot list or add the buyer's addresses itself (a transporter). Left out, the buyer's
   * addresses are loaded and a new one can be added with "+".
   */
  addressOptions?: { value: string; label: string }[];
  /** Stop 1's address and the loading address: never offered again as another location. */
  primaryAddressId?: string;
  loadingAddressId?: string;
}

/**
 * Optional extra delivery locations for one truck. Collapsed to a single "Add delivery location" button until used, so a truck going to
 * one address works exactly as before. Each location's quantity is optional.
 */
const DeliveryLocationsEditor = ({
  buyerId,
  primaryLabel,
  value,
  onChange,
  error,
  idPrefix,
  addressOptions,
  primaryAddressId,
  loadingAddressId,
}: DeliveryLocationsEditorProps) => {
  // An address already used (stop 1, the loading address, another stop) is not offered again for a stop.
  const usedBy = (stopId: string) =>
    [primaryAddressId, loadingAddressId, ...value.extra.filter((s) => s.id !== stopId).map((s) => s.addressId)].filter((id): id is string => Boolean(id));
  const setExtra = (extra: ExtraStop[]) => onChange({ ...value, extra, firstQty: extra.length ? value.firstQty : "" });
  const updateStop = (id: string, patch: Partial<ExtraStop>) => setExtra(value.extra.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  if (value.extra.length === 0) {
    return (
      <div className="delivery-locations delivery-locations--collapsed">
        <button type="button" className="delivery-locations__add" onClick={() => setExtra([newStop()])}>
          <PlusIcon aria-hidden /> Add another delivery location
        </button>
      </div>
    );
  }

  return (
    <div className="delivery-locations" role="group" aria-label="Delivery locations">
      <div className="delivery-locations__head">
        <MapPinIcon aria-hidden /> <strong>Delivery locations</strong>
        <span className="delivery-locations__hint">in delivery order · quantity per location is optional</span>
      </div>

      <ol className="delivery-locations__list">
        <li className="delivery-locations__stop">
          <span className="delivery-locations__no">1</span>
          <span className="delivery-locations__primary" title={primaryLabel}>
            <span className="delivery-locations__primary-text">{primaryLabel}</span>
            <span className="delivery-locations__primary-tag">Delivery address</span>
          </span>
          <input
            id={`${idPrefix}-stop-1-qty`}
            type="text"
            inputMode="decimal"
            className="assign-truck-drawer__control delivery-locations__qty"
            placeholder="Qty (MT)"
            aria-label="Quantity for delivery location 1"
            value={value.firstQty}
            onChange={(event) => onChange({ ...value, firstQty: event.target.value })}
          />
          <span className="delivery-locations__spacer" aria-hidden />
        </li>
        {value.extra.map((stop, index) => (
          <li className="delivery-locations__stop" key={stop.id}>
            <span className="delivery-locations__no">{index + 2}</span>
            <div className="delivery-locations__address">
              {addressOptions ? (
                <SearchableSelect
                  options={addressOptions.filter((o) => o.value === stop.addressId || !usedBy(stop.id).includes(o.value))}
                  value={stop.addressId}
                  onChange={(addressId) => updateStop(stop.id, { addressId })}
                  placeholder="Select Delivery Address"
                  ariaLabel={`Delivery location ${index + 2}`}
                />
              ) : (
                <AddressSelectField
                  profileId={buyerId}
                  value={stop.addressId}
                  onChange={(addressId) => updateStop(stop.id, { addressId })}
                  placeholder="Select Delivery Address"
                  ariaLabel={`Delivery location ${index + 2}`}
                  modalTitle="New Delivery Address"
                  defaultUnloading
                  excludeIds={usedBy(stop.id)}
                />
              )}
            </div>
            <input
              id={`${idPrefix}-stop-${index + 2}-qty`}
              type="text"
              inputMode="decimal"
              className="assign-truck-drawer__control delivery-locations__qty"
              placeholder="Qty (MT)"
              aria-label={`Quantity for delivery location ${index + 2}`}
              value={stop.qty}
              onChange={(event) => updateStop(stop.id, { qty: event.target.value })}
            />
            <button
              type="button"
              className="delivery-locations__remove"
              onClick={() => setExtra(value.extra.filter((s) => s.id !== stop.id))}
              aria-label={`Remove delivery location ${index + 2}`}
              title="Remove this location"
            >
              <Trash2Icon aria-hidden />
            </button>
          </li>
        ))}
      </ol>

      <button type="button" className="delivery-locations__add" onClick={() => setExtra([...value.extra, newStop()])}>
        <PlusIcon aria-hidden /> Add another location
      </button>
      {error && <p className="assign-truck-drawer__error">{error}</p>}
    </div>
  );
};

export default DeliveryLocationsEditor;
