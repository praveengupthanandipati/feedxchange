import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import RowActionsMenu from "../../../../../shared/components/table/RowActionsMenu";
import type { Driver } from "../../../../../core/store/driversApi";

function formatDisplayDate(value: string | null | undefined): string {
  // An empty date (null, or the API's 0001-01-01) is shown as empty, not as 01-01-1970.
  if (!value || value.startsWith("0001")) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

/**
 * The driver's licence number, or "" when none was given. A driver saved without one (e.g. from Save Invoice or Add
 * Instant Truck, where it is optional) gets a placeholder from the API – "NOLIC-<mobile>" – which is not shown.
 */
export function realLicenseNumber(value: string | null | undefined): string {
  const number = value?.trim() ?? "";
  return /^NOLIC-/i.test(number) ? "" : number;
}

/**
 * The licence issue date means something only when the driver has a licence on file (number and type). A driver
 * added from Add Instant Truck has just a name and mobile, and the API fills the date with a default: not shown.
 */
export function licenseIssuedDateOf(driver: Pick<Driver, "licenseNumber" | "licenseType" | "licenseIssuedDate">): string {
  if (!realLicenseNumber(driver.licenseNumber) || !driver.licenseType?.trim()) return "";
  return formatDisplayDate(driver.licenseIssuedDate);
}

interface ColumnHandlers {
  onEdit: (driver: Driver) => void;
  onView: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export function buildDriverColumns({ onEdit, onView, onDelete }: ColumnHandlers): TableColumn<Driver>[] {
  return [
    {
      key: "driverName",
      header: "Driver Name",
      sortable: true,
      render: (row) => (
        <Link to={`/admin/truck-management/transporters/driver-master/${row.driverId}`} className="drivers__link">
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
        <RowActionsMenu manageKeys={["drivers-master.manage"]} onView={() => onView(row)} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
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
      sortValue: (row) => realLicenseNumber(row.licenseNumber),
      render: (row) => realLicenseNumber(row.licenseNumber),
      exportValue: (row) => realLicenseNumber(row.licenseNumber),
    },
    {
      key: "licenseIssuedDate",
      header: "License Issue Dt",
      sortable: true,
      sortValue: (row) => (licenseIssuedDateOf(row) ? row.licenseIssuedDate : ""),
      render: (row) => licenseIssuedDateOf(row),
      exportValue: (row) => licenseIssuedDateOf(row),
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
