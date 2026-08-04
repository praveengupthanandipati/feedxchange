// TODO: replace with real data once the truck-management API is wired up.

export type ScheduleTruckStatus = "Pending" | "Assigned" | "Cancelled";

export interface ScheduleTruckRow {
  id: string;
  status: ScheduleTruckStatus;
  autoApprove: boolean;
  scheduleDateTime: string;
  scheduleValue: number;
  loadingAddress: string;
  deliveryAddress: string;
  qty: string;
  freight: string;
  trucksAssigned: number;
}

export const scheduleTruckRows: ScheduleTruckRow[] = [
  {
    id: "str-1",
    status: "Pending",
    autoApprove: false,
    scheduleDateTime: "17/5/2026 00:00",
    scheduleValue: new Date(2026, 4, 17).getTime(),
    loadingAddress: "Narapally",
    deliveryAddress: "Chowdariguda",
    qty: "20 MT",
    freight: "₹1,000",
    trucksAssigned: 0,
  },
  {
    id: "str-2",
    status: "Assigned",
    autoApprove: false,
    scheduleDateTime: "20/5/2026 00:00",
    scheduleValue: new Date(2026, 4, 20).getTime(),
    loadingAddress: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    deliveryAddress:
      "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    qty: "10 MT",
    freight: "₹1,000",
    trucksAssigned: 1,
  },
  {
    id: "str-3",
    status: "Pending",
    autoApprove: false,
    scheduleDateTime: "3/6/2026 00:00",
    scheduleValue: new Date(2026, 5, 3).getTime(),
    loadingAddress: "15Kms from Vissannapeta, Chatrai, Andhra Pradesh",
    deliveryAddress:
      "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    qty: "10 MT",
    freight: "₹1,500",
    trucksAssigned: 0,
  },
  {
    id: "str-4",
    status: "Pending",
    autoApprove: false,
    scheduleDateTime: "5/6/2026 00:00",
    scheduleValue: new Date(2026, 5, 5).getTime(),
    loadingAddress: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    deliveryAddress:
      "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    qty: "5 MT",
    freight: "₹100",
    trucksAssigned: 0,
  },
  {
    id: "str-5",
    status: "Pending",
    autoApprove: false,
    scheduleDateTime: "5/6/2026 00:00",
    scheduleValue: new Date(2026, 5, 5).getTime(),
    loadingAddress: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    deliveryAddress:
      "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    qty: "7 MT",
    freight: "₹100",
    trucksAssigned: 0,
  },
  {
    id: "str-6",
    status: "Pending",
    autoApprove: true,
    scheduleDateTime: "5/6/2026 00:00",
    scheduleValue: new Date(2026, 5, 5).getTime(),
    loadingAddress: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    deliveryAddress:
      "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    qty: "9 MT",
    freight: "₹100",
    trucksAssigned: 0,
  },
];
