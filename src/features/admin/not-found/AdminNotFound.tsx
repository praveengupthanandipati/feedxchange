import { Link } from "react-router-dom";
import { ADMIN_HOME } from "../../../core/routes/adminPaths";

/** Shown inside the admin layout when an /admin address matches no screen. */
const AdminNotFound = () => (
  <div className="text-center py-5">
    <h1 className="h3 mb-2">Page not found</h1>
    <p className="text-secondary mb-3">There is no screen at this address.</p>
    <Link to={ADMIN_HOME} className="btn btn-primary">Go to the dashboard</Link>
  </div>
);

export default AdminNotFound;
