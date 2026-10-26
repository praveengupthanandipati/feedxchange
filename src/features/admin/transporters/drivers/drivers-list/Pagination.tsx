import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const start = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalResults);

  return (
    <div className="drivers-pagination">
      <p>
        {totalResults === 0 ? "Showing 0 Results" : `Showing ${start}-${end} of ${totalResults} Results`}
      </p>
      <div className="drivers-pagination__controls">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          aria-label="Previous page"
        >
          <FiChevronLeft aria-hidden />
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            className={page === currentPage ? "is-active" : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          aria-label="Next page"
        >
          <FiChevronRight aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
