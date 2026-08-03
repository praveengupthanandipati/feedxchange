// TODO: replace with real data once the truck-management API is wired up.

export type InstantTruckStatus = "Assigned" | "Pending" | "Cancelled";

export interface InstantTruckRow {
  id: string;
  status: InstantTruckStatus;
  scheduleDateTime: string;
  scheduleValue: number;
  transporterName: string;
  truckNo: string;
  driverName: string;
  driverPhone: string;
  loadingAddress: string;
  deliveryAddress: string;
  qty: string;
  freight: string;
  trackingUrl: string;
}

export const instantTruckRows: InstantTruckRow[] = [
  {
    id: "itr-1",
    status: "Assigned",
    scheduleDateTime: "17/5/2026 00:00",
    scheduleValue: new Date(2026, 4, 17).getTime(),
    transporterName: "Jawahar Roadlines",
    truckNo: "TS27C512",
    driverName: "Raju",
    driverPhone: "889795629",
    loadingAddress: "Narapally",
    deliveryAddress: "Chowdariguda",
    qty: "30 MT",
    freight: "₹3,000",
    trackingUrl: "-",
  },
  {
    id: "itr-2",
    status: "Assigned",
    scheduleDateTime: "18/5/2026 09:00",
    scheduleValue: new Date(2026, 4, 18, 9).getTime(),
    transporterName: "Sri Ganesh Transports",
    truckNo: "AP16TA9021",
    driverName: "Md. Rafi",
    driverPhone: "939104452",
    loadingAddress: "Ammerpet",
    deliveryAddress: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    qty: "25 MT",
    freight: "₹2,500",
    trackingUrl: "https://maps.google.com/track/ap16ta9021",
  },
  {
    id: "itr-3",
    status: "Pending",
    scheduleDateTime: "19/5/2026 14:00",
    scheduleValue: new Date(2026, 4, 19, 14).getTime(),
    transporterName: "Rayapudi Logistics",
    truckNo: "AP07TB6612",
    driverName: "Kishore Babu",
    driverPhone: "966661204",
    loadingAddress: "Uppal",
    deliveryAddress: "15Kms from Vissannapeta, Chatrai, Andhra Pradesh",
    qty: "18 MT",
    freight: "₹1,800",
    trackingUrl: "-",
  },
  {
    id: "itr-4",
    status: "Assigned",
    scheduleDateTime: "20/5/2026 07:30",
    scheduleValue: new Date(2026, 4, 20, 7, 30).getTime(),
    transporterName: "Jawahar Roadlines",
    truckNo: "TS09FB3345",
    driverName: "Suresh Reddy",
    driverPhone: "918213304",
    loadingAddress: "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    deliveryAddress: "Narapally",
    qty: "40 MT",
    freight: "₹4,200",
    trackingUrl: "https://maps.google.com/track/ts09fb3345",
  },
  {
    id: "itr-5",
    status: "Cancelled",
    scheduleDateTime: "21/5/2026 11:00",
    scheduleValue: new Date(2026, 4, 21, 11).getTime(),
    transporterName: "Sri Ganesh Transports",
    truckNo: "TS27C512",
    driverName: "Ravi Kumar",
    driverPhone: "901402233",
    loadingAddress: "Chowdariguda",
    deliveryAddress: "Uppal",
    qty: "22 MT",
    freight: "₹2,200",
    trackingUrl: "-",
  },
  {
    id: "itr-6",
    status: "Pending",
    scheduleDateTime: "22/5/2026 16:00",
    scheduleValue: new Date(2026, 4, 22, 16).getTime(),
    transporterName: "Rayapudi Logistics",
    truckNo: "AP16TA9021",
    driverName: "UJashuva",
    driverPhone: "879787890",
    loadingAddress: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    deliveryAddress: "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    qty: "15 MT",
    freight: "₹1,500",
    trackingUrl: "-",
  },
];
