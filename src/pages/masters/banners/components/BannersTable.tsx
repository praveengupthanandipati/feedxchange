import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { Banner } from "../banners.data";
import BannerActions, { type BannerActionHandlers } from "./BannerActions";
import BannerStatusBadge from "./BannerStatusBadge";

export interface BannerListProps extends BannerActionHandlers {
  rows: Banner[];
  emptyMessage: string;
}

/** Tablet, laptop and desktop view. */
const BannersTable = ({ rows, emptyMessage, onEdit, onDelete }: BannerListProps) => {
  const columns: TableColumn<Banner>[] = [
    {
      key: "image",
      header: "Image",
      width: "7rem",
      render: (row) => <img className="banners__thumb" src={row.image} alt={row.title} width={60} height={40} loading="lazy" />,
    },
    { key: "actions", header: "Actions", width: "5.5rem", align: "center", render: (row) => <BannerActions banner={row} onEdit={onEdit} onDelete={onDelete} /> },
    { key: "title", header: "Title", sortable: true, render: (row) => <span className="banners__wrap">{row.title}</span> },
    { key: "linkUrl", header: "Link URL", sortable: true, render: (row) => <span className="banners__wrap banners__url">{row.linkUrl}</span> },
    { key: "priority", header: "Priority", sortable: true },
    { key: "status", header: "Status", sortable: true, render: (row) => <BannerStatusBadge status={row.status} /> },
  ];

  return (
    <div className="banners__table-view">
      <Table columns={columns} data={rows} rowKey={(row) => row.id} className="banners__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default BannersTable;
