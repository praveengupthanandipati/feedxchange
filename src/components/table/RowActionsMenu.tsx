import { useEffect, useRef, useState } from "react";
import { FiMoreVertical, FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import "./RowActionsMenu.scss";

interface RowActionsMenuProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  /** "inline" shows View/Edit/Delete as icon buttons revealed on row hover, instead of the "..." dropdown. */
  variant?: "menu" | "inline";
}

const RowActionsMenu = ({ onEdit, onView, onDelete, variant = "menu" }: RowActionsMenuProps) => {
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
          aria-label="Delete"
          title="Delete"
        >
          <FiTrash2 aria-hidden />
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
        <ul className="row-actions__menu">
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
                <FiTrash2 aria-hidden />
                Delete
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default RowActionsMenu;
