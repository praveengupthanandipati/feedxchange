import type { CSSProperties } from "react";
import { ArrowDownIcon, ArrowUpIcon, ReceiptIcon } from "../../../shared/components/icon";
import { formatRupees } from "../contracts/dashboard/contractsDashboard.utils";
import { useHomeLive } from "./homeLive";

const AVATAR_COLORS = ["var(--fx-amber-50)", "var(--fx-green-45)", "var(--fx-indigo-67)", "var(--fx-sky-60)", "var(--fx-pink-70)"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

/** Top five buyers by invoice amount in the chosen period: paid / pending, and up or down against the period before. */
const TopUsers = () => {
  const live = useHomeLive();
  const buyers = live?.topBuyers ?? null;
  const status = !live || (!buyers && !live.invoicesFailed) ? "Loading…" : live.invoicesFailed ? "Not available." : buyers?.length === 0 ? "No invoices in this period." : "";

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Top Buyers</h2>
        <span className="dashboard-card__sort">
          <strong>{live?.periodLabel}</strong>
        </span>
      </div>

      {status ? (
        <p className="dashboard-card__empty">{status}</p>
      ) : (
        <ul className="dashboard-users">
          {buyers?.map((buyer, index) => {
            const TrendIcon = buyer.trend === "up" ? ArrowUpIcon : ArrowDownIcon;
            return (
              <li key={buyer.name} className="dashboard-users__item">
                <span className="dashboard-users__avatar" style={{ "--avatar": AVATAR_COLORS[index % AVATAR_COLORS.length] } as CSSProperties}>
                  {initials(buyer.name)}
                </span>
                <div className="dashboard-users__info">
                  <p className="dashboard-users__name">{buyer.name}</p>
                  <p className="dashboard-users__location">
                    <ReceiptIcon aria-hidden /> {buyer.invoices} invoice{buyer.invoices === 1 ? "" : "s"}
                  </p>
                </div>
                <span className={`dashboard-users__status dashboard-users__status--${buyer.paid ? "success" : "cancel"}`}>{buyer.paid ? "Paid" : "Pending"}</span>
                <span className={`dashboard-users__amount dashboard-users__amount--${buyer.trend}`} title={buyer.trend === "up" ? "Up on the period before" : "Down on the period before"}>
                  {formatRupees(buyer.amount)} <TrendIcon aria-hidden />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TopUsers;
