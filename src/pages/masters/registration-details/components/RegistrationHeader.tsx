import { REGISTRATION_STATUSES, type RegistrationStatus } from "../registrationDetails.data";
import { statusSlug } from "../registrationDetails.utils";

interface RegistrationHeaderProps {
  counts: Record<RegistrationStatus, number>;
  activeStatus: string;
  /** Picking the active chip again clears the filter. */
  onStatusPick: (status: string) => void;
}

/** Title plus one count chip per status; each chip doubles as a quick filter. */
const RegistrationHeader = ({ counts, activeStatus, onStatusPick }: RegistrationHeaderProps) => (
  <div className="registrations__header">
    <h1>Registration Details</h1>
    <div className="registrations__chips" role="group" aria-label="Filter by status">
      {REGISTRATION_STATUSES.map((status) => {
        const active = activeStatus === status;
        return (
          <button
            key={status}
            type="button"
            className={`registrations__chip ${active ? "is-active" : ""}`}
            onClick={() => onStatusPick(active ? "" : status)}
            aria-pressed={active}
          >
            {status}
            <span className={`registrations__chip-count registrations__chip-count--${statusSlug(status)}`}>{counts[status]}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default RegistrationHeader;
