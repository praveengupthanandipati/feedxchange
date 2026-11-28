import type { DashboardProfileOption } from "../../../../core/store/businessDashboardApi";

/** Which side of a contract the signed-in business is on. */
export type ContractSide = "Sell" | "Buy" | "Buy & Sell";

/**
 * The profile ids that count as "your side": the chosen business, or (on "All") the owner's own business and its linked businesses.
 * `null` for FeedXchange staff, who have no business of their own, so no Side column is shown.
 */
export const sideProfileIds = (options: DashboardProfileOption[], selectedId: number | null): number[] | null =>
  options.some((option) => option.isOwn) ? (selectedId !== null ? [selectedId] : options.map((option) => option.profileId)) : null;

/** Sell = the business is the seller, Buy = the buyer, Buy & Sell = both parties are its own / linked businesses. */
export const sideOf = (ids: number[], sellerId: number | null | undefined, buyerId: number | null | undefined): ContractSide | null => {
  const seller = sellerId != null && ids.includes(Number(sellerId));
  const buyer = buyerId != null && ids.includes(Number(buyerId));
  return seller && buyer ? "Buy & Sell" : seller ? "Sell" : buyer ? "Buy" : null;
};

const COLORS: Record<ContractSide, string> = { Sell: "#15803d", Buy: "#1d4ed8", "Buy & Sell": "#7c3aed" };
const HINTS: Record<ContractSide, string> = {
  Sell: "Your business is the seller of this contract",
  Buy: "Your business is the buyer of this contract",
  "Buy & Sell": "Your businesses are both the seller and the buyer",
};

/** The coloured tag of the Side column. */
export const SideTag = ({ side }: { side: ContractSide | null }) => {
  if (!side) return <>—</>;
  const color = COLORS[side];
  return (
    <span
      style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color, background: `${color}1a`, whiteSpace: "nowrap" }}
      title={HINTS[side]}
    >
      {side}
    </span>
  );
};
