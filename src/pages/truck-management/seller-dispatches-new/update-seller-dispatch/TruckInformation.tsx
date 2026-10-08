import { FiPhone, FiUser } from "react-icons/fi";
import { LuClipboardList, LuTruck } from "react-icons/lu";
import DetailSection from "./DetailSection";
import InfoTile from "./InfoTile";
import type { DispatchTruck } from "./updateSellerDispatch.data";

const TruckInformation = ({ truck }: { truck: DispatchTruck }) => (
  <DetailSection title="Truck Information">
    <dl className="info-grid info-grid--four">
      <InfoTile icon={LuTruck} label="Truck No" value={truck.truckNo} tone="navy" />
      <InfoTile icon={LuClipboardList} label="Truck Capacity" value={truck.capacity} tone="blue" />
      <InfoTile icon={FiUser} label="Driver Name" value={truck.driverName} tone="green" />
      <InfoTile icon={FiPhone} label="Driver Contact Number" value={truck.driverContact} tone="orange" phone />
    </dl>
  </DetailSection>
);

export default TruckInformation;
