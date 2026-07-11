import { useEffect, useRef, useState } from "react";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./RowActionsMenu.scss";

interface RowActionsMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const RowActionsMenu = ({ onEdit, onDelete }: RowActionsMenuProps) => {
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
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
            >
              <FiEdit2 aria-hidden />
              Edit
            </button>
          </li>
          <li>
            <button
              type="button"
              className="row-actions__item--danger"
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
            >
              <FiTrash2 aria-hidden />
              Delete
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default RowActionsMenu;
