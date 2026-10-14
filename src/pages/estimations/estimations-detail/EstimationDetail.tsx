import { useMemo, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import { EMPTY_DATES, estimationDetails, type DetailFilters as Filters } from "./estimationDetail.data";
import { downloadEstimation, lineCommission, printEstimation, summariseByRate, type DetailTotals } from "./estimationDetail.utils";
import DetailFilters from "./components/DetailFilters";
import DetailHeader from "./components/DetailHeader";
import DetailLineCards from "./components/DetailLineCards";
import DetailLinesTable from "./components/DetailLinesTable";
import DetailPagination from "./components/DetailPagination";
import DetailStats from "./components/DetailStats";
import DetailSummary from "./components/DetailSummary";
import "./EstimationDetail.scss";

const PAGE_SIZE = 10;
const VIEW_PATH = "/estimations/view";

const estimateOptions = estimationDetails.map((record) => ({
  value: record.id,
  label: record.partyName ? `${record.estimateNo} - ${record.partyName}` : record.estimateNo,
}));

const EstimationDetail = () => {
  // The estimate comes from ?id= (View Estimations links here); without one, the first estimate shows.
  const [searchParams, setSearchParams] = useSearchParams();
  const estimateId = searchParams.get("id") ?? estimationDetails[0]?.id ?? "";
  const record = estimationDetails.find((item) => item.id === estimateId);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<Filters>({ estimateId, ...EMPTY_DATES });
  const [dates, setDates] = useState(EMPTY_DATES);
  const [page, setPage] = useState(1);
  // Difference edits are kept per estimate, so switching back and forth doesn't lose them.
  const [differences, setDifferences] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const lines = useMemo(
    () =>
      (record?.lines ?? []).filter((line) => {
        if (dates.from && line.contractDate < dates.from) return false;
        if (dates.to && line.contractDate > dates.to) return false;
        return true;
      }),
    [record, dates],
  );

  const summary = useMemo(() => summariseByRate(lines), [lines]);

  if (!record) {
    return (
      <div className="estimation-detail">
        <p className="estimation-detail__notice" role="alert">
          <FiAlertCircle aria-hidden /> Estimate not found. It may have been deleted.
        </p>
        <Link to={VIEW_PATH} className="estimation-detail__btn estimation-detail__btn--navy estimation-detail__btn--fit">
          Back to View Estimations
        </Link>
      </div>
    );
  }

  const difference = differences[record.id] ?? String(record.difference);
  const grossAmount = lines.reduce((sum, line) => sum + lineCommission(line), 0);
  const totals: DetailTotals = {
    totalMt: lines.reduce((sum, line) => sum + line.quantityMt, 0),
    grossAmount,
    difference: Number(difference) || 0,
    totalAmount: grossAmount + (Number(difference) || 0),
  };

  const emptyMessage = record.lines.length === 0 ? "No contracts recorded for this estimate yet." : "No contracts in this estimate match the selected dates.";
  const totalPages = Math.max(1, Math.ceil(lines.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = lines.slice(start, start + PAGE_SIZE).map((line, index) => ({ ...line, sNo: start + index + 1 }));

  const handleShow = () => {
    if (draft.estimateId && draft.estimateId !== record.id) setSearchParams({ id: draft.estimateId });
    setDates({ from: draft.from, to: draft.to });
    setPage(1);
    setNotice("");
  };

  const handleReset = () => {
    setDraft({ estimateId: record.id, ...EMPTY_DATES });
    setDates(EMPTY_DATES);
    setPage(1);
    setNotice("");
  };

  const handlePrint = () => {
    if (!printEstimation(record, lines, totals)) setNotice("Allow pop-ups for this site to print the estimate.");
  };

  return (
    <div className="estimation-detail">
      <DetailHeader
        backTo={VIEW_PATH}
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible((prev) => !prev)}
        onPrint={handlePrint}
        onDownload={() => downloadEstimation(record, lines, totals)}
        canExport={lines.length > 0}
      />

      {filtersVisible && <DetailFilters value={draft} estimateOptions={estimateOptions} onChange={setDraft} onShow={handleShow} onReset={handleReset} />}

      {notice && (
        <p className="estimation-detail__notice" role="alert">
          <FiAlertCircle aria-hidden /> {notice}
        </p>
      )}

      <DetailStats record={record} totals={totals} />

      <DetailLinesTable rows={paged} emptyMessage={emptyMessage} />
      <DetailLineCards rows={paged} emptyMessage={emptyMessage} />

      <DetailPagination page={currentPage} pageSize={PAGE_SIZE} shown={paged.length} total={lines.length} onPageChange={setPage} />

      <DetailSummary
        lines={summary}
        totals={totals}
        difference={difference}
        onDifferenceChange={(value) => setDifferences((prev) => ({ ...prev, [record.id]: value }))}
      />
    </div>
  );
};

export default EstimationDetail;
