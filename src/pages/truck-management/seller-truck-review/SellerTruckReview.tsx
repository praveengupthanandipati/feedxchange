import { useMemo, useState, type ReactNode, type SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiArrowLeft,
  FiBox,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiSmartphone,
  FiTruck,
  FiUser,
  FiUserCheck,
  FiAlertCircle,
} from "react-icons/fi";
import DatePickerInput from "../../../components/dropdown/DatePickerInput";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import InfoTooltip from "../../../components/tooltip/InfoTooltip";
import {
  getSellerTruckReview,
  pendingContractsForDo,
  type PendingContractForDo,
} from "./sellerTruckReview.data";
import "./SellerTruckReview.scss";

const PENDING_DOS_PATH = "/truck-management/pending-delivery-orders";
const PAGE_SIZE = 10;

const formatInr = (value: number) => value.toLocaleString("en-IN");

const Rupees = ({ value, className = "" }: { value: number; className?: string }) => (
  <span className={`seller-truck-review__amount ${className}`}>
    <FaRupeeSign aria-hidden className="seller-truck-review__rupee" />
    {formatInr(value)}
  </span>
);

interface SectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  summary?: ReactNode;
  children: ReactNode;
}

/** Card with a title row, inline summary and a Hide/Show toggle for its body. */
const ReviewSection = ({ id, icon, title, summary, children }: SectionProps) => {
  const [open, setOpen] = useState(true);
  const bodyId = `${id}-body`;

  return (
    <section className="seller-truck-review__section" aria-labelledby={`${id}-title`}>
      <header className="seller-truck-review__section-header">
        <h2 id={`${id}-title`}>
          {icon} {title}
        </h2>
        {summary && <div className="seller-truck-review__summary">{summary}</div>}
        <button
          type="button"
          className="seller-truck-review__toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={bodyId}
        >
          {open ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
          {open ? "Hide" : "Show"}
        </button>
      </header>
      {open && (
        <div id={bodyId} className="seller-truck-review__section-body">
          {children}
        </div>
      )}
    </section>
  );
};

const SummaryItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <span className="seller-truck-review__summary-item">
    {label}: <strong>{value}</strong>
  </span>
);

interface FieldProps {
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const Field = ({ label, icon, children, className = "" }: FieldProps) => (
  <div className={`seller-truck-review__field ${className}`}>
    <dt>
      {icon} {label}
    </dt>
    <dd>{children ?? <span className="seller-truck-review__empty">—</span>}</dd>
  </div>
);

const SellerTruckReview = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const review = useMemo(() => getSellerTruckReview(id), [id]);

  const [doNumber, setDoNumber] = useState("");
  const [doDate, setDoDate] = useState("");
  const [message, setMessage] = useState("");
  const [assignToContracts, setAssignToContracts] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [assignableQty, setAssignableQty] = useState<Record<string, string>>(() =>
    Object.fromEntries(pendingContractsForDo.map((contract) => [contract.id, String(contract.quantity)])),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  const contracts = pendingContractsForDo;
  const totalPages = Math.max(1, Math.ceil(contracts.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedContracts = contracts.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const toggleSelected = (key: string) =>
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

  const handleSelectAll = (checked: boolean) => {
    const pageKeys = pagedContracts.map((contract) => contract.id);
    setSelectedKeys((prev) =>
      checked ? Array.from(new Set([...prev, ...pageKeys])) : prev.filter((key) => !pageKeys.includes(key)),
    );
  };

  const renderQtyInput = (contract: PendingContractForDo) => (
    <input
      type="number"
      min={0}
      inputMode="decimal"
      className="seller-truck-review__qty-input"
      value={assignableQty[contract.id] ?? ""}
      onChange={(event) =>
        setAssignableQty((prev) => ({ ...prev, [contract.id]: event.target.value }))
      }
      aria-label={`Assignable quantity for contract ${contract.contractNo}`}
    />
  );

  const contractColumns: TableColumn<PendingContractForDo>[] = [
    { key: "contractNo", header: "Contract #", sortable: true },
    { key: "date", header: "Date", sortable: true },
    {
      key: "seller",
      header: "Seller",
      sortable: true,
      render: (contract) => (
        <span className="seller-truck-review__name">
          <span className="seller-truck-review__name-text">{contract.seller}</span>
          <InfoTooltip text={contract.seller} />
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (contract) => (
        <strong className="seller-truck-review__qty">
          {contract.quantity} {contract.qtyUnit}
        </strong>
      ),
    },
    {
      key: "contractRate",
      header: "Contract Rate",
      sortable: true,
      render: (contract) => <Rupees value={contract.contractRate} />,
    },
    {
      key: "pendingQty",
      header: "P. Qty",
      headerTooltip: "Pending Quantity",
      sortable: true,
      render: (contract) => (
        <strong className="seller-truck-review__qty">
          {contract.pendingQty} {contract.qtyUnit}
        </strong>
      ),
    },
    { key: "scheduleStart", header: "Delivery Schedule Start", sortable: true },
    { key: "scheduleEnd", header: "Delivery Schedule End", sortable: true },
    {
      key: "assignableQty",
      header: "Assignable Qty",
      sortable: true,
      sortValue: (contract) => Number(assignableQty[contract.id] ?? 0),
      render: renderQtyInput,
    },
  ];

  if (!review) {
    return (
      <div className="seller-truck-review">
        <div className="seller-truck-review__not-found" role="alert">
          <FiAlertCircle aria-hidden />
          <p>This pending DO could not be found.</p>
          <Link to={PENDING_DOS_PATH} className="seller-truck-review__back">
            <FiArrowLeft aria-hidden /> Back to Pending DOs
          </Link>
        </div>
      </div>
    );
  }

  const { row, truck } = review;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!doNumber.trim()) nextErrors.push("Enter the Delivery Order Number.");
    if (!doDate) nextErrors.push("Select the DO Date.");
    if (assignToContracts) {
      if (selectedKeys.length === 0) nextErrors.push("Select at least one contract to assign the DO to.");
      const invalidQty = selectedKeys.some((key) => !(Number(assignableQty[key]) > 0));
      if (invalidQty) nextErrors.push("Assignable Qty must be greater than 0 for each selected contract.");
    }
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;

    // TODO: post the DO to the API once the endpoint is available.
    navigate(PENDING_DOS_PATH);
  };

  return (
    <div className="seller-truck-review">
      <div className="seller-truck-review__page-header">
        <h1>Seller Truck Review</h1>
        <Link to={PENDING_DOS_PATH} className="seller-truck-review__back">
          <FiArrowLeft aria-hidden /> Back to Pending DOs
        </Link>
      </div>

      <ReviewSection
        id="request-details"
        icon={<FiInfo aria-hidden />}
        title="Request Details"
        summary={
          <>
            <SummaryItem label="Contract No" value={row.contractNo} />
            <SummaryItem label="Seller" value={row.seller} />
            <SummaryItem label="Buyer" value={row.buyer} />
          </>
        }
      >
        <dl className="seller-truck-review__grid">
          <Field label="Contract Number">
            <strong>{row.contractNo}</strong>
          </Field>
          <Field label="Contract Date">{review.contractDate}</Field>
          <Field label="Buyer">
            <strong>{row.buyer}</strong>
          </Field>
          <Field label="Seller">
            <strong>{row.seller}</strong>
          </Field>
          <Field label="Product">
            <strong>{row.product}</strong>
          </Field>
          <Field label="Transporter">{review.transporter || undefined}</Field>
          <Field label="Schedule Date & Time">
            <span className="seller-truck-review__with-icon">
              <FiCalendar aria-hidden /> {review.scheduleDate}
            </span>
          </Field>
          <Field label="Loading Address">
            <span className="seller-truck-review__with-icon">
              <FiMapPin aria-hidden className="seller-truck-review__pin--loading" />
              <span>{review.loadingAddress}</span>
            </span>
          </Field>
          <Field label="Delivery Address">
            <span className="seller-truck-review__with-icon">
              <FiMapPin aria-hidden className="seller-truck-review__pin--delivery" />
              <span>{review.deliveryAddress}</span>
            </span>
          </Field>
          <Field label="Quantity">
            <span className="seller-truck-review__big seller-truck-review__big--info">
              {row.qty} {row.qtyUnit}
            </span>
          </Field>
          <Field label="Freight Charges">
            <Rupees value={row.freight} className="seller-truck-review__big seller-truck-review__big--success" />
          </Field>
          <Field label="Status">
            <span className="seller-truck-review__badge">{review.truckStatus}</span>
          </Field>
        </dl>
      </ReviewSection>

      <ReviewSection
        id="assigned-truck"
        icon={<FiTruck aria-hidden />}
        title="Assigned Truck Info"
        summary={
          <>
            <SummaryItem label="Truck No" value={truck.truckNumber} />
            <SummaryItem label="Capacity" value={`${truck.capacity.toFixed(2)} ${row.qtyUnit}`} />
            <SummaryItem label="Owner" value={truck.ownerName} />
          </>
        }
      >
        <dl className="seller-truck-review__grid">
          <Field label="Truck Number">
            <span className="seller-truck-review__badge">{truck.truckNumber}</span>
          </Field>
          <Field label="Truck Capacity" icon={<FiBox aria-hidden />}>
            <strong>
              {truck.capacity.toFixed(2)} {row.qtyUnit}
            </strong>
          </Field>
          <Field label="Owner Name" icon={<FiUser aria-hidden />}>
            <strong>{truck.ownerName}</strong>
          </Field>
          <Field label="Owner Contact" icon={<FiPhone aria-hidden />}>
            <a href={`tel:${truck.ownerContact}`} className="seller-truck-review__phone">
              {truck.ownerContact}
            </a>
          </Field>
          <Field label="Driver Name" icon={<FiUserCheck aria-hidden />}>
            <strong>{truck.driverName}</strong>
          </Field>
          <Field label="Driver Contact" icon={<FiSmartphone aria-hidden />}>
            <a href={`tel:${truck.driverContact}`} className="seller-truck-review__phone">
              {truck.driverContact}
            </a>
          </Field>
        </dl>
      </ReviewSection>

      <form className="seller-truck-review__section" onSubmit={handleSubmit} noValidate>
        <header className="seller-truck-review__section-header">
          <h2>
            <FiPackage aria-hidden /> Dispatch Info
          </h2>
        </header>

        <div className="seller-truck-review__section-body seller-truck-review__dispatch">
          <div className="seller-truck-review__form-row">
            <div className="seller-truck-review__form-field">
              <label htmlFor="do-number">Delivery Order Number</label>
              <input
                id="do-number"
                type="text"
                value={doNumber}
                onChange={(event) => setDoNumber(event.target.value)}
                className="seller-truck-review__input"
              />
            </div>
            <div className="seller-truck-review__form-field">
              <label htmlFor="do-date">DO Date</label>
              <DatePickerInput id="do-date" value={doDate} onChange={setDoDate} ariaLabel="DO Date" clearable />
            </div>
          </div>

          <div className="seller-truck-review__form-field">
            <label htmlFor="do-message">Message (optional)</label>
            <textarea
              id="do-message"
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="seller-truck-review__input seller-truck-review__textarea"
            />
          </div>

          <label className="seller-truck-review__checkbox">
            <input
              type="checkbox"
              checked={assignToContracts}
              onChange={(event) => setAssignToContracts(event.target.checked)}
            />
            Delivery order assign to contracts
          </label>

          {assignToContracts && (
            <>
              <div className="seller-truck-review__contracts-header">
                <h3>
                  Displaying pending contracts of <strong>{row.seller}</strong> for{" "}
                  <strong>{row.product}</strong>
                </h3>
                <p>
                  Truck No: <strong>{truck.truckNumber}</strong> Qty:
                  <strong>
                    {row.qty} {row.qtyUnit}
                  </strong>
                </p>
              </div>

              <div className="seller-truck-review__table-view">
                <Table
                  columns={contractColumns}
                  data={pagedContracts}
                  rowKey={(contract) => contract.id}
                  selectable
                  selectedRowKeys={selectedKeys}
                  onSelectRow={toggleSelected}
                  onSelectAll={handleSelectAll}
                  emptyMessage="No pending contracts for this seller and product."
                />
              </div>

              <ul className="seller-truck-review__cards">
                {pagedContracts.length === 0 && (
                  <li className="seller-truck-review__cards-empty">
                    <FiAlertCircle aria-hidden /> No pending contracts for this seller and product.
                  </li>
                )}
                {pagedContracts.map((contract) => (
                  <li key={contract.id} className="seller-truck-review__contract-card">
                    <label className="seller-truck-review__contract-card-top">
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(contract.id)}
                        onChange={() => toggleSelected(contract.id)}
                      />
                      <strong>{contract.contractNo}</strong>
                      <span>{contract.date}</span>
                    </label>
                    <dl className="seller-truck-review__contract-card-grid">
                      <div className="seller-truck-review__full">
                        <dt>Seller</dt>
                        <dd>{contract.seller}</dd>
                      </div>
                      <div>
                        <dt>Quantity</dt>
                        <dd className="seller-truck-review__qty">
                          {contract.quantity} {contract.qtyUnit}
                        </dd>
                      </div>
                      <div>
                        <dt>Contract Rate</dt>
                        <dd>
                          <Rupees value={contract.contractRate} />
                        </dd>
                      </div>
                      <div>
                        <dt>P. Qty</dt>
                        <dd className="seller-truck-review__qty">
                          {contract.pendingQty} {contract.qtyUnit}
                        </dd>
                      </div>
                      <div>
                        <dt>Schedule</dt>
                        <dd>
                          {contract.scheduleStart} – {contract.scheduleEnd}
                        </dd>
                      </div>
                      <div className="seller-truck-review__full">
                        <dt>Assignable Qty</dt>
                        <dd>{renderQtyInput(contract)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>

              <div className="seller-truck-review__pagination">
                <p>
                  {contracts.length === 0
                    ? "Showing 0 Results"
                    : `Showing ${(currentPageClamped - 1) * PAGE_SIZE + 1}-${Math.min(
                        currentPageClamped * PAGE_SIZE,
                        contracts.length,
                      )} of ${contracts.length} Results`}
                </p>
                <div className="seller-truck-review__pagination-controls">
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
                      aria-current={page === currentPageClamped ? "page" : undefined}
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
            </>
          )}

          {errors.length > 0 && (
            <ul className="seller-truck-review__errors" role="alert">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          <div className="seller-truck-review__footer">
            <Link to={PENDING_DOS_PATH} className="seller-truck-review__btn seller-truck-review__btn--ghost">
              Cancel
            </Link>
            <button type="submit" className="seller-truck-review__btn seller-truck-review__btn--primary">
              Submit DO
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellerTruckReview;
