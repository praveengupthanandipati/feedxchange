import { FiEdit, FiTrash2 } from "react-icons/fi";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { MasterUser, UserStatus } from "../users.data";

export interface UserActionHandlers {
  onEdit: (user: MasterUser) => void;
  onDelete: (user: MasterUser) => void;
}

export const UserStatusBadge = ({ status }: { status: UserStatus }) => <span className={`users__status users__status--${status.toLowerCase()}`}>{status}</span>;

/** Email and phone as tap-to-contact links. */
export const UserEmail = ({ email }: { email: string }) => (
  <a className="users__link users__email" href={`mailto:${email}`}>
    {email}
  </a>
);

export const UserPhone = ({ phone }: { phone: string }) => (
  <a className="users__link users__nowrap" href={`tel:${phone}`}>
    {phone}
  </a>
);

/** Three-dots menu with Edit and Delete. Opens rightwards in the table (near its left edge), leftwards on cards (at their right edge). */
export const UserActions = ({ user, onEdit, onDelete, menuAlign = "left" }: UserActionHandlers & { user: MasterUser; menuAlign?: "left" | "right" }) => (
  <RowActionsMenu
    menuAlign={menuAlign}
    actions={[
      { key: "edit", label: "Edit", icon: FiEdit, onClick: () => onEdit(user) },
      { key: "delete", label: "Delete", icon: FiTrash2, onClick: () => onDelete(user), danger: true, dividerBefore: true },
    ]}
  />
);
