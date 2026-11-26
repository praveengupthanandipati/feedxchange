import { useMemo } from "react";
import {
  useGetAllContractsQuery,
  useGetAllOpenAndPendingContractsQuery,
  type GetAllContractsRow,
  type OpenAndPendingContract,
} from "./contractsApi";

/** Open or Partially Dispatched, whatever the spacing / punctuation of the status text. */
const isOpenOrPartlyDispatched = (status: string | null | undefined) => {
  const key = (status ?? "").replace(/[^a-z]/gi, "").toLowerCase();
  return key === "open" || key === "partiallydispatched";
};

/** A GetAllContracts row in the shape of GetAllOpenAndPendingContracts (delivery schedule / payment terms unknown). */
const fromAllContracts = (row: GetAllContractsRow): OpenAndPendingContract => ({
  contractNumber: row.contractNumber,
  contractDate: row.contractDate,
  seller: row.sellerName,
  buyer: row.buyerName,
  sellerId: row.sellerId,
  buyerId: row.buyerId,
  pricePerMT: row.contractRate ?? 0,
  totalQuantityMT: row.quantity ?? 0,
  dispatchedQuantityMT: row.dispatchedQuantity ?? 0,
  pendingQuantityMT: row.pendingQuantity ?? 0,
  productId: row.productId,
  productName: row.productName ?? "",
  // Effective dates are no longer entered; the same date for both reads as "no period".
  effectiveFrom: row.contractDate,
  effectiveTo: row.contractDate,
  deliverySchedule: "",
  paymentTermName: "",
});

/**
 * The open contracts that can take trucks: GetAllOpenAndPendingContracts, plus the approved Open / Partially Dispatched
 * contracts it leaves out (on QA it returns no Partially Dispatched contracts at all), taken from GetAllContracts.
 * Same result shape as useGetAllOpenAndPendingContractsQuery, so it is a drop-in replacement.
 * TODO(backend): once GetAllOpenAndPendingContracts includes Partially Dispatched contracts the extra rows are not needed.
 */
export function useOpenAndPendingContracts(_arg?: void, options: { skip?: boolean } = {}) {
  const list = useGetAllOpenAndPendingContractsQuery(undefined, options);
  const all = useGetAllContractsQuery(undefined, options);

  const data = useMemo<OpenAndPendingContract[] | undefined>(() => {
    if (!list.data && !all.data) return undefined;
    const rows = [...(list.data ?? [])];
    const listed = new Set(rows.map((row) => row.contractNumber));
    for (const contract of all.data?.contracts ?? []) {
      if (listed.has(contract.contractNumber)) continue;
      if (contract.approvalStatus === false || contract.isActive === false) continue;
      if (!isOpenOrPartlyDispatched(contract.status)) continue;
      rows.push(fromAllContracts(contract));
    }
    return rows;
  }, [list.data, all.data]);

  return {
    data,
    // Loading until both have answered once; an error only when neither list could be read.
    isLoading: list.isLoading || all.isLoading,
    isFetching: list.isFetching || all.isFetching,
    isError: list.isError && all.isError,
    refetch: () => {
      void list.refetch();
      void all.refetch();
    },
  };
}
