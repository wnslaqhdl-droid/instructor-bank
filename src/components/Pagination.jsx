export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {

  if (totalPages <= 1) return null;

  function buildPages() {
    const pages = [];

    pages.push(1);

    const start = Math.max(
      currentPage - 2,
      2
    );

    const end = Math.min(
      currentPage + 2,
      totalPages - 1
    );

    if (start > 2) {
      pages.push("start-ellipsis");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("end-ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  const pages = buildPages();

  return (
    <div className="pagination">

      <button
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(currentPage - 1)
        }
      >
        이전
      </button>

      {pages.map((page, index) => {

        if (
          page === "start-ellipsis" ||
          page === "end-ellipsis"
        ) {
          return (
            <span
              key={`ellipsis-${index}`}
              className="pagination-ellipsis"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={`page-${page}-${index}`}
            className={
              currentPage === page
                ? "page-btn active"
                : "page-btn"
            }
            onClick={() =>
              onPageChange(page)
            }
          >
            {page}
          </button>
        );
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() =>
          onPageChange(currentPage + 1)
        }
      >
        다음
      </button>

    </div>
  );
}
