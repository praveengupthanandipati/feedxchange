import { usePermission } from "../../core/auth/AuthContext";
import NotifyModal from "./NotifyModal";

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  /** Message a profile (business owner, transporter, promoter): its users and contacts are offered, and others can be typed in. */
  profileId?: number;
  /** ...or message one driver. */
  driverId?: number;
  title?: string;
}

/**
 * "Message" on a profile page and "Send Message" on a driver page: the sender writes the text, ticks who gets it and on which channel
 * (WhatsApp, SMS, Email, in-app), previews and sends. It goes through the notification service, so it is recorded in the notification history
 * and is protected against double sends. Users without the notification permission see nothing.
 */
const SendMessageModal = ({ open, onClose, profileId, driverId, title = "Send message" }: SendMessageModalProps) => {
  const canSend = usePermission("notifications.send");
  if (!canSend) return null;
  return (
    <NotifyModal
      open={open}
      onClose={onClose}
      title={title}
      eventCode="OPEN_TEXT_SHARED"
      profileId={driverId === undefined ? profileId : undefined}
      sourceEntityType={driverId === undefined ? undefined : "Driver"}
      sourceEntityId={driverId}
      sendLabel="Send message"
    />
  );
};

export default SendMessageModal;
