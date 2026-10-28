import { RefreshCwIcon } from "../../../../../shared/components/icon";
import RowActionsMenu from "../../../../../shared/components/table/RowActionsMenu";
import type { Registration, RegistrationStatus } from "../registrationDetails.data";
import { statusSlug } from "../registrationDetails.utils";

export const RegistrationStatusBadge = ({ status }: { status: RegistrationStatus }) => (
  <span className={`registrations__status registrations__status--${statusSlug(status)}`}>{status}</span>
);

/** Email and phone as tap-to-contact links. */
export const RegistrationEmail = ({ email }: { email: string }) => (
  <a className="registrations__link registrations__email" href={`mailto:${email}`}>
    {email}
  </a>
);

export const RegistrationPhone = ({ phone }: { phone: string }) => (
  <a className="registrations__link registrations__nowrap" href={`tel:${phone}`}>
    {phone}
  </a>
);

interface RegistrationActionsProps {
  registration: Registration;
  onUpdateStatus: (registration: Registration) => void;
  /** "left" opens rightwards (table, near its left edge); "right" opens leftwards (cards, at their right edge). */
  menuAlign?: "left" | "right";
}

/** Three-dots menu with the row's actions. */
export const RegistrationActions = ({ registration, onUpdateStatus, menuAlign = "left" }: RegistrationActionsProps) => (
  <RowActionsMenu menuAlign={menuAlign} actions={[{ key: "update-status", label: "Update Status", icon: RefreshCwIcon, onClick: () => onUpdateStatus(registration) }]} />
);
