import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiMessageSquare,
  FiSave,
  FiCheck,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiX,
  FiInfo,
  FiSliders,
  FiEdit3,
  FiStar,
  FiArrowRight,
  FiArrowLeft,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
} from "react-icons/fi";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import Table from "../../../components/table/Table";
import { buildPriceTrackingColumns } from "./priceTracking.columns";
import {
  priceTrackingRows as initialRows,
  productOptions,
  commentOptions,
  type PriceTrackingRow,
  type CommentSentiment,
} from "./priceTracking.data";
import "./ProductPriceTracking.scss";

type PriceField = "originalPrice" | "offerPrice" | "resalePrice";

const PAGE_SIZE = 10;

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const SENTIMENT_ICONS: Record<CommentSentiment, typeof FiTrendingUp> = {
  up: FiTrendingUp,
  down: FiTrendingDown,
  info: FiInfo,
  warning: FiAlertTriangle,
};

interface CommentDrawerProps {
  open: boolean;
  selectedRows: PriceTrackingRow[];
  selectedCommentIds: string[];
  otherChecked: boolean;
  otherText: string;
  majorEvent: boolean;
  onToggleComment: (id: string) => void;
  onOtherToggle: (checked: boolean) => void;
  onOtherTextChange: (value: string) => void;
  onMajorEventToggle: (checked: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const CommentDrawer = ({
  open,
  selectedRows,
  selectedCommentIds,
  otherChecked,
  otherText,
  majorEvent,
  onToggleComment,
  onOtherToggle,
  onOtherTextChange,
  onMajorEventToggle,
  onCancel,
  onSubmit,
}: CommentDrawerProps) => {
  const [step, setStep] = useState<"select" | "preview">("select");

  useEffect(() => {
    if (open) setStep("select");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  const selectedCommentEntries = useMemo(
    () => [
      ...commentOptions
        .filter((option) => selectedCommentIds.includes(option.id))
        .map((option) => ({ id: option.id, label: option.label, Icon: SENTIMENT_ICONS[option.sentiment] })),
      ...(otherChecked && otherText.trim()
        ? [{ id: "other", label: otherText.trim(), Icon: FiEdit3 }]
        : []),
    ],
    [selectedCommentIds, otherChecked, otherText],
  );

  const nextCount = selectedCommentEntries.length;

  return createPortal(
    <>
      <div className={`comment-drawer__backdrop ${open ? "is-open" : ""}`} onClick={onCancel} />
      <div
        className={`comment-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-drawer-title"
      >
        <div className="comment-drawer__header">
          <h2 id="comment-drawer-title">
            {step === "select" ? <FiMessageSquare aria-hidden /> : <FiEye aria-hidden />}
            {step === "select" ? "Add Comments for Selected Products" : "Preview Comments"}
          </h2>
          <button
            type="button"
            className="comment-drawer__close"
            onClick={onCancel}
            aria-label="Close"
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div className="comment-drawer__body">
          <p className="comment-drawer__selected-label">
            <FiInfo aria-hidden /> Selected Products ({selectedRows.length})
          </p>

          <div className="comment-drawer__selected-list">
            {selectedRows.map((row) => (
              <div className="comment-drawer__selected-chip" key={row.id}>
                <FiPackage aria-hidden />
                <strong>{row.productName}</strong>
                <span>({row.sellerName})</span>
              </div>
            ))}
          </div>

          {step === "select" ? (
            <>
              <p className="comment-drawer__section-title">
                <FiSliders aria-hidden /> Select Comments
              </p>

              <div className="comment-drawer__comment-list">
                {commentOptions.map((option) => {
                  const Icon = SENTIMENT_ICONS[option.sentiment];
                  const checked = selectedCommentIds.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`comment-drawer__comment-item comment-drawer__comment-item--${option.sentiment}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleComment(option.id)}
                      />
                      <Icon aria-hidden />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="comment-drawer__comment-item">
                  <input
                    type="checkbox"
                    checked={otherChecked}
                    onChange={(event) => onOtherToggle(event.target.checked)}
                  />
                  <FiEdit3 aria-hidden />
                  <span>Other</span>
                </label>
                {otherChecked && (
                  <textarea
                    className="comment-drawer__other-textarea"
                    placeholder="Enter your comment..."
                    value={otherText}
                    onChange={(event) => onOtherTextChange(event.target.value)}
                  />
                )}
              </div>

              <label className="comment-drawer__major-event">
                <input
                  type="checkbox"
                  checked={majorEvent}
                  onChange={(event) => onMajorEventToggle(event.target.checked)}
                />
                <FiStar aria-hidden />
                <div>
                  <strong>Mark as Major Event</strong>
                  <p>This will highlight the comment as a major market event</p>
                </div>
              </label>
            </>
          ) : (
            <>
              <p className="comment-drawer__selected-label comment-drawer__selected-label--success">
                <FiCheckCircle aria-hidden /> Selected Comments ({selectedCommentEntries.length})
              </p>

              <div className="comment-drawer__preview-list">
                {selectedCommentEntries.map((entry) => (
                  <div className="comment-drawer__preview-comment" key={entry.id}>
                    <entry.Icon aria-hidden />
                    <span>{entry.label}</span>
                  </div>
                ))}
              </div>

              {majorEvent && (
                <p className="comment-drawer__preview-major-event">
                  <FiStar aria-hidden /> Marked as Major Event
                </p>
              )}
            </>
          )}
        </div>

        <div className="comment-drawer__footer">
          {step === "select" ? (
            <>
              <button type="button" className="comment-drawer__cancel" onClick={onCancel}>
                <FiX aria-hidden /> Cancel
              </button>
              <button
                type="button"
                className="comment-drawer__submit"
                disabled={nextCount === 0}
                onClick={() => setStep("preview")}
              >
                Next ({nextCount}) <FiArrowRight aria-hidden />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="comment-drawer__cancel" onClick={() => setStep("select")}>
                <FiArrowLeft aria-hidden /> Back
              </button>
              <button type="button" className="comment-drawer__submit-final" onClick={onSubmit}>
                <FiCheck aria-hidden /> Submit Comments
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
};

const ProductPriceTracking = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PriceTrackingRow[]>(initialRows);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [pageError, setPageError] = useState("");
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [dateRange, setDateRange] = useState(todayISO());
  const [timeValue, setTimeValue] = useState(nowTime());
  const [productFilter, setProductFilter] = useState("");

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [majorEvent, setMajorEvent] = useState(false);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    if (!saveToastVisible) return;
    const timer = setTimeout(() => setSaveToastVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [saveToastVisible]);

  const handlePriceChange = (id: string, field: PriceField, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value, status: row.status === "Saved" ? "Saved" : "Unsaved" } : row,
      ),
    );
  };

  const handleView = (row: PriceTrackingRow) => {
    navigate(`/products/price-history?product=${encodeURIComponent(row.productName)}`);
  };

  const columns = useMemo(
    () =>
      buildPriceTrackingColumns({
        selectedIds: selectedIdSet,
        onPriceChange: handlePriceChange,
        onView: handleView,
      }),
    [selectedIdSet],
  );

  const filteredRows = useMemo(() => {
    if (!productFilter) return rows;
    return rows.filter((row) => row.productName === productFilter);
  }, [rows, productFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [productFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked: boolean) => {
    const pageIds = pagedRows.map((row) => row.id);
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...pageIds]))
        : prev.filter((id) => !pageIds.includes(id)),
    );
  };

  const handleApply = () => {
    setPageError("");
    setProductFilter(selectedProduct);
  };

  const handleReset = () => {
    setSelectedProduct("");
    setProductFilter("");
    setDateRange(todayISO());
    setTimeValue(nowTime());
    setPageError("");
  };

  const handleSave = () => {
    const incomplete: string[] = [];
    setRows((prev) =>
      prev.map((row) => {
        if (!selectedIds.includes(row.id)) return row;
        const complete = row.originalPrice && row.offerPrice && row.resalePrice;
        if (!complete) {
          incomplete.push(row.productName);
          return row;
        }
        return { ...row, status: "Saved" as const };
      }),
    );

    if (incomplete.length > 0) {
      setPageError(
        `Enter Original, Offer and Resale price for: ${Array.from(new Set(incomplete)).join(", ")}.`,
      );
    } else {
      setPageError("");
      setSaveToastVisible(true);
    }
  };

  const handleOpenCommentDrawer = () => {
    setSelectedCommentIds([]);
    setOtherChecked(false);
    setOtherText("");
    setMajorEvent(false);
    setCommentDrawerOpen(true);
  };

  const handleToggleComment = (id: string) => {
    setSelectedCommentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmitComments = () => {
    setCommentDrawerOpen(false);
  };

  const selectedRowsForDrawer = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds],
  );

  return (
    <div className="price-tracking-page">
      {saveToastVisible && (
        <div className="price-tracking__toast" role="status">
          <FiCheckCircle aria-hidden />
          Prices saved successfully.
        </div>
      )}

      <div className="price-tracking-card">
        <div className="price-tracking-card__header">
          <h1>Price Tracking</h1>
          <div className="price-tracking-card__actions">
            <button
              type="button"
              className="price-tracking-btn price-tracking-btn--info"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="price-tracking-btn price-tracking-btn--tan"
              onClick={handleOpenCommentDrawer}
              disabled={selectedIds.length === 0}
            >
              <FiMessageSquare aria-hidden /> Add Comment
            </button>
            <button
              type="button"
              className="price-tracking-btn price-tracking-btn--primary"
              onClick={handleSave}
              disabled={selectedIds.length === 0}
            >
              <FiSave aria-hidden /> Save
            </button>
          </div>
        </div>

        {pageError && (
          <p className="price-tracking__page-error" role="alert">
            {pageError}
          </p>
        )}

        {filtersVisible && (
          <div className={`price-tracking-filters ${!selectedProduct ? "is-invalid" : ""}`}>
            <div className="price-tracking-filters__field">
              <span className="price-tracking-filters__label">
                Select Product <span className="price-tracking-filters__required">*</span>
              </span>
              <SearchableSelect
                options={productOptions}
                value={selectedProduct}
                onChange={setSelectedProduct}
                placeholder="Select Product (Required)"
                ariaLabel="Select Product"
              />
            </div>

            <div className="price-tracking-filters__field">
              <span className="price-tracking-filters__label">Select Date Range</span>
              <div className="price-tracking-filters__input-group">
                <FiCalendar aria-hidden />
                <input
                  type="date"
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                  aria-label="Select date range"
                />
              </div>
            </div>

            <div className="price-tracking-filters__field">
              <span className="price-tracking-filters__label">Select Time</span>
              <div className="price-tracking-filters__input-group">
                <FiClock aria-hidden />
                <input
                  type="time"
                  value={timeValue}
                  onChange={(event) => setTimeValue(event.target.value)}
                  aria-label="Select time"
                />
              </div>
            </div>

            <button type="button" className="price-tracking-filters__apply" onClick={handleApply}>
              <FiCheck aria-hidden /> Apply
            </button>
            <button type="button" className="price-tracking-filters__reset" onClick={handleReset}>
              <FiRefreshCw aria-hidden /> Reset
            </button>
          </div>
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedIds}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          emptyMessage="No products match the current filters."
          minHeight
        />

        <div className="price-tracking-pagination">
          <p>
            {filteredRows.length === 0
              ? "Showing 0 Results"
              : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPageClamped * PAGE_SIZE,
                  filteredRows.length,
                )} of ${filteredRows.length} Results`}
          </p>
          <div className="price-tracking-pagination__controls">
            <button
              type="button"
              disabled={currentPageClamped === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
            >
              <FiChevronLeft aria-hidden />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={page === currentPageClamped ? "is-active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPageClamped === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
            >
              <FiChevronRight aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <CommentDrawer
        open={commentDrawerOpen}
        selectedRows={selectedRowsForDrawer}
        selectedCommentIds={selectedCommentIds}
        otherChecked={otherChecked}
        otherText={otherText}
        majorEvent={majorEvent}
        onToggleComment={handleToggleComment}
        onOtherToggle={setOtherChecked}
        onOtherTextChange={setOtherText}
        onMajorEventToggle={setMajorEvent}
        onCancel={() => setCommentDrawerOpen(false)}
        onSubmit={handleSubmitComments}
      />
    </div>
  );
};

export default ProductPriceTracking;
