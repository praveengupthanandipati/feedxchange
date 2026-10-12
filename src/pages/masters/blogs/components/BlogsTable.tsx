import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { Blog } from "../blogs.data";
import { BlogActions, BlogLink, BlogStatusBadge, type BlogActionHandlers } from "./BlogBits";

export interface BlogListProps extends BlogActionHandlers {
  rows: Blog[];
  emptyMessage: string;
}

/** Laptop and desktop view. */
const BlogsTable = ({ rows, emptyMessage, onEdit, onDelete }: BlogListProps) => {
  const columns: TableColumn<Blog>[] = [
    {
      key: "image",
      header: "Image",
      width: "6rem",
      render: (row) => <img className="blogs__thumb" src={row.image} alt={row.title} width={60} height={40} loading="lazy" />,
    },
    { key: "actions", header: "Actions", width: "5.5rem", align: "center", render: (row) => <BlogActions blog={row} onEdit={onEdit} onDelete={onDelete} /> },
    { key: "title", header: "Blog Title", sortable: true, render: (row) => <span className="blogs__wrap">{row.title}</span> },
    {
      key: "description",
      header: "Description",
      sortable: true,
      // One line with an ellipsis; the full text is in the tooltip and the edit panel.
      render: (row) => (
        <span className="blogs__truncate" title={row.description}>
          {row.description}
        </span>
      ),
    },
    { key: "link", header: "Blog Link", sortable: true, render: (row) => <BlogLink link={row.link} /> },
    { key: "priority", header: "Priority", sortable: true },
    { key: "status", header: "Status", sortable: true, render: (row) => <BlogStatusBadge status={row.status} /> },
  ];

  return (
    <div className="blogs__table-view">
      <Table columns={columns} data={rows} rowKey={(row) => row.id} className="blogs__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default BlogsTable;
