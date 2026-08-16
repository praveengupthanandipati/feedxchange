// TODO: replace with real data once the reports API is wired up.

export type PartyRole = "Seller" | "Buyer";

export const partyRoleOptions: { value: PartyRole; label: string }[] = [
  { value: "Seller", label: "Seller" },
  { value: "Buyer", label: "Buyer" },
];

export const businessOptions = [
  { value: "ankur-animal-feeds", label: "Ankur Animal Feeds - Ahmedabad" },
  { value: "sai-feeds", label: "Sai Feeds Pvt Ltd - Mumbai" },
  { value: "chatrai-lakshmi-poultry", label: "Chatrai - Lakshmi Poultry" },
  { value: "green-valley-dairy", label: "Green Valley Dairy - Pune" },
];

export const accountTabs = [
  { id: "contracts", label: "Contracts" },
  { id: "pending-supplies", label: "Pending Supplies" },
  { id: "summary", label: "Summary" },
  { id: "pending-payments", label: "Pending Payments" },
  { id: "over-due-pay", label: "Over Due Pay" },
  { id: "un-account-bal", label: "Un Account Bal" },
  { id: "avg-payments", label: "Avg Payments" },
  { id: "payments", label: "Payments" },
  { id: "profile", label: "Profile" },
  { id: "contact-info", label: "Contact Info" },
] as const;

export type AccountTabId = (typeof accountTabs)[number]["id"];

export interface OverDuePayRow {
  id: string;
  invoiceDate: string;
  invoiceDateValue: number;
  invoiceNum: string;
  buyerName: string;
  invoiceQty: number;
  freight: number;
  invoiceAmount: number;
  paid: number;
  pendingAmount: number;
  sellerwiseTotalDue: number;
  dueDate: string;
  dueDateValue: number;
  overDueDays: number;
}

function toTimestamp(isoDate: string): number {
  return new Date(isoDate).getTime();
}

export function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

const rawRows = [
  { invoiceDate: "2026-04-01", invoiceNum: "INV1001", buyerName: "Sai Feeds Pvt Ltd", invoiceQty: 30.63, freight: 12000, invoiceAmount: 500000, paid: 414410, pendingAmount: 85590, sellerwiseTotalDue: 200000, dueDate: "2026-04-15", overDueDays: 5 },
  { invoiceDate: "2026-04-02", invoiceNum: "INV1002", buyerName: "Ankur Animal Feeds", invoiceQty: 25, freight: 10000, invoiceAmount: 400000, paid: 200000, pendingAmount: 200000, sellerwiseTotalDue: 150000, dueDate: "2026-04-16", overDueDays: 4 },
  { invoiceDate: "2026-04-03", invoiceNum: "INV1003", buyerName: "Blue Aqua Farms", invoiceQty: 40.12, freight: 15000, invoiceAmount: 600000, paid: 300000, pendingAmount: 300000, sellerwiseTotalDue: 250000, dueDate: "2026-04-17", overDueDays: 3 },
  { invoiceDate: "2026-04-04", invoiceNum: "INV1004", buyerName: "Green Valley Dairy", invoiceQty: 20, freight: 8000, invoiceAmount: 300000, paid: 100000, pendingAmount: 200000, sellerwiseTotalDue: 100000, dueDate: "2026-04-18", overDueDays: 2 },
  { invoiceDate: "2026-04-05", invoiceNum: "INV1005", buyerName: "Shree Animal Nutrition", invoiceQty: 35.5, freight: 13000, invoiceAmount: 550000, paid: 250000, pendingAmount: 300000, sellerwiseTotalDue: 180000, dueDate: "2026-04-19", overDueDays: 1 },
  { invoiceDate: "2026-04-06", invoiceNum: "INV1006", buyerName: "Farm Fresh Feeds", invoiceQty: 28.75, freight: 11000, invoiceAmount: 420000, paid: 150000, pendingAmount: 270000, sellerwiseTotalDue: 120000, dueDate: "2026-04-20", overDueDays: 0 },
  { invoiceDate: "2026-04-07", invoiceNum: "INV1007", buyerName: "FairSquare Trading Pvt Ltd", invoiceQty: 32.1, freight: 12500, invoiceAmount: 480000, paid: 280000, pendingAmount: 200000, sellerwiseTotalDue: 160000, dueDate: "2026-04-21", overDueDays: 0 },
  { invoiceDate: "2026-04-08", invoiceNum: "INV1008", buyerName: "Srinivasa Traders", invoiceQty: 22.9, freight: 9000, invoiceAmount: 350000, paid: 100000, pendingAmount: 250000, sellerwiseTotalDue: 110000, dueDate: "2026-04-22", overDueDays: 0 },
  { invoiceDate: "2026-04-09", invoiceNum: "INV1009", buyerName: "AgroStar Enterprises", invoiceQty: 38, freight: 14000, invoiceAmount: 570000, paid: 350000, pendingAmount: 220000, sellerwiseTotalDue: 190000, dueDate: "2026-04-23", overDueDays: 0 },
  { invoiceDate: "2026-04-10", invoiceNum: "INV1010", buyerName: "Sunrise Agro Solutions", invoiceQty: 27.45, freight: 10500, invoiceAmount: 410000, paid: 210000, pendingAmount: 200000, sellerwiseTotalDue: 130000, dueDate: "2026-04-24", overDueDays: 0 },
];

export const overDuePayRows: OverDuePayRow[] = rawRows.map((row) => ({
  id: row.invoiceNum,
  invoiceDate: row.invoiceDate,
  invoiceDateValue: toTimestamp(row.invoiceDate),
  invoiceNum: row.invoiceNum,
  buyerName: row.buyerName,
  invoiceQty: row.invoiceQty,
  freight: row.freight,
  invoiceAmount: row.invoiceAmount,
  paid: row.paid,
  pendingAmount: row.pendingAmount,
  sellerwiseTotalDue: row.sellerwiseTotalDue,
  dueDate: row.dueDate,
  dueDateValue: toTimestamp(row.dueDate),
  overDueDays: row.overDueDays,
}));

// ============================================================
// Contracts tab
// ============================================================
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
