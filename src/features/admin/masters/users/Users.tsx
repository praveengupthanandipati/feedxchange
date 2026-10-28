import { useCallback, useState } from "react";
import { CircleCheckBigIcon } from "../../../../shared/components/icon";
import ConfirmDialog from "../../../../shared/components/dialog/ConfirmDialog";
import { CURRENT_ADMIN, initialUsers, type MasterUser, type UserForm } from "./users.data";
import { digitsOnly, fullName } from "./users.utils";
import UserCards from "./components/UserCards";
import UserOffcanvas from "./components/UserOffcanvas";
import UsersHeader from "./components/UsersHeader";
import UsersPagination from "./components/UsersPagination";
import UsersTable from "./components/UsersTable";
import "./Users.scss";

const PAGE_SIZE = 10;

/** Which user the panel is open for: a new one, an existing one, or closed. */
type PanelState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; user: MasterUser };

const Users = () => {
  const [users, setUsers] = useState<MasterUser[]>(initialUsers);
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [deleting, setDeleting] = useState<MasterUser | null>(null);
  const [message, setMessage] = useState("");

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = "No users yet. Use New to add one.";

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);

  const openPanel = (next: PanelState) => {
    setMessage("");
    setPanel(next);
  };

  const handleSave = (form: UserForm) => {
    // The password goes to the API only; it is never kept in the list.
    const { password: _password, active, ...rest } = form;
    const values = {
      ...rest,
      firstName: rest.firstName.trim(),
      lastName: rest.lastName.trim(),
      email: rest.email.trim(),
      phone: digitsOnly(rest.phone),
      altPhone: digitsOnly(rest.altPhone),
      address: rest.address.trim(),
      postalCode: rest.postalCode.trim(),
      city: rest.city.trim(),
      state: rest.state.trim(),
      country: rest.country.trim(),
      status: active ? ("Active" as const) : ("Inactive" as const),
    };
    const name = `${values.firstName} ${values.lastName}`.trim();
    // TODO: send the user (with the password) to the API once the endpoint is available.
    if (panel.mode === "edit") {
      setUsers((prev) => prev.map((user) => (user.id === panel.user.id ? { ...user, ...values } : user)));
      setMessage(`${name} updated.`);
    } else {
      setUsers((prev) => [{ id: `${Date.now()}`, ...values }, ...prev]);
      setMessage(`${name} created.`);
      setPage(1);
    }
    closePanel();
  };

  return (
    <div className="users">
      <UsersHeader business={CURRENT_ADMIN.isSsrtsAdmin ? "" : CURRENT_ADMIN.business} onNew={() => openPanel({ mode: "create" })} />

      {message && (
        <p className="users__message" role="status">
          <CircleCheckBigIcon aria-hidden /> {message}
        </p>
      )}

      <UsersTable rows={paged} emptyMessage={emptyMessage} onEdit={(user) => openPanel({ mode: "edit", user })} onDelete={setDeleting} />
      <UserCards rows={paged} emptyMessage={emptyMessage} onEdit={(user) => openPanel({ mode: "edit", user })} onDelete={setDeleting} />

      <UsersPagination page={currentPage} pageSize={PAGE_SIZE} total={users.length} onPageChange={setPage} />

      {panel.mode !== "closed" && (
        <UserOffcanvas
          // A fresh form each time the panel opens for a different user.
          key={panel.mode === "edit" ? panel.user.id : "new"}
          user={panel.mode === "edit" ? panel.user : null}
          users={users}
          onSave={handleSave}
          onClose={closePanel}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete user"
        message={deleting ? `Delete ${fullName(deleting)}? This cannot be undone.` : ""}
        onConfirm={() => {
          // TODO: send the delete to the API once the endpoint is available.
          if (deleting) {
            setUsers((prev) => prev.filter((user) => user.id !== deleting.id));
            setMessage(`${fullName(deleting)} deleted.`);
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default Users;
