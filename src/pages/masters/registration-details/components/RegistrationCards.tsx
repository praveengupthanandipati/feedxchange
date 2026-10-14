import { formatRegistrationDate } from "../registrationDetails.utils";
import { RegistrationActions, RegistrationEmail, RegistrationPhone, RegistrationStatusBadge } from "./RegistrationBits";
import type { RegistrationListProps } from "./RegistrationTable";

/** Phones and tablets: one card per registration instead of the wide table. */
const RegistrationCards = ({ rows, emptyMessage, onUpdateStatus }: RegistrationListProps) => (
  <ul className="registrations__cards">
    {rows.length === 0 && <li className="registrations__cards-empty">{emptyMessage}</li>}
    {rows.map((row) => (
      <li key={row.id} className="registrations__card">
        <div className="registrations__card-top">
          <strong>{row.name}</strong>
          <div className="registrations__card-top-end">
            <RegistrationStatusBadge status={row.status} />
            <RegistrationActions registration={row} onUpdateStatus={onUpdateStatus} menuAlign="right" />
          </div>
        </div>
        <dl>
          <div className="registrations__card-full">
            <dt>Email</dt>
            <dd>
              <RegistrationEmail email={row.email} />
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              <RegistrationPhone phone={row.phone} />
            </dd>
          </div>
          <div>
            <dt>Registration Date</dt>
            <dd>{formatRegistrationDate(row.registrationDate)}</dd>
          </div>
          <div>
            <dt>Business Name</dt>
            <dd>{row.businessName}</dd>
          </div>
          <div>
            <dt>Line of Business</dt>
            <dd>{row.lineOfBusiness}</dd>
          </div>
          <div className="registrations__card-full">
            <dt>Referral Code</dt>
            <dd>{row.referralCode || "—"}</dd>
          </div>
        </dl>
      </li>
    ))}
  </ul>
);

export default RegistrationCards;
