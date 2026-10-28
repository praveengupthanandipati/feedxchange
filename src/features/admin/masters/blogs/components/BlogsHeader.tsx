import { EyeIcon, EyeOffIcon, PlusIcon } from "../../../../../shared/components/icon";

interface BlogsHeaderProps {
  filtersVisible: boolean;
  onToggleFilters: () => void;
  onNew: () => void;
}

const BlogsHeader = ({ filtersVisible, onToggleFilters, onNew }: BlogsHeaderProps) => (
  <div className="blogs__header">
    <h1>Blogs</h1>
    <div className="blogs__header-actions">
      <button type="button" className="blogs__btn blogs__btn--info" onClick={onToggleFilters} aria-expanded={filtersVisible} aria-controls="blogs-filters">
        {filtersVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
        {filtersVisible ? "Hide" : "Show"}
      </button>
      <button type="button" className="blogs__btn blogs__btn--navy" onClick={onNew}>
        <PlusIcon aria-hidden /> New
      </button>
    </div>
  </div>
);

export default BlogsHeader;
