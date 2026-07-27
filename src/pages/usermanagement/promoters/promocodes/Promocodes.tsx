import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiPlus, FiX } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ToggleSwitch from "../../../../components/toggle/ToggleSwitch";
import Pagination from "../promoterslist/Pagination";
import {
  promoCodes as initialPromoCodes,
  formatDate,
  buildPromoCodeUrl,
  type PromoCodeRow,
} from "./promocodes.data";
import "../promoterslist/Promoters.scss";
import "./Promocodes.scss";

const PAGE_SIZE = 10;
const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

interface NewPromoCodeDrawerProps {
  open: boolean;
  code: string;
  active: boolean;
  error: string;
  onCodeChange: (value: string) => void;
  onActiveChange: (value: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const NewPromoCodeDrawer = ({
  open,
  code,
  active,
  error,
  onCodeChange,
  onActiveChange,
  onSubmit,
  onClose,
}: NewPromoCodeDrawerProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const trimmedCode = code.trim();

  return createPortal(
    <>
      <div className={`promo-code-drawer__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <div
        className={`promo-code-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-promo-code-drawer-title"
      >
        <div className="promo-code-drawer__header">
          <h2 id="new-promo-code-drawer-title">New Promo Code</h2>
          <button
            type="button"
            className="promo-code-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div className="promo-code-drawer__body">
          <div className="promo-code-drawer__field">
            <label className="promo-code-drawer__label" htmlFor="newPromoCode">
              Promo Code <span className="promo-code-drawer__required">*</span>
            </label>
            <input
              id="newPromoCode"
              type="text"
              className="promo-code-drawer__input"
              placeholder="e.g. SAVE20"
              value={code}
              maxLength={20}
              onChange={(event) => onCodeChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSubmit();
                }
              }}
            />
            <p className="promo-code-drawer__hint">
              Letters, numbers, hyphens and underscores only.
            </p>
          </div>

          {trimmedCode && (
            <p className="promo-code-drawer__preview">
              URL: <strong>{buildPromoCodeUrl(trimmedCode)}</strong>
            </p>
          )}

          <div className="promo-code-drawer__toggle-row">
            <ToggleSwitch
              checked={active}
              onChange={onActiveChange}
              onLabel="Active"
              offLabel="Inactive"
              ariaLabel="Promo code status"
            />
          </div>

          {error && (
            <p className="promo-code-drawer__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="promo-code-drawer__footer">
          <button type="button" className="promo-code-drawer__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="promo-code-drawer__submit" onClick={onSubmit}>
            Add Promo Code
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

const Promocodes = () => {
  const [rows, setRows] = useState<PromoCodeRow[]>(initialPromoCodes);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [drawerError, setDrawerError] = useState("");

  const columns: TableColumn<PromoCodeRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Promo Code / URL",
        sortable: true,
        render: (row) => (
          <div className="promocodes__code-cell">
            <span className="promocodes__code">{row.code}</span>
            <a
              href={row.url}
              className="promocodes__url"
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {row.url}
            </a>
          </div>
        ),
        exportValue: (row) => row.code,
      },
      {
        key: "createdDate",
        header: "Created Date",
        sortable: true,
        sortValue: (row) => row.createdDateValue,
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (row) => (
          <span className={`promocodes__status promocodes__status--${row.status.toLowerCase()}`}>
            {row.status}
          </span>
        ),
        exportValue: (row) => row.status,
      },
    ],
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => `${row.code} ${row.url}`.toLowerCase().includes(q));
  }, [rows, keyword]);

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const currentPageClamped = Math.min(currentPage, Math.max(totalPages, 1));
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleOpenDrawer = () => {
    setNewCode("");
    setNewActive(true);
    setDrawerError("");
    setDrawerOpen(true);
  };

  const handleAddPromoCode = () => {
    const trimmed = newCode.trim();

    if (!trimmed) {
      setDrawerError("Please enter a promo code.");
      return;
    }
    if (!CODE_PATTERN.test(trimmed)) {
      setDrawerError("Promo code can only contain letters, numbers, hyphens and underscores.");
      return;
    }
    if (trimmed.length < 4) {
      setDrawerError("Promo code must be at least 4 characters long.");
      return;
    }
    if (rows.some((row) => row.code.toLowerCase() === trimmed.toLowerCase())) {
      setDrawerError(`Promo code "${trimmed.toUpperCase()}" already exists.`);
      return;
    }

    const code = trimmed.toUpperCase();
    const now = new Date();
    const newRow: PromoCodeRow = {
      id: `promo-${Date.now()}`,
      code,
      url: buildPromoCodeUrl(code),
      createdDate: formatDate(now),
      createdDateValue: now.getTime(),
      status: newActive ? "Active" : "Inactive",
    };

    setRows((prev) => [newRow, ...prev]);
    setDrawerError("");
    setDrawerOpen(false);
    setCurrentPage(1);
  };

  return (
    <div className="promocodes-page">
      <div className="promocodes-card">
        <div className="promocodes-card__header">
          <h1>Promo Codes</h1>
          <button
            type="button"
            className="promocodes-btn promocodes-btn--primary"
            onClick={handleOpenDrawer}
          >
            <FiPlus aria-hidden /> New Promo Code
          </button>
        </div>

        <input
          type="text"
          className="promocodes-card__search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search promo codes..."
          aria-label="Search promo codes"
        />

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No promo codes found."
          minHeight
        />

        <Pagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          totalResults={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <NewPromoCodeDrawer
        open={drawerOpen}
        code={newCode}
        active={newActive}
        error={drawerError}
        onCodeChange={setNewCode}
        onActiveChange={setNewActive}
        onSubmit={handleAddPromoCode}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default Promocodes;
