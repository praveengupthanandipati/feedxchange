import { FiBox, FiCalendar, FiFileText, FiMapPin, FiUser, FiUserCheck } from "react-icons/fi";
import { FaRegMoneyBillAlt, FaStore } from "react-icons/fa";
import { LuClipboardList, LuTruck } from "react-icons/lu";
import DetailSection from "./DetailSection";
import InfoTile from "./InfoTile";
import type { DispatchRequest } from "./updateSellerDispatch.data";

const RequestDetails = ({ request }: { request: DispatchRequest }) => (
  <DetailSection title="Request Details">
    <dl className="info-grid info-grid--six">
      <InfoTile icon={FiFileText} label="Contract Number" value={request.contractNo} tone="navy" />
      <InfoTile icon={FaStore} label="Seller" value={request.seller} tone="blue" />
      <InfoTile icon={FiUser} label="Buyer" value={request.buyer} tone="green" />
      <InfoTile icon={FiBox} label="Product" value={request.product} tone="orange" />
      <InfoTile icon={LuTruck} label="Transporter" value={request.transporter} tone="red" />
      <InfoTile icon={FiCalendar} label="Schedule Date & Time" value={request.scheduleDateTime} tone="navy" />
      <InfoTile icon={FiMapPin} label="Loading Address" value={request.loadingAddress} tone="blue" />
      <InfoTile icon={FiUserCheck} label="Delivery Address" value={request.deliveryAddress} tone="green" />
      <InfoTile icon={LuClipboardList} label="Qty" value={request.qty} tone="orange" />
      <InfoTile icon={FaRegMoneyBillAlt} label="Freight Charges" value={request.freightCharges} tone="red" />
    </dl>
  </DetailSection>
);

export default RequestDetails;
