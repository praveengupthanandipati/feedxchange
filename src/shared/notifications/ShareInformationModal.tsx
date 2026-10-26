import { usePermission } from "../../core/auth/AuthContext";
import NotifyModal from "./NotifyModal";
import { informationLabel } from "./informationTypes";

interface ShareInformationModalProps {
  open: boolean;
  onClose: () => void;
  /** BANK_DETAILS, SELLER_ADDRESS, BUYER_ADDRESS, CONTRACT_INFO, PENDING_INVOICES, CONTACT_DETAILS or GREETING. */
  informationType: string;
  /** Share from a contract (its buyer and seller are the people offered)... */
  contractNumber?: string;
  /** ...or from a profile page (that profile's users and contacts are offered; others can be typed in). */
  profileId?: number;
  title?: string;
}

/**
 * Sends one kind of information (bank name, an address, contact details, pending invoices...) to people the user picks, on the channels
 * and with the template the user picks. The server builds the content from an allow-list of fields per type, so for example Bank Details
 * never carries an account number or IFSC. Users without the notification permission see nothing.
 */
const ShareInformationModal = ({ open, onClose, informationType, contractNumber, profileId, title }: ShareInformationModalProps) => {
  const canSend = usePermission("notifications.send");
  if (!canSend) return null;
  return (
    <NotifyModal
      open={open}
      onClose={onClose}
      title={title ?? `Share ${informationLabel(informationType).toLowerCase()}`}
      eventCode="INFORMATION_SHARED"
      informationType={informationType}
      contractNumber={contractNumber}
      profileId={contractNumber ? undefined : profileId}
      sendLabel="Send"
    />
  );
};

export default ShareInformationModal;
