import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowDownIcon, ArrowUpIcon, FunnelIcon } from "../../../../../shared/components/icon";
import type { TransporterRequest } from "../../../../../core/store/transporterRequestsApi";

export type SortDir = "asc" | "desc" | null;

export interface ColumnFilters {
  loading: string;
  unloading: string;
  /** yyyy-mm-dd, by the date the trucks are scheduled for. */
  from: string;
  to: string;
}

export const EMPTY_COLUMN_FILTERS: ColumnFilters = { loading: "", unloading: "", from: "", to: "" };

const contains = (text: string | null | undefined, term: string) => (text ?? "").toLowerCase().includes(term.trim().toLowerCase());

/** The rows after the column filters (address text, scheduled date range) and the Scheduled For sort. */
export const useColumnControls = (rows: TransporterRequest[], initialSort: SortDir = null) => {
  const [filters, setFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS);
  const [sort, setSort] = useState<SortDir>(initialSort);

  const shown = useMemo(() => {
    const result = rows.filter((r) => {
      const day = r.scheduleDateTime.slice(0, 10);
      return (
        (!filters.loading.trim() || contains(`${r.sellerName ?? ""} ${r.loadingAddress ?? ""}`, filters.loading)) &&
        (!filters.unloading.trim() || contains(`${r.buyerName ?? ""} ${r.deliveryAddress ?? ""}`, filters.unloading)) &&
        (!filters.from || day >= filters.from) &&
        (!filters.to || day <= filters.to)
      );
    });
    if (sort) result.sort((a, b) => (sort === "asc" ? 1 : -1) * a.scheduleDateTime.localeCompare(b.scheduleDateTime));
    return result;
  }, [rows, filters, sort]);

  // With a starting order the heading just flips it (ascending <-> descending); without one it also goes back to the list's own order.
  const cycleSort = () => setSort((prev) => (prev === "asc" ? "desc" : prev === "desc" ? (initialSort ? "asc" : null) : "asc"));
  const active = JSON.stringify(filters) !== JSON.stringify(EMPTY_COLUMN_FILTERS);
  return { filters, setFilters, sort, cycleSort, shown, active, clear: () => setFilters(EMPTY_COLUMN_FILTERS) };
};

interface ColumnHeaderProps {
  label: string;
  /** Present: the heading sorts the table (click: ascending, descending, off). */
  sort?: SortDir;
  onSort?: () => void;
  /** Present: a filter button opens this panel. */
  filter?: ReactNode;
  filterActive?: boolean;
}

/** A table heading with an optional sort and an optional filter panel (a small popover that sits above the table's scroll area). */
const ColumnHeader = ({ label, sort, onSort, filter, filterActive }: ColumnHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left, window.innerWidth - 280)) });
    setOpen((prev) => !prev);
  };

  return (
    <th className="column-header">
      <span className="column-header__inner">
        {onSort ? (
          <button type="button" className="column-header__sort" onClick={onSort} aria-label={`Sort by ${label}`}>
            {label}
            {sort === "asc" && <ArrowUpIcon aria-hidden />}
            {sort === "desc" && <ArrowDownIcon aria-hidden />}
          </button>
        ) : (
          label
        )}
        {filter && (
          <button
            ref={buttonRef}
            type="button"
            className={`column-header__filter ${filterActive ? "is-active" : ""}`}
            onClick={toggle}
            aria-label={`Filter ${label}`}
            aria-expanded={open}
          >
            <FunnelIcon aria-hidden />
          </button>
        )}
      </span>
      {open &&
        filter &&
        createPortal(
          <div ref={panelRef} className="column-header__panel" style={{ top: pos.top, left: pos.left }} role="dialog" aria-label={`Filter ${label}`}>
            {filter}
          </div>,
          document.body,
        )}
    </th>
  );
};

export default ColumnHeader;
