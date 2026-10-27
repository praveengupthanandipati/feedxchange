import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiClock,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiMail,
  FiPhone,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import RowActionsMenu from "../../../../components/table/RowActionsMenu";
import type { TableColumn } from "../../../../components/table/table.types";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import PromotersFilters from "./PromotersFilters";
import Pagination from "./Pagination";
import { buildPromoterColumns } from "./promoters.columns";
import { buildFilterOptions } from "../../businessowners/BusinessList/Businessowners";
import SuccessToast from "../../../../components/toast/SuccessToast";
import { useSuccessToast } from "../../../../components/toast/useSuccessToast";
import {
  useGetPromoterProfileSummaryQuery,
  useDeletePromoterProfileMutation,
  type Promoter,
  type PromoterProfileStatus,
} from "../../../../store/promotersApi";
import "./Promoters.scss";
import Can from "../../../../auth/Can";

const PAGE_SIZE = 10;
const DEFAULT_STATUS_FILTER: PromoterProfileStatus = "Active";

function getExportCellValue(row: Promoter, column: TableColumn<Promoter>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Promoterlist = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetPromoterProfileSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deletePromoterProfile] = useDeletePromoterProfileMutation();
  const rows = useMemo(() => data ?? [], [data]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>(DEFAULT_STATUS_FILTER);
  const [commissionStructure, setCommissionStructure] = useState("All");
  const [paymentFrequency, setPaymentFrequency] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Promoter | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { message: successMessage, showSuccessMessage } = useSuccessToast();

  const handleEdit = (promoter: Promoter) => {
    navigate(`/promoters/profile?id=${promoter.profileId}`);
  };

  const handleView = (promoter: Promoter) => {
    navigate(`/promoters/${promoter.profileId}`);
  };

  const handleDelete = (promoter: Promoter) => {
    setDeleteError(null);
    setPendingDeleteRow(promoter);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteRow) return;

    const modifiedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await deletePromoterProfile({
        profileId: pendingDeleteRow.profileId,
        modifiedOn: new Date().toISOString(),
        modifiedBy,
      }).unwrap();
      setPendingDeleteRow(null);
      showSuccessMessage("Promoter deleted successfully");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete promoter.");
    }
  };

  const columns = buildPromoterColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete });

  const commissionStructureOptions = useMemo(
    () => buildFilterOptions(rows.map((row) => row.commissionStructure)),
    [rows],
  );
  const paymentFrequencyOptions = useMemo(
    () => buildFilterOptions(rows.map((row) => row.paymentFrequency)),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, status, commissionStructure, paymentFrequency]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (status !== "All" && row.status !== status) return false;
      if (commissionStructure !== "All" && row.commissionStructure !== commissionStructure) return false;
      if (paymentFrequency !== "All" && row.paymentFrequency !== paymentFrequency) return false;

      if (q) {
        const haystack = [row.legalName, row.tradingName, row.companyName, row.mobileNumber, row.emailId]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, status, commissionStructure, paymentFrequency]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleExport = () => {
    const exportColumns = columns.filter((column) => column.key !== "actions");
    const headerRow = exportColumns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = exportColumns
          .map((column) => `<td>${escapeHtml(getExportCellValue(row, column))}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promoters.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="promoters-page">
      <SuccessToast message={successMessage} />
      <div className="promoters-card">
        <div className="promoters-card__header">
          <h1>Promoters</h1>
          <div className="promoters-card__actions">
            <button
              type="button"
              className="promoters-btn promoters-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              type="button"
              className="promoters-btn promoters-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <Can any={["profiles.promoter.manage"]}>
              <button
                type="button"
                className="promoters-btn promoters-btn--primary"
                onClick={() => navigate("/promoters/profile")}
              >
                <FiPlus aria-hidden /> New
              </button>
            </Can>
          </div>
        </div>

        {filtersVisible && (
          <PromotersFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            status={status}
            onStatusChange={setStatus}
            commissionStructure={commissionStructure}
            onCommissionStructureChange={setCommissionStructure}
            commissionStructureOptions={commissionStructureOptions}
            paymentFrequency={paymentFrequency}
            onPaymentFrequencyChange={setPaymentFrequency}
            paymentFrequencyOptions={paymentFrequencyOptions}
          />
        )}

        {isLoading ? (
          <div className="promoter-cards__message" role="status">Loading promoters…</div>
        ) : error ? (
          <div className="promoter-cards__message promoter-cards__message--error" role="alert">
            Failed to load promoters.
          </div>
        ) : pagedRows.length === 0 ? (
          <div className="promoter-cards__message">No promoters match the current filters.</div>
        ) : (
          <div className="promoter-cards">
            {pagedRows.map((promoter) => (
              <article className="promoter-profile-card" key={promoter.profileId}>
                <div className="promoter-profile-card__topline">
                  <span className="promoter-profile-card__icon"><FiBriefcase aria-hidden /></span>
                  <span className={`promoters__status promoters__status--${promoter.status.toLowerCase()}`}>
                    {promoter.status}
                  </span>
                  <div className="promoter-profile-card__actions">
                    <RowActionsMenu
                      manageKeys={["profiles.promoter.manage"]}
                      onView={() => handleView(promoter)}
                      onEdit={() => handleEdit(promoter)}
                      onDelete={() => handleDelete(promoter)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="promoter-profile-card__name"
                  onClick={() => handleView(promoter)}
                >
                  {promoter.legalName || promoter.tradingName || "Unnamed Promoter"}
                </button>
                {promoter.tradingName && promoter.tradingName !== promoter.legalName && (
                  <p className="promoter-profile-card__trading-name">{promoter.tradingName}</p>
                )}

                <div className="promoter-profile-card__details">
                  <span><FiPhone aria-hidden /> {promoter.mobileNumber || "Phone not provided"}</span>
                  <span><FiMail aria-hidden /> {promoter.emailId || "Email not provided"}</span>
                  <span>
                    <FiUsers aria-hidden /> {promoter.totalActiveReferrals.toLocaleString("en-IN")} active /{" "}
                    {promoter.totalReferrals.toLocaleString("en-IN")} total referrals
                  </span>
                  <span><FiClock aria-hidden /> {promoter.paymentFrequency || "Payment frequency not specified"}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          totalResults={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDialog
        open={pendingDeleteRow !== null}
        title="Remove this promoter?"
        message={
          deleteError ||
          `This will permanently delete "${pendingDeleteRow?.legalName}". This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRow(null)}
      />
    </div>
  );
};

export default Promoterlist;
