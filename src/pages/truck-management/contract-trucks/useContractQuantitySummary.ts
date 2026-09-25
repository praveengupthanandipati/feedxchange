import { useMemo } from "react";
import {
  useGetAllOpenAndPendingContractsQuery,
  useGetContractByContractNumberQuery,
} from "../../../store/contractsApi";
import {
  useGetAllTrucksByContractQuery,
  useGetDispatchScheduleTransportersQuery,
} from "../../../store/contractTrucksApi";

export interface ContractQuantitySummary {
  /** The contract's total quantity in MT. */
  totalQty: number;
  /** MT already dispatched, as reported by the contract list. */
  dispatchedQty: number;
  /** MT a transporter has accepted and not since cancelled. */
  acceptedQty: number;
  /** MT covered by instant trucks, which are assigned without a schedule. */
  instantQty: number;
  /** Accepted plus instant — everything this contract's quantity is spoken for by. */
  committedQty: number;
  /** MT still free to schedule. */
  availableQty: number;
  isLoading: boolean;
}

/**
 * The contract's quantity position, derived from what transporters have accepted
 * rather than from the list endpoint's pendingQuantityMT — that figure does not move
 * when a schedule is accepted, so screens reading it let the same MT be committed to
 * more than one schedule.
 *
 * A quantity is spoken for once a transporter accepts it, and released again when it
 * is cancelled. Trucks added against a schedule sit inside a quantity already counted
 * here, so only instant trucks — which carry no schedule — are counted separately.
 */
export function useContractQuantitySummary(contractNumber: string): ContractQuantitySummary {
  const shouldFetch = Boolean(contractNumber);

  const { data: contract } = useGetContractByContractNumberQuery(contractNumber, {
    skip: !shouldFetch,
  });
  const { data: openAndPendingContracts } = useGetAllOpenAndPendingContractsQuery(undefined, {
    skip: !shouldFetch,
  });

  const contractId = contract?.id ?? 0;

  const { data: scheduleTransporters, isFetching: loadingSchedules } =
    useGetDispatchScheduleTransportersQuery({ contractId }, { skip: !contractId });
  const { data: trucks, isFetching: loadingTrucks } = useGetAllTrucksByContractQuery(
    { contractId },
    { skip: !contractId },
  );

  return useMemo(() => {
    const listRow = openAndPendingContracts?.find((row) => row.contractNumber === contractNumber);

    const totalQty = listRow?.totalQuantityMT ?? contract?.basicDetails?.quantity ?? 0;
    const dispatchedQty = listRow?.dispatchedQuantityMT ?? 0;

    const acceptedQty = (scheduleTransporters ?? []).reduce((sum, row) => {
      const net = (row.acceptedQuantityMT ?? 0) - (row.cancelledQuantityMT ?? 0);
      return sum + Math.max(net, 0);
    }, 0);

    const instantQty = (trucks ?? [])
      .filter((truck) => !truck.dispatchScheduleTransporterId)
      .reduce((sum, truck) => sum + (truck.quantityMT ?? 0), 0);

    const committedQty = acceptedQty + instantQty;

    return {
      totalQty,
      dispatchedQty,
      acceptedQty,
      instantQty,
      committedQty,
      availableQty: Math.max(totalQty - committedQty, 0),
      isLoading: shouldFetch && (loadingSchedules || loadingTrucks),
    };
  }, [
    openAndPendingContracts,
    contractNumber,
    contract,
    scheduleTransporters,
    trucks,
    shouldFetch,
    loadingSchedules,
    loadingTrucks,
  ]);
}
