import { useGetProfileAddressQuery } from "../../../../core/store/userProfilesCommonApi";
import type { Transporter } from "../../../../core/store/transportersApi";
import { ServingStateChips } from "./ServingLocations";
import "./ServingLocations.scss";

interface TransporterRouteHintProps {
  /** Ids of the transporters picked so far. */
  selectedIds: string[];
  transporters: Transporter[] | undefined;
  /** The seller (loading) and buyer (delivery) of the contract, and the addresses chosen on the form. */
  sellerId: number;
  buyerId: number;
  loadingAddressId: string;
  deliveryAddressId: string;
}

const sameState = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Under the transporter picker of a truck request: the picked transporters' Serving Locations, and a note when the loading or delivery
 * state of the chosen addresses is not one a transporter serves. Only advice - the request can still be sent.
 */
const TransporterRouteHint = ({ selectedIds, transporters, sellerId, buyerId, loadingAddressId, deliveryAddressId }: TransporterRouteHintProps) => {
  const { currentData: sellerAddresses } = useGetProfileAddressQuery(String(sellerId), { skip: !sellerId || !loadingAddressId });
  const { currentData: buyerAddresses } = useGetProfileAddressQuery(String(buyerId), { skip: !buyerId || !deliveryAddressId });

  const loadingState = sellerAddresses?.find((a) => String(a.addressId) === loadingAddressId)?.stateName?.trim() ?? "";
  const deliveryState = buyerAddresses?.find((a) => String(a.addressId) === deliveryAddressId)?.stateName?.trim() ?? "";

  const picked = (transporters ?? []).filter((t) => selectedIds.includes(String(t.profileId)));
  if (picked.length === 0) return null;

  return (
    <ul className="transporter-route-hint" aria-label="Serving locations of the selected transporters">
      {picked.map((t) => {
        const from = t.sourceStates ?? [];
        const to = t.destinationStates ?? [];
        const notes: string[] = [];
        if (from.length > 0 && loadingState && !from.some((s) => sameState(s, loadingState))) notes.push(`does not pick up from ${loadingState}`);
        if (to.length > 0 && deliveryState && !to.some((s) => sameState(s, deliveryState))) notes.push(`does not deliver to ${deliveryState}`);
        return (
          <li key={t.profileId} className="transporter-route-hint__item">
            <strong>{t.legalName}</strong>
            <ServingStateChips source={from} destination={to} compact />
            {notes.length > 0 && (
              <p className="transporter-route-hint__warn" role="note">
                Heads up: this transporter {notes.join(" and ")}.
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default TransporterRouteHint;
