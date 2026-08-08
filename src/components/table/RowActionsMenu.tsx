import { useEffect, useRef, useState } from "react";
import { FiMoreVertical, FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import type { IconType } from "react-icons";
import "./RowActionsMenu.scss";

export interface RowAction {
  key: string;
  label: string;
  icon: IconType;
  onClick: () => void;
  danger?: boolean;
}

interface RowActionsMenuProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  /** Arbitrary menu items, for tables whose actions don't fit the Edit/View/Delete shape. Takes over the dropdown's contents; onEdit/onView/onDelete are ignored when this is set. */
  actions?: RowAction[];
  /** "inline" shows View/Edit/Delete as icon buttons revealed on row hover, instead of the "..." dropdown. */
  variant?: "menu" | "inline";
  /** Which edge the dropdown opens from. Default "right" (grows left) suits an Actions column placed last; use "left" (grows right) when Actions is the first column, so the menu doesn't overhang the table's left edge. */
  menuAlign?: "left" | "right";
  /** Overrides the trash icon for onDelete — for tables where the action isn't a literal delete (e.g. "release"). */
  deleteIcon?: IconType;
  /** Overrides the "Delete" label/tooltip for onDelete. */
  deleteLabel?: string;
}

const RowActionsMenu = ({
  onEdit,
  onView,
  onDelete,
  actions,
  variant = "menu",
  menuAlign = "right",
  deleteIcon: DeleteIcon = FiTrash2,
  deleteLabel = "Delete",
}: RowActionsMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (variant === "inline") {
  return (
    <div className="row-actions row-actions--inline">
      {onView && (
        <button
          type="button"
          className="row-actions__icon-btn"
          onClick={onView}
          aria-label="View"
          title="View"
        >
          <FiEye aria-hidden />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          className="row-actions__icon-btn"
          onClick={onEdit}
          aria-label="Edit"
          title="Edit"
        >
          <FiEdit2 aria-hidden />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          className="row-actions__icon-btn row-actions__icon-btn--danger"
          onClick={onDelete}
          aria-label={deleteLabel}
          title={deleteLabel}
        >
          <DeleteIcon aria-hidden />
        </button>
      )}
    </div>
  );
}

  return (
    <div className="row-actions" ref={menuRef}>
      <button
        type="button"
        className="row-actions__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Row actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <FiMoreVertical aria-hidden />
      </button>

      {open && (
        <ul className={`row-actions__menu ${menuAlign === "left" ? "row-actions__menu--align-left" : ""}`}>
          {actions ? (
            actions.map((action) => (
              <li key={action.key}>
                <button
                  type="button"
                  className={action.danger ? "row-actions__item--danger" : ""}
                  onClick={() => {
                    setOpen(false);
                    action.onClick();
                  }}
                >
                  <action.icon aria-hidden />
                  {action.label}
                </button>
              </li>
            ))
          ) : (
            <>
              {onEdit && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onEdit();
                    }}
                  >
                    <FiEdit2 aria-hidden />
                    Edit
                  </button>
                </li>
              )}
              {onView && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onView();
                    }}
                  >
                    <FiEye aria-hidden />
                    View
                  </button>
                </li>
              )}
              {onDelete && (
                <li>
                  <button
                    type="button"
                    className="row-actions__item--danger"
                    onClick={() => {
                      setOpen(false);
                      onDelete();
                    }}
                  >
                    <DeleteIcon aria-hidden />
                    {deleteLabel}
                  </button>
                </li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default RowActionsMenu;
