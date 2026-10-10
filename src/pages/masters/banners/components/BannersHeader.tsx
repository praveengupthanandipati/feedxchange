import { FiPlusCircle, FiSearch } from "react-icons/fi";

interface BannersHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
}

const BannersHeader = ({ search, onSearchChange, onNew }: BannersHeaderProps) => (
  <>
    <div className="banners__header">
      <h1>Banners</h1>
      <button type="button" className="banners__btn banners__btn--navy" onClick={onNew}>
        <FiPlusCircle aria-hidden /> New
      </button>
    </div>
    <div className="banners__search">
      <FiSearch aria-hidden />
      <input type="search" placeholder="Search banners..." aria-label="Search banners" value={search} onChange={(event) => onSearchChange(event.target.value)} />
    </div>
  </>
);

export default BannersHeader;
