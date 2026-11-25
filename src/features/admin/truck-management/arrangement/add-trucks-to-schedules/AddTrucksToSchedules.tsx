import { TruckIcon } from "../../../../../shared/components/icon";
import { useAuth } from "../../../../../core/auth/AuthContext";
import AcceptedSchedules from "../../assign-transports/transporter-requests/AcceptedSchedules";
import "../../open-pending-contracts/contract-trucks/manage-schedule/ManageSchedule.scss";
import "../../assign-transports/transporter-requests/TransporterRequests.scss";

/**
 * Transporters > Arrangement > Add Trucks to Schedules: the accepted schedules still short of trucks, with trucks added
 * against them. A transporter sees its own schedules; FeedXchange staff see every transporter's, with its name on each.
 */
const AddTrucksToSchedules = () => {
  const { roleName, businessUnitType } = useAuth();
  const isTransporterUser = `${roleName} ${businessUnitType}`.toLowerCase().includes("transport");

  return (
    <div className="transporter-requests">
      <div className="transporter-requests__header">
        <h1>
          <TruckIcon aria-hidden /> Add Trucks to Schedules
        </h1>
        <p>
          {isTransporterUser
            ? "Add trucks to the schedules you accepted."
            : "Add trucks to the schedules transporters accepted."}
        </p>
      </div>

      <AcceptedSchedules showTransporter={!isTransporterUser} />
    </div>
  );
};

export default AddTrucksToSchedules;
