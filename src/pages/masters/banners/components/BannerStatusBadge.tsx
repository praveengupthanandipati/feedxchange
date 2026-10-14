import type { BannerStatus } from "../banners.data";

const BannerStatusBadge = ({ status }: { status: BannerStatus }) => (
  <span className={`banners__status banners__status--${status.toLowerCase()}`}>{status}</span>
);

export default BannerStatusBadge;
