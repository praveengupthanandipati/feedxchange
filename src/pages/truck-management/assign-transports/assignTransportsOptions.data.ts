// TODO: replace with real data once the truck-management API is wired up.

export const transporterOptions = [
  { value: "Jawahar Roadlines", label: "Jawahar Roadlines" },
  { value: "Sri Ganesh Transports", label: "Sri Ganesh Transports" },
  { value: "Rayapudi Logistics", label: "Rayapudi Logistics" },
];

export const truckOptions = [
  { value: "TS27C512", label: "TS27C512" },
  { value: "AP16TA9021", label: "AP16TA9021" },
  { value: "TS09FB3345", label: "TS09FB3345" },
  { value: "AP07TB6612", label: "AP07TB6612" },
];

// Maps a truck to its regularly assigned driver, used to auto-populate the
// Driver Name / Driver Phone fields when a truck is selected.
export const truckDriverMap: Record<string, { driverName: string; driverPhone: string }> = {
  TS27C512: { driverName: "Ramesh Kumar", driverPhone: "9848012345" },
  AP16TA9021: { driverName: "Suresh Babu", driverPhone: "9876543210" },
  TS09FB3345: { driverName: "Venkatesh Rao", driverPhone: "9963214870" },
  AP07TB6612: { driverName: "Krishna Murthy", driverPhone: "9700123456" },
};

export const driverNameOptions = Object.values(truckDriverMap).map(({ driverName }) => ({
  value: driverName,
  label: driverName,
}));

// Maps a driver name to their phone number, used to auto-populate the
// Driver Contact field when a driver is selected.
export const driverPhoneByName: Record<string, string> = Object.fromEntries(
  Object.values(truckDriverMap).map(({ driverName, driverPhone }) => [driverName, driverPhone]),
);

export const addressOptions = [
  { value: "Narapally", label: "Narapally" },
  { value: "Chowdariguda", label: "Chowdariguda" },
  { value: "Ammerpet", label: "Ammerpet" },
  { value: "Uppal", label: "Uppal" },
  {
    value: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
    label: "Lakshmi Poultry HO, Tanuku Main Road Tanuku Andhra Pradesh 534211",
  },
  {
    value: "15Kms from Vissannapeta, Chatrai, Andhra Pradesh",
    label: "15Kms from Vissannapeta, Chatrai, Andhra Pradesh",
  },
  {
    value: "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
    label: "6-114, Pedda Ramalayam, Kattubadi Vari Palem, Chilakaluripet, Palnadu, Andhra Pradesh 522616",
  },
];

export const timeOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  return { value, label: value };
});
