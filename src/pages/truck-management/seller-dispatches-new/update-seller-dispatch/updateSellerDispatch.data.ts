import { sellerDispatchRows } from "../seller-dispatches/sellerDispatches.data";

export interface DispatchRequest {
  contractNo: string;
  seller: string;
  buyer: string;
  product: string;
  transporter: string;
  scheduleDateTime: string;
  loadingAddress: string;
  deliveryAddress: string;
  qty: string;
  freightCharges: string;
}

export interface DispatchTruck {
  truckNo: string;
  capacity: string;
  driverName: string;
  driverContact: string;
}

export interface SellerDispatchDetails {
  request: DispatchRequest;
  truck: DispatchTruck;
  deliveryOrder: DeliveryOrderInfo;
  invoice: DispatchInvoice;
}

/** Numbers are kept as strings so the edit form can hold partly-typed values. */
export interface DispatchInvoice {
  invoiceNo: string;
  /** yyyy-mm-dd */
  invoiceDate: string;
  invoiceQty: string;
  invoiceAmount: string;
  gstPercent: string;
  bags: string;
  toPayFreight: string;
  tcs: string;
  tds: string;
  fileName: string;
  /** Download link for the invoice copy; empty until the API provides one. */
  fileUrl: string;
}

export interface DeliveryOrderInfo {
  doNumber: string;
  /** yyyy-mm-dd */
  doDate: string;
  remarks: string;
}

// TODO: replace with the seller dispatch details API once it is available.
export function getSellerDispatchDetails(contractNo: string): SellerDispatchDetails | null {
  const row = sellerDispatchRows.find((item) => item.contractNo === contractNo);
  if (!row) return null;

  return {
    request: {
      contractNo: row.contractNo,
      seller: `${row.seller}, Mumbai`,
      buyer: row.buyer,
      product: row.product,
      transporter: "Jawahar Transporters, Hyderabad",
      scheduleDateTime: "25-04-2026 | 08:00 AM",
      loadingAddress: "KK Proteins Pvt Ltd, Adilabad",
      deliveryAddress: "Srinidhi Feeds, Gunnampalli",
      qty: "200 MT",
      freightCharges: "₹2,000 / MT",
    },
    truck: {
      truckNo: row.truckNo,
      capacity: `${row.qty} MT`,
      driverName: "Ravi Kumar",
      driverContact: "9848513941",
    },
    deliveryOrder: {
      doNumber: row.doNo.replace("DO-", "DO-2026-"),
      doDate: row.doDate,
      remarks: "Handle with care",
    },
    invoice: {
      invoiceNo: row.invNo.replace("INV-", "INV-2026-"),
      invoiceDate: row.invDate,
      invoiceQty: "200",
      invoiceAmount: "640000",
      gstPercent: "5",
      bags: "400",
      toPayFreight: "2000",
      tcs: "3200",
      tds: "1600",
      fileName: row.invNo ? `Invoice_${row.contractNo.replace(/-/g, "")}.pdf` : "",
      fileUrl: "",
    },
  };
}
