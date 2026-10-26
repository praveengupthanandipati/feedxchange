import { FiLock } from "react-icons/fi";
import { useAuth } from "./AuthContext";

interface NoAccessProps {
  /** true when the account has no role / no permissions at all. */
  noRole?: boolean;
}

const NoAccess = ({ noRole = false }: NoAccessProps) => {
  const { roleName, logout } = useAuth();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" role="alert">
      <FiLock size={44} aria-hidden className="mb-3 text-secondary" />
      <h2 className="h4 mb-2">{noRole ? "No access assigned" : "You don't have access to this page"}</h2>
      <p className="text-secondary mb-4" style={{ maxWidth: 460 }}>
        {noRole
          ? "Your account has no role or permissions yet. Please contact your administrator."
          : `Your role${roleName ? ` (${roleName})` : ""} does not include this screen. If you need it, ask your administrator to update your role.`}
      </p>
      {noRole && (
        <button type="button" className="btn btn-outline-secondary" onClick={logout}>
          Sign out
        </button>
      )}
    </div>
  );
};

export default NoAccess;
