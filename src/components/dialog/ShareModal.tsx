import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSend, FiMessageCircle, FiMessageSquare, FiMail } from "react-icons/fi";
import type { IconType } from "react-icons";
import MultiSelect from "../dropdown/MultiSelect";
import type { SearchableSelectOption } from "../dropdown/SearchableSelect";
import "./ShareModal.scss";

export type ShareChannel = "whatsapp" | "sms" | "email";

export interface ShareModalPayload {
  recipients: string[];
  message: string;
  channel: ShareChannel;
}

interface ShareModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSend: (payload: ShareModalPayload) => void;
  /** When provided, recipients are chosen from this list via a multi-select. */
  recipientOptions?: SearchableSelectOption[];
  /** When provided instead of recipientOptions, the recipient is fixed and shown read-only. */
  fixedRecipientLabel?: string;
  messagePlaceholder?: string;
  confirmLabel?: string;
}

const CHANNELS: { value: ShareChannel; label: string; icon: IconType }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: FiMessageCircle },
  { value: "sms", label: "SMS", icon: FiMessageSquare },
  { value: "email", label: "Email", icon: FiMail },
];

const ShareModal = ({
  open,
  title,
  onClose,
  onSend,
  recipientOptions,
  fixedRecipientLabel,
  messagePlaceholder = "Enter your message...",
  confirmLabel,
}: ShareModalProps) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<ShareChannel | null>(null);

  useEffect(() => {
    if (!open) return;
    setRecipients([]);
    setMessage("");
    setChannel(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const hasRecipient = fixedRecipientLabel ? true : recipients.length > 0;
  const canSend = hasRecipient && channel !== null;

  const handleSend = () => {
    if (!canSend || !channel) return;
    onSend({ recipients: fixedRecipientLabel ? [fixedRecipientLabel] : recipients, message, channel });
    onClose();
  };

  return createPortal(
    <div className="share-modal__backdrop" onClick={onClose}>
      <div
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="share-modal__header">
          <h2 id="share-modal-title">{title}</h2>
          <button type="button" className="share-modal__close" onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
        </div>

        <div className="share-modal__body">
          {fixedRecipientLabel ? (
            <div className="share-modal__field">
              <span className="share-modal__label">Send To</span>
              <div className="share-modal__fixed-recipient">{fixedRecipientLabel}</div>
            </div>
          ) : (
            <div className="share-modal__field">
              <span className="share-modal__label">
                Select All Users <span className="share-modal__required">*</span>
              </span>
              <MultiSelect
                options={recipientOptions ?? []}
                value={recipients}
                onChange={setRecipients}
                placeholder="Choose users to send data..."
                ariaLabel="Select All Users"
              />
            </div>
          )}

          <div className="share-modal__field">
            <label className="share-modal__label" htmlFor="share-modal-message">
              Describe Message (Optional)
            </label>
            <textarea
              id="share-modal-message"
              className="share-modal__textarea"
              placeholder={messagePlaceholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <div className="share-modal__field">
            <span className="share-modal__label">
              Type of Message Send <span className="share-modal__required">*</span>
            </span>
            <div className="share-modal__channels">
              {CHANNELS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`share-modal__channel share-modal__channel--${option.value} ${
                    channel === option.value ? "is-active" : ""
                  }`}
                  onClick={() => setChannel(option.value)}
                >
                  <option.icon aria-hidden />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="share-modal__footer">
          <button
            type="button"
            className="business-owners-btn business-owners-btn--primary"
            onClick={handleSend}
            disabled={!canSend}
          >
            <FiSend aria-hidden /> {confirmLabel ?? "Send"}
          </button>
          <button type="button" className="business-owners-btn business-owners-btn--warning" onClick={onClose}>
            <FiX aria-hidden /> Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ShareModal;
