import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";

/** The "create" shortcuts: Alt + key opens the screen, on every admin screen (the dashboard also shows them as buttons). */
export const CREATE_SHORTCUTS = [
  { key: "c", label: "Create Contract", to: "/admin/contracts/new", permission: ["contracts.manage"] },
  { key: "i", label: "Create Seller Invoice", to: "/admin/payments/seller-invoice/add", permission: ["seller-invoice.view", "ADD_SELLER_INVOICE"] },
  { key: "p", label: "Create Payment", to: "/admin/payments/payment-advice/add", permission: ["payment-advice", "ADD_PAYMENT_ADVICE"] },
] as const;

/** Listens for Alt + C / I / P anywhere in the admin app (ignored while typing in a field, and without permission). */
export function useCreateShortcuts() {
  const navigate = useNavigate();
  const { can } = useAuth();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const shortcut = CREATE_SHORTCUTS.find((item) => item.key === event.key.toLowerCase() && can(...item.permission));
      if (!shortcut) return;
      event.preventDefault();
      navigate(shortcut.to);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate, can]);
}
