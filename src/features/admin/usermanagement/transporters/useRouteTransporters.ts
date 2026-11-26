import { useMemo } from "react";
import { useGetProfileAddressQuery } from "../../../../core/store/userProfilesCommonApi";
import type { Transporter } from "../../../../core/store/transportersApi";

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** "Name - City, State (120 trips since 2025)": the parts a transporter has. */
export const transporterLabel = (t: Transporter) => {
  const place = [t.city || t.location, t.stateName].filter((part) => part && part.trim()).join(", ");
  const trips = t.completedTrips ?? 0;
  const history = `${trips} ${trips === 1 ? "trip" : "trips"}${t.memberSinceYear ? ` since ${t.memberSinceYear}` : ""}`;
  return `${t.legalName}${place ? ` - ${place}` : ""} (${history})`;
};

interface Args {
  transporters: Transporter[] | undefined;
  /** The contract's seller (loading) and buyer (delivery), and the addresses chosen on the form. */
  sellerId: number;
  buyerId: number;
  loadingAddressId: string;
  deliveryAddressId: string;
  /** Transporters already on the request being edited: always offered (and never dropped), even if they no longer match the route. */
  keepIds?: string[];
}

/**
 * Truck requests pick the route first (loading and delivery address); the transporters offered are then the ones that serve it:
 * their Source States include the loading address' state and their Destination States include the delivery address' state.
 * A side whose address has no state recorded is not filtered on.
 */
export function useRouteTransporters({ transporters, sellerId, buyerId, loadingAddressId, deliveryAddressId, keepIds }: Args) {
  const { currentData: sellerAddresses } = useGetProfileAddressQuery(String(sellerId), { skip: !sellerId || !loadingAddressId });
  const { currentData: buyerAddresses } = useGetProfileAddressQuery(String(buyerId), { skip: !buyerId || !deliveryAddressId });

  const loadingState = sellerAddresses?.find((a) => String(a.addressId) === loadingAddressId)?.stateName?.trim() ?? "";
  const deliveryState = buyerAddresses?.find((a) => String(a.addressId) === deliveryAddressId)?.stateName?.trim() ?? "";
  const routeChosen = Boolean(loadingAddressId && deliveryAddressId);
  // the address list has to have arrived before the states are known
  const statesReady = routeChosen && sellerAddresses !== undefined && buyerAddresses !== undefined;

  const eligible = useMemo(() => {
    if (!statesReady) return [];
    return (transporters ?? [])
      .filter(
        (t) =>
          (keepIds ?? []).includes(String(t.profileId)) ||
          ((!loadingState || (t.sourceStates ?? []).some((s) => same(s, loadingState))) &&
          (!deliveryState || (t.destinationStates ?? []).some((s) => same(s, deliveryState)))),
      )
      .sort((a, b) => a.legalName.localeCompare(b.legalName));
  }, [transporters, statesReady, loadingState, deliveryState, keepIds]);

  const eligibleIds = useMemo(() => new Set(eligible.map((t) => String(t.profileId))), [eligible]);
  const options = useMemo(() => eligible.map((t) => ({ value: String(t.profileId), label: transporterLabel(t) })), [eligible]);

  const route = loadingState && deliveryState ? `${loadingState} → ${deliveryState}` : loadingState || deliveryState;
  const placeholder = !routeChosen
    ? "Select the loading and delivery addresses first"
    : !statesReady
      ? "Loading transporters…"
      : options.length === 0
        ? "No transporter serves this route"
        : "Select Transporter(s)";

  const emptyMessage =
    statesReady && options.length === 0
      ? `No transporter serves ${route || "this route"}. Add the states under Serving Locations on a transporter's profile.`
      : null;

  return { options, eligibleIds, enabled: statesReady && options.length > 0, placeholder, emptyMessage, route, statesReady };
}
