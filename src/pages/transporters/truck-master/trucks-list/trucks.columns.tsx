import { Link } from "react-router-dom";
import type { TableColumn } from "../../../../components/table/table.types";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { Truck } from "../../../../store/trucksApi";

interface ColumnHandlers {
  onEdit: (truck: Truck) => void;
  onView: (truck: Truck) => void;
  onDelete: (truck: Truck) => void;
}

export function buildTruckColumns({ onEdit, onView, onDelete }: ColumnHandlers): TableColumn<Truck>[] {
  return [
    {
      key: "truckNumber",
      header: "Truck Number",
      sortable: true,
      render: (row) => (
        <Link to={`/truck-management/transporters/truck-master/${row.truckId}`} className="trucks__link">
          {row.truckNumber}
        </Link>
      ),
      exportValue: (row) => row.truckNumber,
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (row) => (
        <RowActionsMenu onView={() => onView(row)} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
      ),
    },
    {
      key: "registrationNumber",
      header: "Reg. No",
      sortable: true,
    },
    {
      key: "truckType",
      header: "Truck Type",
      sortable: true,
    },
    {
      key: "make",
      header: "Make",
      sortable: true,
    },
    {
      key: "model",
      header: "Model",
      sortable: true,
    },
    {
      key: "manufactureYear",
      header: "Year of Model",
      sortable: true,
    },
    {
      key: "capacity",
      header: "Capacity",
      sortable: true,
      sortValue: (row) => row.capacity,
      render: (row) => `${row.capacity} ${row.capacityUnit}`,
      exportValue: (row) => `${row.capacity} ${row.capacityUnit}`,
    },
    {
      key: "fuelType",
      header: "Fuel Type",
      sortable: true,
    },
    {
      key: "ownershipType",
      header: "Ownership",
      sortable: true,
    },
  ];
}
