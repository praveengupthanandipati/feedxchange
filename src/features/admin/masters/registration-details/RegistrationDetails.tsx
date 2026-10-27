import { useCallback, useMemo, useState } from "react";
import { CircleCheckBigIcon } from "../../../../shared/components/icon";
import { initialRegistrations, REGISTRATION_STATUSES, type Registration, type RegistrationStatus, type RegistrationUpdate } from "./registrationDetails.data";
import { exportRegistrations, matchesSearch } from "./registrationDetails.utils";
import RegistrationCards from "./components/RegistrationCards";
import RegistrationFilters from "./components/RegistrationFilters";
import RegistrationHeader from "./components/RegistrationHeader";
import RegistrationPagination from "./components/RegistrationPagination";
import RegistrationTable from "./components/RegistrationTable";
import UpdateRegistrationOffcanvas from "./components/UpdateRegistrationOffcanvas";
import "./RegistrationDetails.scss";

const PAGE_SIZE = 10;

const RegistrationDetails = () => {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<Registration | null>(null);
  const [message, setMessage] = useState("");

  // Chip counts cover every registration, regardless of the filters.
  const counts = useMemo(() => {
    const result = Object.fromEntries(REGISTRATION_STATUSES.map((item) => [item, 0])) as Record<RegistrationStatus, number>;
    registrations.forEach((registration) => (result[registration.status] += 1));
    return result;
  }, [registrations]);

  // Newest registrations first.
  const filtered = useMemo(
    () =>
      registrations
        .filter((registration) => matchesSearch(registration, search) && (!status || registration.status === status))
        .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate)),
    [registrations, search, status],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = search.trim() || status ? "No registrations match the current filters." : "No registrations yet.";

  const changeStatus = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const closePanel = useCallback(() => setUpdating(null), []);

  const handleSave = (update: RegistrationUpdate) => {
    if (!updating) return;
    // TODO: send the update to the API once the endpoint is available.
    setRegistrations((prev) => prev.map((registration) => (registration.id === updating.id ? { ...registration, ...update } : registration)));
    setMessage(`${updating.name} updated to ${update.status}.`);
    closePanel();
  };

  return (
    <div className="registrations">
      <RegistrationHeader counts={counts} activeStatus={status} onStatusPick={changeStatus} />

      <RegistrationFilters
        search={search}
        status={status}
        resultCount={filtered.length}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={changeStatus}
        onExport={() => exportRegistrations(filtered)}
        onReset={() => {
          setSearch("");
          changeStatus("");
        }}
      />

      {message && (
        <p className="registrations__message" role="status">
          <CircleCheckBigIcon aria-hidden /> {message}
        </p>
      )}

      <RegistrationTable
        rows={paged}
        emptyMessage={emptyMessage}
        onUpdateStatus={(registration) => {
          setMessage("");
          setUpdating(registration);
        }}
      />
      <RegistrationCards
        rows={paged}
        emptyMessage={emptyMessage}
        onUpdateStatus={(registration) => {
          setMessage("");
          setUpdating(registration);
        }}
      />

      <RegistrationPagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      {updating && <UpdateRegistrationOffcanvas key={updating.id} registration={updating} onSave={handleSave} onClose={closePanel} />}
    </div>
  );
};

export default RegistrationDetails;
