import { SquarePenIcon, Trash2Icon } from "../../../../../shared/components/icon";
import RowActionsMenu from "../../../../../shared/components/table/RowActionsMenu";
import type { Blog, BlogStatus } from "../blogs.data";

export interface BlogActionHandlers {
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export const BlogStatusBadge = ({ status }: { status: BlogStatus }) => <span className={`blogs__status blogs__status--${status.toLowerCase()}`}>{status}</span>;

/** Opens in a new tab; noopener keeps the blog site from controlling this page. */
export const BlogLink = ({ link }: { link: string }) =>
  link ? (
    <a className="blogs__link" href={link} target="_blank" rel="noopener noreferrer">
      {link}
    </a>
  ) : (
    <span className="blogs__muted">—</span>
  );

/** Three-dots menu with Edit and Delete. Opens rightwards, as it sits near the table's left edge. */
export const BlogActions = ({ blog, onEdit, onDelete }: BlogActionHandlers & { blog: Blog }) => (
  <RowActionsMenu
    menuAlign="left"
    actions={[
      { key: "edit", label: "Edit", icon: SquarePenIcon, onClick: () => onEdit(blog) },
      { key: "delete", label: "Delete", icon: Trash2Icon, onClick: () => onDelete(blog), danger: true, dividerBefore: true },
    ]}
  />
);
