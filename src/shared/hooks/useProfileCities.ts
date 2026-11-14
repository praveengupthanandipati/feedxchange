import { useCallback } from "react";
import { useGetProfileCitiesQuery } from "../../core/store/businessProfilesApi";

/** "Name, City" – or just the name when the city is not known (yet), or the name already ends with it. */
export function withCity(name: string, city: string | null | undefined): string {
  const place = city?.trim();
  if (!place || !name) return name;
  if (name.trim().toLowerCase().endsWith(place.toLowerCase())) return name;
  return `${name}, ${place}`;
}

/**
 * The city of each business (its primary address, else its first one), so sellers and buyers are shown as
 * "Name, City" on every screen. One shared, cached lookup for the whole app; labels show the plain name until the
 * cities arrive (or when the user may not read business profiles).
 *
 * `cityOf(id)` by profile id, `cityOfName(name)` by legal or trading name, `label(name, id?)` for the display text.
 */
export function useProfileCities(enabled = true) {
  const { data } = useGetProfileCitiesQuery(undefined, { skip: !enabled });

  const cityOf = useCallback((id: number | string | null | undefined) => data?.byId[Number(id)] ?? "", [data]);
  const cityOfName = useCallback(
    (name: string | null | undefined) => (name ? data?.byName[name.trim().toLowerCase()] ?? "" : ""),
    [data],
  );
  /** The display text for a seller / buyer: by id when known, else by name. */
  const label = useCallback(
    (name: string | null | undefined, id?: number | string | null) => {
      const text = name ?? "";
      const city = (id != null && id !== "" ? data?.byId[Number(id)] : "") || cityOfName(text);
      return withCity(text, city);
    },
    [data, cityOfName],
  );

  return { cityOf, cityOfName, label };
}
