import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { contractsApi, type PendingContractApiResponse } from "../../../core/store/contractsApi";
import type { AppDispatch } from "../../../core/store/store";
import { periodRanges, type PeriodKey } from "./homeDashboard.utils";

type Parties = { sellerId: number | null; buyerId: number | null };

/** Contract details fetched at a time. */
const BATCH = 6;

/**
 * The contracts list can come without buyer / seller ids, which the Customers count needs. The contract itself
 * (GetContractByContractNumber, as on the view and edit screens) has them, so they are fetched for the contracts of the
 * chosen period and the one it is compared with - only those missing an id, a few at a time, each one once (RTK Query
 * caches them). Returns the list with the ids filled in; until they arrive the count uses the buyer / seller names.
 */
export function useContractParties(contracts: PendingContractApiResponse[] | undefined, period: PeriodKey, now: number) {
  const dispatch = useDispatch<AppDispatch>();
  const [parties, setParties] = useState<Record<string, Parties>>({});

  const missing = useMemo(() => {
    if (!contracts) return [];
    const { current, previous } = periodRanges(period, now);
    return contracts
      .filter((contract) => {
        if (contract.buyerId != null && contract.sellerId != null) return false;
        if (!contract.contractNumber || contract.contractNumber in parties) return false;
        const time = new Date(contract.contractDate).getTime();
        return (time >= current.start && time < current.end) || (time >= previous.start && time < previous.end);
      })
      .map((contract) => contract.contractNumber);
  }, [contracts, period, now, parties]);

  useEffect(() => {
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < missing.length && !cancelled; i += BATCH) {
        const batch = missing.slice(i, i + BATCH);
        const found = await Promise.all(
          batch.map(async (contractNumber) => {
            const request = dispatch(contractsApi.endpoints.getContractByContractNumber.initiate(contractNumber));
            try {
              const detail = await request.unwrap();
              return [contractNumber, { sellerId: detail?.sellerId ?? null, buyerId: detail?.buyerId ?? null }] as const;
            } catch {
              // Not found or failed: remembered as "no ids", so it is not asked again; the name is used instead.
              return [contractNumber, { sellerId: null, buyerId: null }] as const;
            } finally {
              request.unsubscribe();
            }
          }),
        );
        if (!cancelled) setParties((prev) => ({ ...prev, ...Object.fromEntries(found) }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [missing, dispatch]);

  return useMemo(
    () =>
      contracts?.map((contract) => {
        const known = parties[contract.contractNumber];
        return known ? { ...contract, sellerId: contract.sellerId ?? known.sellerId, buyerId: contract.buyerId ?? known.buyerId } : contract;
      }),
    [contracts, parties],
  );
}
