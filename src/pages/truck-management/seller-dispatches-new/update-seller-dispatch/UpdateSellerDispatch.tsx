import { Link, useParams } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import DeliveryOrderInformation from "./DeliveryOrderInformation";
import DispatchInvoiceDetails from "./DispatchInvoiceDetails";
import ReassignTruck from "./ReassignTruck";
import RequestDetails from "./RequestDetails";
import TruckInformation from "./TruckInformation";
import { getSellerDispatchDetails } from "./updateSellerDispatch.data";
import "./UpdateSellerDispatch.scss";

const SELLER_DISPATCHES_PATH = "/truck-management/seller-dispatches-new";

const BackLink = () => (
  <Link to={SELLER_DISPATCHES_PATH} className="update-dispatch__back">
    <FiArrowLeft aria-hidden /> Back to Seller Dispatches
  </Link>
);

const UpdateSellerDispatch = () => {
  const { contractNo = "" } = useParams();
  const details = getSellerDispatchDetails(contractNo);

  if (!details) {
    return (
      <div className="update-dispatch">
        <div className="update-dispatch__not-found" role="alert">
          <FiAlertCircle aria-hidden />
          <p>Dispatch {contractNo} could not be found.</p>
          <BackLink />
        </div>
      </div>
    );
  }

  return (
    <div className="update-dispatch">
      <div className="update-dispatch__top">
        <BackLink />
      </div>
      <RequestDetails request={details.request} />
      <TruckInformation truck={details.truck} />
      {/* Keyed by contract so switching dispatches resets the card's edit state. */}
      <DeliveryOrderInformation key={contractNo} initialValue={details.deliveryOrder} />
      <ReassignTruck key={`reassign-${contractNo}`} />
      <DispatchInvoiceDetails key={`invoice-${contractNo}`} initialValue={details.invoice} />
    </div>
  );
};

export default UpdateSellerDispatch;
