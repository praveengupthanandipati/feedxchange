import type { TableColumn } from "../../../../components/table/table.types";
import type { PromoterContractRow } from "./promoterDashboard.data";

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const StatusBadge = ({ status }: { status: PromoterContractRow["status"] }) => (
  <span className={`promoter-dashboard__status promoter-dashboard__status--${status.toLowerCase()}`}>
    {status}
  </span>
);

export function buildPromoterDashboardColumns(): TableColumn<PromoterContractRow>[] {
  return [
    { key: "contractNumber", header: "Contract Number", sortable: true },
    { key: "seller", header: "Seller", sortable: true },
    { key: "buyer", header: "Buyer", sortable: true },
    {
      key: "contractDate",
      header: "Contract Date",
      sortable: true,
      sortValue: (row) => row.contractDateValue,
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      sortable: true,
      align: "right",
      render: (row) => formatINR(row.totalAmount),
      sortValue: (row) => row.totalAmount,
      exportValue: (row) => formatINR(row.totalAmount),
    },
    {
      key: "commissionPercent",
      header: "Commission %",
      sortable: true,
      align: "right",
      render: (row) => `${row.commissionPercent}%`,
      sortValue: (row) => row.commissionPercent,
      exportValue: (row) => `${row.commissionPercent}%`,
    },
    {
      key: "commissionAmount",
      header: "Commission Amount",
      sortable: true,
      align: "right",
      render: (row) => formatINR(row.commissionAmount),
      sortValue: (row) => row.commissionAmount,
      exportValue: (row) => formatINR(row.commissionAmount),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
  ];
}
