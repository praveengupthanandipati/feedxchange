import { FiEdit, FiTrash2 } from "react-icons/fi";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { Banner } from "../banners.data";

export interface BannerActionHandlers {
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

/** Three-dots menu with Edit and Delete. Opens rightwards, as it sits near the table's left edge. */
const BannerActions = ({ banner, onEdit, onDelete }: BannerActionHandlers & { banner: Banner }) => (
  <RowActionsMenu
    menuAlign="left"
    actions={[
      { key: "edit", label: "Edit", icon: FiEdit, onClick: () => onEdit(banner) },
      { key: "delete", label: "Delete", icon: FiTrash2, onClick: () => onDelete(banner), danger: true, dividerBefore: true },
    ]}
  />
);

export default BannerActions;
