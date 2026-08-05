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
