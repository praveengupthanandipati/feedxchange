import { useEffect, useState, type SubmitEvent } from "react";
import { FiDownload, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { formatDisplayDate } from "../../../../components/dropdown/Calendar";
import DatePickerInput from "../../../../components/dropdown/DatePickerInput";
import DetailSection from "./DetailSection";
import { buildInvoicePdf, downloadBlob } from "./invoicePdf";
import type { DispatchInvoice } from "./updateSellerDispatch.data";

type NumberField = "invoiceQty" | "invoiceAmount" | "gstPercent" | "bags" | "toPayFreight" | "tcs" | "tds";

/** Numeric fields in display order, with the unit shown before or after the value. */
const NUMBER_FIELDS: { key: NumberField; label: string; prefix?: string; suffix?: string }[] = [
  { key: "invoiceQty", label: "Invoice Qty", suffix: "MT" },
  { key: "invoiceAmount", label: "Invoice Amount", prefix: "₹" },
  { key: "gstPercent", label: "GST %", suffix: "%" },
  { key: "bags", label: "No. of Bags" },
  { key: "toPayFreight", label: "To Pay Freight", prefix: "₹" },
  { key: "tcs", label: "TCS", prefix: "₹" },
  { key: "tds", label: "TDS", prefix: "₹" },
];

const formatNumber = (value: string) => (value === "" ? "" : Number(value).toLocaleString("en-IN"));

const withUnit = (value: string, prefix = "", suffix = "") =>
  value === "" ? "--" : `${prefix}${formatNumber(value)}${suffix ? ` ${suffix}` : ""}`.replace(" %", "%");

const finalAmountOf = (invoice: DispatchInvoice) => {
  if (invoice.invoiceAmount === "") return "";
  const amount = Number(invoice.invoiceAmount) * (1 + Number(invoice.gstPercent || 0) / 100);
  return String(Math.round(amount * 100) / 100);
};

const DispatchInvoiceDetails = ({ initialValue }: { initialValue: DispatchInvoice }) => {
  const [saved, setSaved] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  // Release the blob link for an uploaded copy when it is replaced or the card unmounts.
  useEffect(() => {
    const url = saved.fileUrl;
    return () => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [saved.fileUrl]);

  const startEditing = () => {
    setDraft(saved);
    setFile(null);
    setError("");
    setEditing(true);
  };

  const handleSave = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.invoiceNo.trim() || !draft.invoiceDate) {
      setError("Invoice No and Invoice Dt are required.");
      return;
    }
    if (NUMBER_FIELDS.some(({ key }) => draft[key] !== "" && Number(draft[key]) < 0)) {
      setError("Amounts and quantities cannot be negative.");
      return;
    }

    // TODO: save the invoice (and upload the file) to the API once the endpoint is available.
    setSaved({
      ...draft,
      invoiceNo: draft.invoiceNo.trim(),
      ...(file ? { fileName: file.name, fileUrl: URL.createObjectURL(file) } : {}),
    });
    setEditing(false);
  };

  const finalAmount = finalAmountOf(editing ? draft : saved);
  const [qty, amount, gst, ...rest] = NUMBER_FIELDS;

  // An uploaded copy downloads as-is; otherwise a PDF is generated from the saved invoice fields.
  const downloadName = saved.fileName || (saved.invoiceNo ? `Invoice_${saved.invoiceNo}.pdf` : "");

  const handleGeneratedDownload = () => {
    const lines = [
      { label: "Invoice No", value: saved.invoiceNo || "--" },
      { label: "Invoice Dt", value: saved.invoiceDate ? formatDisplayDate(saved.invoiceDate) : "--" },
      ...[qty, amount, gst].map((field) => ({ label: field.label, value: withUnit(saved[field.key], field.prefix, field.suffix) })),
      { label: "Final Amount", value: withUnit(finalAmount, "₹") },
      ...rest.map((field) => ({ label: field.label, value: withUnit(saved[field.key], field.prefix, field.suffix) })),
    ];
    downloadBlob(buildInvoicePdf("Dispatch Invoice", lines), downloadName);
  };

  const viewItem = (label: string, value: string) => (
    <div className="do-info__item" key={label}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );

  const numberInput = ({ key, label, prefix, suffix }: (typeof NUMBER_FIELDS)[number]) => (
    <div className="do-info__field" key={key}>
      <label htmlFor={`invoice-${key}`}>{label}</label>
      <div className="invoice__input-group">
        {prefix && <span>{prefix}</span>}
        <input
          id={`invoice-${key}`}
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={draft[key]}
          onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
        />
        {suffix && <span>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <DetailSection
      title="Dispatch Invoice Details"
      actions={
        !editing && (
          <button type="button" className="do-info__btn do-info__btn--primary" onClick={startEditing}>
            <FiEdit2 aria-hidden /> Edit
          </button>
        )
      }
    >
      {editing ? (
        <form className="do-info__form" onSubmit={handleSave} noValidate>
          <div className="do-info__grid invoice__grid">
            <div className="do-info__field">
              <label htmlFor="invoice-no">Invoice No</label>
              <input
                id="invoice-no"
                type="text"
                value={draft.invoiceNo}
                onChange={(event) => setDraft({ ...draft, invoiceNo: event.target.value })}
                autoFocus
              />
            </div>
            <div className="do-info__field">
              <label htmlFor="invoice-date">Invoice Dt</label>
              <DatePickerInput
                id="invoice-date"
                value={draft.invoiceDate}
                onChange={(invoiceDate) => setDraft({ ...draft, invoiceDate })}
                ariaLabel="Invoice Date"
              />
            </div>
            {numberInput(qty)}
            {numberInput(amount)}
            {numberInput(gst)}
            <div className="do-info__field">
              <label htmlFor="invoice-final">Final Amount</label>
              <div className="invoice__input-group invoice__input-group--readonly">
                <span>₹</span>
                <input id="invoice-final" type="text" value={formatNumber(finalAmount)} readOnly />
              </div>
            </div>
            {rest.map(numberInput)}
            <div className="do-info__field">
              <label htmlFor="invoice-file">Download Invoice Copy</label>
              <input
                id="invoice-file"
                type="file"
                accept=".pdf,image/*"
                className="invoice__file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {saved.fileName && !file && <small className="invoice__file-note">Current: {saved.fileName}</small>}
            </div>
          </div>

          {error && (
            <p className="do-info__error" role="alert">
              {error}
            </p>
          )}

          <div className="do-info__actions">
            <button type="submit" className="do-info__btn do-info__btn--primary">
              <FiSave aria-hidden /> Save
            </button>
            <button type="button" className="do-info__btn do-info__btn--ghost" onClick={() => setEditing(false)}>
              <FiX aria-hidden /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="do-info__grid invoice__grid">
          {viewItem("Invoice No", saved.invoiceNo || "--")}
          {viewItem("Invoice Dt", saved.invoiceDate ? formatDisplayDate(saved.invoiceDate) : "--")}
          {[qty, amount, gst].map((field) => viewItem(field.label, withUnit(saved[field.key], field.prefix, field.suffix)))}
          {viewItem("Final Amount", withUnit(finalAmount, "₹"))}
          {rest.map((field) => viewItem(field.label, withUnit(saved[field.key], field.prefix, field.suffix)))}
          <div className="do-info__item">
            <dt>Download Invoice Copy</dt>
            <dd>
              {saved.fileUrl ? (
                <a href={saved.fileUrl} download={downloadName} className="invoice__download">
                  <FiDownload aria-hidden /> {downloadName}
                </a>
              ) : downloadName ? (
                <button type="button" className="invoice__download" onClick={handleGeneratedDownload}>
                  <FiDownload aria-hidden /> {downloadName}
                </button>
              ) : (
                "--"
              )}
            </dd>
          </div>
        </dl>
      )}
    </DetailSection>
  );
};

export default DispatchInvoiceDetails;
