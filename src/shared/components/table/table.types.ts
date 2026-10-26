import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface TableColumn<T> {
  key: string;
  header: string;
  headerTooltip?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (row: T) => ReactNode;
  /** Value used for sorting when the column has a custom `render`. */
  sortValue?: (row: T) => string | number;
  /** Plain-text value used for exporting; falls back to `sortValue` then the raw field. */
  exportValue?: (row: T) => string;
  /** Starts hidden when the table offers the Columns menu (`columnToggle`). */
  hidden?: boolean;
  /** false keeps the column out of the Columns menu (always shown). */
  hideable?: boolean;
  /** "low": hidden on phones and small tablets (below 768px), to keep the important columns readable. */
  priority?: "low";
}
