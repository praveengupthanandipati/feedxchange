import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface DetailPaginationProps {
  page: number;
  pageSize: number;
  /** Rows on the current page. */
  shown: number;
  total: number;
  onPageChange: (page: number) => void;
}

const DetailPagination = ({ page, pageSize, shown, total, onPageChange }: DetailPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav className="estimation-detail__pagination" aria-label="Contracts pages">
      <p>{`Showing ${shown} of ${total} Results`}</p>
      <div className="estimation-detail__pages">
        <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <FiChevronLeft aria-hidden />
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
          <FiChevronRight aria-hidden />
        </button>
      </div>
    </nav>
  );
};

export default DetailPagination;
