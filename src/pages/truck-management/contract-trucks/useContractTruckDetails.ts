import { useMemo } from "react";
import { useGetContractByContractNumberQuery } from "../../../store/contractsApi";
import { useGetAllTrucksByContractQuery } from "../../../store/contractTrucksApi";
import { useGetAllActiveTruckDetailsQuery } from "../../../store/trucksApi";
import { useGetAllActiveDriversQuery } from "../../../store/driversApi";
import type { TruckByContract } from "../../../store/contractTrucksApi";
import { formatApiDateTime } from "../../../utils/apiDateTime";

export type ContractTruckStatus = string;

export interface ContractTruckDetail {
  contractTruckId: number;
  truckNumber: string;
  finalQty: string;
  status: ContractTruckStatus;
  dispatchStatusId: number;
  transporterName: string;
  transporterLocation: string;
  assignmentType: string;
  driverName: string;
  driverPhone: string;
  lrNumber: string;
  maxCapacity: string;
  startDateTime: string;
  startLocation: string;
  destination: string;
  raw: TruckByContract;
}

export function useContractTruckDetails(contractNumber: string, enabled: boolean) {
  const shouldFetch = enabled && Boolean(contractNumber);

  const { data: contract } = useGetContractByContractNumberQuery(contractNumber, {
    skip: !shouldFetch,
  });

  const contractId = contract?.id ?? 0;

  const { data: trucksByContract, isFetching: loadingTrucks } = useGetAllTrucksByContractQuery(
    { contractId },
    { skip: !shouldFetch || !contractId },
  );

  // GetAllTrucksByContract already resolves transporter/driver/assignment-type/status/address
  // labels server-side — these two are only for the handful of fields it doesn't return
  // (truck capacity, driver phone).
  const { data: trucks } = useGetAllActiveTruckDetailsQuery(undefined, { skip: !shouldFetch });
  const { data: drivers } = useGetAllActiveDriversQuery(undefined, { skip: !shouldFetch });

  const items: ContractTruckDetail[] = useMemo(() => {
    return (trucksByContract ?? []).map((truck) => {
      const truckDetail = trucks?.find((t) => t.truckId === truck.truckId);
      const driver = drivers?.find((d) => d.driverId === truck.driverId);

      return {
        contractTruckId: truck.contractDispatchId,
        truckNumber: truckDetail?.truckNumber ?? truck.registrationNumber,
        finalQty: `${truck.quantityMT} MT`,
        status: truck.displayName,
        dispatchStatusId: truck.dispatchStatusId,
        transporterName: truck.legalName,
        transporterLocation: "-",
        assignmentType: truck.truckAssignmentTypeName,
        driverName: truck.driverName,
        driverPhone: driver?.mobileNumber ?? "-",
        lrNumber: truck.lrNumber?.trim() || "-",
        maxCapacity: truckDetail ? `${truckDetail.capacity} ${truckDetail.capacityUnit}` : "-",
        startDateTime: formatApiDateTime(truck.assignedOn),
        startLocation: truck.loadingAddress,
        destination: truck.deliveryAddress,
        raw: truck,
      };
    });
  }, [trucksByContract, trucks, drivers]);

  return { trucks: items, isLoading: shouldFetch && loadingTrucks };
}
