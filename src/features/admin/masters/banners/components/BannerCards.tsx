import BannerActions from "./BannerActions";
import BannerStatusBadge from "./BannerStatusBadge";
import type { BannerListProps } from "./BannersTable";

/** Phones: one card per banner instead of the table. */
const BannerCards = ({ rows, emptyMessage, onEdit, onDelete }: BannerListProps) => (
  <ul className="banners__cards">
    {rows.length === 0 && <li className="banners__cards-empty">{emptyMessage}</li>}
    {rows.map((banner) => (
      <li key={banner.id} className="banners__card">
        <img className="banners__card-image" src={banner.image} alt={banner.title} loading="lazy" />
        <div className="banners__card-body">
          <div className="banners__card-top">
            <strong>{banner.title}</strong>
            <BannerActions banner={banner} onEdit={onEdit} onDelete={onDelete} />
          </div>
          <p className="banners__url">{banner.linkUrl}</p>
          <div className="banners__card-meta">
            <span>Priority {banner.priority}</span>
            <BannerStatusBadge status={banner.status} />
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default BannerCards;
