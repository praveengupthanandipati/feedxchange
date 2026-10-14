import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import { EMPTY_FILTERS, estimations as initialEstimations, type Estimation, type EstimationFilters } from "./viewEstimation.data";
import { dataShowingLabel, displayAmount, downloadEstimation, matchesFilters, uniqueOptions } from "./viewEstimation.utils";
import EditEstimationModal from "./components/EditEstimationModal";
import EstimationCards from "./components/EstimationCards";
import EstimationsFilters from "./components/EstimationsFilters";
import EstimationsHeader from "./components/EstimationsHeader";
import EstimationsPagination from "./components/EstimationsPagination";
import EstimationsTable from "./components/EstimationsTable";
import "./ViewEstimations.scss";

const PAGE_SIZE = 10;
const EMPTY_MESSAGE = "No estimations match the current filters.";

const ViewEstimations = () => {
  const navigate = useNavigate();
  const [estimations, setEstimations] = useState<Estimation[]>(initialEstimations);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [draft, setDraft] = useState<EstimationFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<EstimationFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Estimation | null>(null);
  const [deleting, setDeleting] = useState<Estimation | null>(null);
  const [message, setMessage] = useState("");

  const partyOptions = useMemo(() => uniqueOptions(estimations.map((estimation) => estimation.partyName)), [estimations]);
  const filtered = useMemo(() => estimations.filter((estimation) => matchesFilters(estimation, applied)), [estimations, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE).map((estimation, index) => ({ ...estimation, sNo: start + index + 1 }));

  const handleShow = () => {
    setApplied(draft);
    setPage(1);
    setMessage("");
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
    setMessage("");
  };

  const handlers = {
    onDownload: downloadEstimation,
    onView: (estimation: Estimation) => navigate(`/estimations/detail?id=${encodeURIComponent(estimation.id)}`),
    onEdit: setEditing,
    onDelete: setDeleting,
  };

  return (
    <div className="view-estimations">
      <EstimationsHeader dataShowing={dataShowingLabel(applied)} filtersVisible={filtersVisible} onToggleFilters={() => setFiltersVisible((prev) => !prev)} />

      {filtersVisible && <EstimationsFilters value={draft} partyOptions={partyOptions} onChange={setDraft} onShow={handleShow} onReset={handleReset} />}

      {message && (
        <p className="view-estimations__message" role="status">
          <FiCheckCircle aria-hidden /> {message}
        </p>
      )}

      <EstimationsTable rows={paged} emptyMessage={EMPTY_MESSAGE} {...handlers} />
      <EstimationCards rows={paged} emptyMessage={EMPTY_MESSAGE} {...handlers} />

      <EstimationsPagination page={currentPage} pageSize={PAGE_SIZE} shown={paged.length} total={filtered.length} onPageChange={setPage} />


      {editing && (
        <EditEstimationModal
          estimation={editing}
          onClose={() => setEditing(null)}
          onSave={(changes) => {
            // TODO: send the update to the API once the endpoint is available.
            setEstimations((prev) => prev.map((estimation) => (estimation.id === editing.id ? { ...estimation, ...changes } : estimation)));
            setMessage(`${editing.estimateNo} updated.`);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete estimation"
        message={deleting ? `Delete ${deleting.estimateNo} (${displayAmount(deleting.netAmount)})? This cannot be undone.` : ""}
        onConfirm={() => {
          // TODO: send the delete to the API once the endpoint is available.
          if (deleting) {
            setEstimations((prev) => prev.filter((estimation) => estimation.id !== deleting.id));
            setMessage(`${deleting.estimateNo} deleted.`);
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default ViewEstimations;
