import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { Driver } from "./drivers.types";

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

interface ColumnHandlers {
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export function buildDriverColumns({ onEdit, onDelete }: ColumnHandlers): TableColumn<Driver>[] {
  return [
    {
      key: "driverName",
      header: "Driver Name",
      sortable: true,
      render: (row) => (
        <Link to={`/truck-management/transporters/driver-master/${row.driverId}`} className="drivers__link">
          {row.driverName}
        </Link>
      ),
      exportValue: (row) => row.driverName,
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (row) => (
        <RowActionsMenu menuAlign="left" onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
      ),
    },
    {
      key: "mobileNumber",
      header: "Mobile Number",
      sortable: true,
      render: (row) => (
        <a href={`tel:${row.mobileNumber}`} className="drivers__link">
          {row.mobileNumber}
        </a>
      ),
      exportValue: (row) => row.mobileNumber,
    },
    {
      key: "licenseType",
      header: "License Type",
      sortable: true,
    },
    {
      key: "licenseNumber",
      header: "License Number",
      sortable: true,
    },
    {
      key: "licenseIssuedDate",
      header: "License Issue Dt",
      sortable: true,
      sortValue: (row) => row.licenseIssuedDate,
      render: (row) => formatDisplayDate(row.licenseIssuedDate),
      exportValue: (row) => formatDisplayDate(row.licenseIssuedDate),
    },
    {
      key: "bloodGroup",
      header: "Blood Group",
      sortable: true,
      align: "center",
      render: (row) => <span className="drivers__bloodgroup">{row.bloodGroup}</span>,
      exportValue: (row) => row.bloodGroup,
    },
    {
      key: "aadharNumber",
      header: "Aadhar Number",
      sortable: true,
    },
  ];
}
