import { ChevronLeftIcon, ChevronRightIcon } from "../../../../../shared/components/icon";

interface UsersPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const UsersPagination = ({ page, pageSize, total, onPageChange }: UsersPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return (
    <nav className="users__pagination" aria-label="User pages">
      <p>{total === 0 ? "Showing 0 Results" : `Showing ${start + 1}-${Math.min(start + pageSize, total)} of ${total} Results`}</p>
      <div className="users__pages">
        <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeftIcon aria-hidden />
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <button
            key={number}
            type="button"
            className={number === page ? "is-active" : ""}
            onClick={() => onPageChange(number)}
            aria-current={number === page ? "page" : undefined}
          >
            {number}
          </button>
        ))}
        <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRightIcon aria-hidden />
        </button>
      </div>
    </nav>
  );
};

export default UsersPagination;
