import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeOffIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  TagIcon,
  TruckIcon,
} from "../../../../../shared/components/icon";
import ExportButtons from "../../../../../shared/components/table/ExportButtons";
import RowActionsMenu from "../../../../../shared/components/table/RowActionsMenu";
import ConfirmDialog from "../../../../../shared/components/dialog/ConfirmDialog";
import SuccessToast from "../../../../../shared/components/toast/SuccessToast";
import { useSuccessToast } from "../../../../../shared/components/toast/useSuccessToast";
import TransportersFilters from "./TransportersFilters";
import { ServingStateChips } from "../ServingLocations";
import Pagination from "./Pagination";
import { buildTransporterColumns } from "./transporters.columns";
import { buildFilterOptions } from "../../businessowners/BusinessList/Businessowners";
import {
  useGetTransporterProfileSummaryQuery,
  useLazyGetTransporterProfileByIdQuery,
  useDeleteTransporterProfileMutation,
  type Transporter,
  type TransporterProfileStatus,
} from "../../../../../core/store/transportersApi";
import "./Transporters.scss";

import Can from "../../../../../core/auth/Can";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";

const PAGE_SIZE = 10;
const DEFAULT_STATUS_FILTER: TransporterProfileStatus = "Active";

const StatusBadge = ({ status }: { status: TransporterProfileStatus }) => (
  <span className={`transporters__status transporters__status--${status.toLowerCase()}`}>
    {status}
  </span>
);

const Transprters = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTransporterProfileSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteTransporterProfile] = useDeleteTransporterProfileMutation();

  // The summary has no address: each transporter's location (primary address city) and state come from its
  // profile details, loaded in the background so the list shows straight away.
  const [loadProfile] = useLazyGetTransporterProfileByIdQuery();
  const [profileExtras, setProfileExtras] = useState<Record<number, { location: string; stateName: string }>>({});
  useEffect(() => {
    const ids = (data ?? []).map((row) => row.profileId).filter((id) => id && !(id in profileExtras));
    if (ids.length === 0) return;
    let active = true;
    void Promise.all(
      ids.map(async (id) => {
        try {
          const profile = await loadProfile(String(id), true).unwrap();
          const addresses = profile?.addresses ?? [];
          const primary = addresses.find((address) => address.isPrimary) ?? addresses[0];
          return [id, { location: primary?.city?.trim() ?? "", stateName: primary?.stateName?.trim() ?? "" }] as const;
        } catch {
          return [id, { location: "", stateName: "" }] as const;
        }
      }),
    ).then((entries) => {
      if (active) setProfileExtras((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loadProfile]);

  const rows = useMemo(
    () =>
      (data ?? []).map((row) => {
        const extra = profileExtras[row.profileId];
        if (!extra) return row;
        return { ...row, location: row.location || extra.location, stateName: row.stateName || extra.stateName };
      }),
    [data, profileExtras],
  );
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>(DEFAULT_STATUS_FILTER);
  const [transporterType, setTransporterType] = useState("All");
  const [state, setState] = useState("All");
  const [sourceState, setSourceState] = useState("All");
  const [destinationState, setDestinationState] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<Transporter | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { message: successMessage, showSuccessMessage } = useSuccessToast();

  const handleEdit = (transporter: Transporter) => {
    navigate(`/admin/transporters/profile?id=${transporter.profileId}`);
  };

  const handleView = (transporter: Transporter) => {
    navigate(`/admin/transporters/${transporter.profileId}`);
  };

  const handleDelete = (transporter: Transporter) => {
    setDeleteError(null);
    setPendingDeleteRow(transporter);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteRow) return;

    const modifiedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await deleteTransporterProfile({
        profileId: pendingDeleteRow.profileId,
        modifiedOn: new Date().toISOString(),
        modifiedBy,
      }).unwrap();
      setPendingDeleteRow(null);
      showSuccessMessage("Transporter deleted successfully");
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Failed to delete transporter."));
    }
  };

  const columns = useMemo(
    () => buildTransporterColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }),
    [],
  );

  const transporterTypeOptions = useMemo(
    () => buildFilterOptions(rows.map((row) => row.transporterTypeName)),
    [rows],
  );

  const stateOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.stateName)), [rows]);
  const sourceStateOptions = useMemo(() => buildFilterOptions(rows.flatMap((row) => row.sourceStates ?? [])), [rows]);
  const destinationStateOptions = useMemo(() => buildFilterOptions(rows.flatMap((row) => row.destinationStates ?? [])), [rows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, status, transporterType, state, sourceState, destinationState]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (status !== "All" && row.status !== status) return false;
      if (transporterType !== "All" && row.transporterTypeName !== transporterType) return false;
      if (state !== "All" && row.stateName !== state) return false;
      if (sourceState !== "All" && !(row.sourceStates ?? []).includes(sourceState)) return false;
      if (destinationState !== "All" && !(row.destinationStates ?? []).includes(destinationState)) return false;

      if (q) {
        const haystack = [
          row.legalName,
          row.transporterTypeName,
          row.location,
          row.stateName,
          row.mobileNumber,
          ...(row.sourceStates ?? []),
          ...(row.destinationStates ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, status, transporterType, state, sourceState, destinationState]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  return (
    <div className="transporters-page">
      <SuccessToast message={successMessage} />
      <div className="transporters-card">
        <div className="transporters-card__header">
          <h1>Transporters</h1>
          <div className="transporters-card__actions">
            <button
              type="button"
              className="transporters-btn transporters-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              {filtersVisible ? "Hide" : "Show"}
            </button>
            <ExportButtons name="Transporters" columns={columns} rows={filteredRows} />
            <Can any={["profiles.transporter.manage"]}>
              <button
                type="button"
                className="transporters-btn transporters-btn--primary"
                onClick={() => navigate("/admin/transporters/profile")}
              >
                <PlusIcon aria-hidden /> New
              </button>
            </Can>
          </div>
        </div>

        {filtersVisible && (
          <TransportersFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            status={status}
            onStatusChange={setStatus}
            transporterType={transporterType}
            onTransporterTypeChange={setTransporterType}
            transporterTypeOptions={transporterTypeOptions}
            state={state}
            onStateChange={setState}
            stateOptions={stateOptions}
            sourceState={sourceState}
            onSourceStateChange={setSourceState}
            sourceStateOptions={sourceStateOptions}
            destinationState={destinationState}
            onDestinationStateChange={setDestinationState}
            destinationStateOptions={destinationStateOptions}
            onClear={() => {
              setKeyword("");
              setStatus(DEFAULT_STATUS_FILTER);
              setTransporterType("All");
              setState("All");
              setSourceState("All");
              setDestinationState("All");
            }}
          />
        )}

        {isLoading ? (
          <p className="transporters-cards__message">Loading transporters…</p>
        ) : error ? (
          <p className="transporters-cards__message">Failed to load transporters.</p>
        ) : pagedRows.length === 0 ? (
          <p className="transporters-cards__message">No transporters match the current filters.</p>
        ) : (
          <div className="transporters-cards">
            {pagedRows.map((transporter) => (
              <article className="transporter-profile-card" key={transporter.profileId}>
                <div className="transporter-profile-card__topline">
                  <span className="transporter-profile-card__icon"><TruckIcon aria-hidden /></span>
                  <StatusBadge status={transporter.status} />
                  <div className="transporter-profile-card__actions">
                    <RowActionsMenu
                      manageKeys={["profiles.transporter.manage"]}
                      onView={() => handleView(transporter)}
                      onEdit={() => handleEdit(transporter)}
                      onDelete={() => handleDelete(transporter)}
                    />
                  </div>
                </div>

                <Link to={`/admin/transporters/${transporter.profileId}`} className="transporter-profile-card__name">
                  {transporter.legalName || transporter.tradingName || "Unnamed Transporter"}
                </Link>
                {transporter.tradingName && transporter.tradingName !== transporter.legalName && (
                  <p className="transporter-profile-card__trading-name">{transporter.tradingName}</p>
                )}

                <div className="transporter-profile-card__details">
                  <span><TagIcon aria-hidden /> {transporter.transporterTypeName || transporter.transporterSubTypeName || "Transporter type not specified"}</span>
                  <span><PhoneIcon aria-hidden /> {transporter.mobileNumber || "Phone not provided"}</span>
                  <span><MapPinIcon aria-hidden /> {[transporter.location, transporter.stateName].filter(Boolean).join(", ") || "Location not provided"}</span>
                </div>

                <div className="transporter-profile-card__serving">
                  <ServingStateChips source={transporter.sourceStates} destination={transporter.destinationStates} compact />
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
        title="Remove this transporter?"
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

export default Transprters;
