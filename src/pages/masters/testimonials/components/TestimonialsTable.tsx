import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import type { Testimonial } from "../testimonials.data";
import { TestimonialActions, TestimonialStatusBadge, type TestimonialActionHandlers } from "./TestimonialBits";

export interface TestimonialListProps extends TestimonialActionHandlers {
  rows: Testimonial[];
  emptyMessage: string;
}

/** Tablet, laptop and desktop view. */
const TestimonialsTable = ({ rows, emptyMessage, onEdit, onDelete }: TestimonialListProps) => {
  const columns: TableColumn<Testimonial>[] = [
    {
      key: "customerName",
      header: "Author",
      sortable: true,
      render: (row) => (
        <span className="testimonials__author">
          <strong>{row.customerName}</strong>
          <small>{row.designation}</small>
        </span>
      ),
    },
    {
      key: "content",
      header: "Content",
      sortable: true,
      // One line with an ellipsis; the full review is in the tooltip and the edit panel.
      render: (row) => (
        <span className="testimonials__content" title={row.content}>
          {row.content}
        </span>
      ),
    },
    { key: "status", header: "Status", sortable: true, render: (row) => <TestimonialStatusBadge status={row.status} /> },
    { key: "date", header: "Date", sortable: true, render: (row) => <span className="testimonials__nowrap">{row.date}</span> },
    { key: "actions", header: "Actions", render: (row) => <TestimonialActions testimonial={row} onEdit={onEdit} onDelete={onDelete} /> },
  ];

  return (
    <div className="testimonials__table-view">
      <Table columns={columns} data={rows} rowKey={(row) => row.id} className="testimonials__table" emptyMessage={emptyMessage} />
    </div>
  );
};

export default TestimonialsTable;
