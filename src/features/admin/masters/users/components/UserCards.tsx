import { fullName } from "../users.utils";
import { UserActions, UserEmail, UserPhone, UserStatusBadge } from "./UserBits";
import type { UserListProps } from "./UsersTable";

/** Phones and tablets: one card per user instead of the wide table. */
const UserCards = ({ rows, emptyMessage, onEdit, onDelete }: UserListProps) => (
  <ul className="users__cards">
    {rows.length === 0 && <li className="users__cards-empty">{emptyMessage}</li>}
    {rows.map((user) => (
      <li key={user.id} className="users__card">
        <div className="users__card-top">
          <strong>{fullName(user)}</strong>
          <div className="users__card-top-end">
            <UserStatusBadge status={user.status} />
            <UserActions user={user} onEdit={onEdit} onDelete={onDelete} menuAlign="right" />
          </div>
        </div>
        <dl>
          <div className="users__card-full">
            <dt>Email</dt>
            <dd>
              <UserEmail email={user.email} />
            </dd>
          </div>
          <div>
            <dt>Phone Number</dt>
            <dd>
              <UserPhone phone={user.phone} />
            </dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
          <div className="users__card-full">
            <dt>Business</dt>
            <dd>{user.business}</dd>
          </div>
        </dl>
      </li>
    ))}
  </ul>
);

export default UserCards;
