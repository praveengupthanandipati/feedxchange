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
}
