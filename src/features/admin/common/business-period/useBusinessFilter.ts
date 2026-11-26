import { useCallback, useEffect, useState } from "react";
import { useGetDashboardProfilesQuery, type DashboardProfileOption } from "../../../../core/store/businessDashboardApi";

/** "all" = every business the user may see; otherwise a profile id. */
export type BusinessFilterValue = "all" | `${number}`;

export interface BusinessFilter {
  /** FeedXchange staff: every business. A business owner: their own business and its linked businesses (the server decides). */
  options: DashboardProfileOption[];
  failed: boolean;
  value: string;
  setValue: (value: string) => void;
  /** A business owner's own business; "all" for FeedXchange staff. */
  defaultValue: string;
  selectedId: number | null;
  selectedName: string | null;
  /** Whether a contract with these parties belongs to the chosen business (always true for "All"). */
  matches: (sellerId: number | null | undefined, buyerId: number | null | undefined) => boolean;
  reset: () => void;
}

/**
 * The Business filter of contract screens. A business owner starts on their own business; FeedXchange staff start on "All".
 * The contract lists are already limited to the user's businesses by the API, so "All" never shows another company's data.
 */
export function useBusinessFilter(): BusinessFilter {
  const { data: options = [], isError: failed } = useGetDashboardProfilesQuery();
  const own = options.find((option) => option.isOwn);
  const defaultValue = own ? String(own.profileId) : "all";

  const [value, setValue] = useState("all");
  const [defaulted, setDefaulted] = useState(false);
  useEffect(() => {
    if (defaulted || options.length === 0) return;
    setValue(defaultValue);
    setDefaulted(true);
  }, [defaulted, options.length, defaultValue]);

  const selectedId = value === "all" ? null : Number(value);
  const selectedName = selectedId === null ? null : (options.find((option) => option.profileId === selectedId)?.name ?? null);

  const matches = useCallback(
    (sellerId: number | null | undefined, buyerId: number | null | undefined) =>
      selectedId === null || Number(sellerId) === selectedId || Number(buyerId) === selectedId,
    [selectedId],
  );

  const reset = useCallback(() => setValue(defaultValue), [defaultValue]);

  return { options, failed, value, setValue, defaultValue, selectedId, selectedName, matches, reset };
}
