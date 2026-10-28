// TODO: replace with real data once the reports API is wired up.

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export interface ContractInvoiceRow {
  id: string;
  sNo: number;
  invoiceDate: string;
  invoiceNo: string;
  truckNo: string;
  bags: number;
  qty: string;
  freight: number;
  deduction: number;
  invoiceAmount: number;
  pendingAmount: number;
  totalPendingOfContract: number;
}

export interface ContractRow {
  id: string;
  sNo: number;
  contDate: string;
  contDateValue: number;
  contractNumber: string;
  sellerName: string;
  buyerName: string;
  product: string;
  qty: string;
  qtyValue: number;
  rate: number;
  gstPercent: number;
  netRate: number;
  balQty: string;
  packing: string;
  deliveryType: string;
  dueDays: number;
  contType: string;
  invoices: ContractInvoiceRow[];
  /** Extra fields shown in the Contract Number detail offcanvas — the seller and buyer sides can agree slightly different terms (e.g. due days) for the same contract. */
  deliverySchedule: string;
  deliveryAt: string;
  quality: string;
  buyerDueDays: number;
  remarks: string;
}

export const contractSummaryTotals = {
  lastYearTotal: 4602,
  currentYearTotal: 538,
  totalQuantity: 6985,
};

export const contractRows: ContractRow[] = [
  {
    id: "C1001",
    sNo: 1,
    contDate: "2026-04-01",
    contDateValue: toTimestamp("2026-04-01"),
    contractNumber: "C1001",
    sellerName: "Ankur Animal Feeds",
    buyerName: "Sai Feeds Pvt Ltd",
    product: "Soybean Meal",
    qty: "100 MT",
    qtyValue: 100,
    rate: 32000,
    gstPercent: 5,
    netRate: 33600,
    balQty: "40 MT",
    packing: "PP Bags",
    deliveryType: "F.O.R",
    dueDays: 15,
    contType: "Credit",
    deliverySchedule: "Ready Loading",
    deliveryAt: "Ahmedabad",
    quality: "16% Protein, 12% Fibre",
    buyerDueDays: 20,
    remarks: "Mulalanka - 2 trucks Kwality - 2 trucks",
    invoices: [
      {
        id: "C1001-INV-001",
        sNo: 1,
        invoiceDate: "2026-04-11",
        invoiceNo: "INV-001",
        truckNo: "AP16AB1234",
        bags: 200,
        qty: "10 MT",
        freight: 2000,
        deduction: 500,
        invoiceAmount: 320000,
        pendingAmount: 20000,
        totalPendingOfContract: 100000,
      },
      {
        id: "C1001-INV-002",
        sNo: 2,
        invoiceDate: "2026-04-12",
        invoiceNo: "INV-002",
        truckNo: "AP16AB5678",
        bags: 180,
        qty: "9 MT",
        freight: 1800,
        deduction: 400,
        invoiceAmount: 290000,
        pendingAmount: 15000,
        totalPendingOfContract: 85000,
      },
    ],
  },
  {
    id: "C1002",
    sNo: 2,
    contDate: "2026-04-02",
    contDateValue: toTimestamp("2026-04-02"),
    contractNumber: "C1002",
    sellerName: "Ankur Animal Feeds",
    buyerName: "Ankur Animal Feeds",
    product: "Corn",
    qty: "200 MT",
    qtyValue: 200,
    rate: 18500,
    gstPercent: 5,
    netRate: 19425,
    balQty: "80 MT",
    packing: "PP Bags",
    deliveryType: "Ex-Loading",
    dueDays: 10,
    contType: "100%",
    deliverySchedule: "Forward Contract",
    deliveryAt: "Ahmedabad",
    quality: "14% Protein, 10% Fibre",
    buyerDueDays: 10,
    remarks: "—",
    invoices: [
      {
        id: "C1002-INV-001",
        sNo: 1,
        invoiceDate: "2026-04-13",
        invoiceNo: "INV-003",
        truckNo: "TS09FB3345",
        bags: 400,
        qty: "20 MT",
        freight: 3200,
        deduction: 600,
        invoiceAmount: 370000,
        pendingAmount: 40000,
        totalPendingOfContract: 160000,
      },
    ],
  },
  {
    id: "C1003",
    sNo: 3,
    contDate: "2026-04-03",
    contDateValue: toTimestamp("2026-04-03"),
    contractNumber: "C1003",
    sellerName: "Ankur Animal Feeds",
    buyerName: "Blue Aqua Farms",
    product: "Wheat Bran",
    qty: "150 MT",
    qtyValue: 150,
    rate: 14000,
    gstPercent: 0,
    netRate: 14000,
    balQty: "50 MT",
    packing: "PP Bags",
    deliveryType: "F.O.R",
    dueDays: 20,
    contType: "Credit",
    deliverySchedule: "Ready Loading",
    deliveryAt: "Ahmedabad",
    quality: "12% Protein, 8% Fibre",
    buyerDueDays: 25,
    remarks: "—",
    invoices: [
      {
        id: "C1003-INV-001",
        sNo: 1,
        invoiceDate: "2026-04-14",
        invoiceNo: "INV-004",
        truckNo: "AP07TB6612",
        bags: 300,
        qty: "15 MT",
        freight: 2400,
        deduction: 350,
        invoiceAmount: 210000,
        pendingAmount: 30000,
        totalPendingOfContract: 120000,
      },
    ],
  },
  {
    id: "C1004",
    sNo: 4,
    contDate: "2026-04-04",
    contDateValue: toTimestamp("2026-04-04"),
    contractNumber: "C1004",
    sellerName: "Ankur Animal Feeds",
    buyerName: "Green Valley Dairy",
    product: "Rice Bran",
    qty: "100 MT",
    qtyValue: 100,
    rate: 16800,
    gstPercent: 5,
    netRate: 17640,
    balQty: "30 MT",
    packing: "PP Bags",
    deliveryType: "Ex-Loading",
    dueDays: 10,
    contType: "100%",
    deliverySchedule: "Forward Contract",
    deliveryAt: "Ahmedabad",
    quality: "13% Protein, 9% Fibre",
    buyerDueDays: 10,
    remarks: "—",
    invoices: [
      {
        id: "C1004-INV-001",
        sNo: 1,
        invoiceDate: "2026-04-15",
        invoiceNo: "INV-005",
        truckNo: "AP16TA9021",
        bags: 250,
        qty: "12.5 MT",
        freight: 2100,
        deduction: 300,
        invoiceAmount: 190000,
        pendingAmount: 25000,
        totalPendingOfContract: 105000,
      },
    ],
  },
];
