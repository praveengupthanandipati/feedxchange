import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type { PageAction } from "./menu";

interface CanProps {
  /** Show the children when the user holds ANY of these permission keys. */
  any?: string[];
  /** Or ask by screen instead: the page key from the Pages table plus the action (needs the menu from /api/Access/menu). */
  page?: string;
  action?: PageAction;
  /** Rendered instead when the user does not (default: nothing). */
  fallback?: ReactNode;
  children: ReactNode;
}

/** `<Can any={["products.manage"]}>…</Can>`   or   `<Can page="products" action="create">…</Can>` */
const Can = ({ any = [], page, action = "view", fallback = null, children }: CanProps) => {
  const { can, canPage } = useAuth();
  const allowed = page ? canPage(page, action) : can(...any);
  return <>{allowed ? children : fallback}</>;
};

export default Can;
