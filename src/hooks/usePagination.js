import { useState } from 'react';

/**
 * Hook for pagination logic
 * @param {Object} options
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialLimit=10]
 * @param {number} [options.total=0]
 */
export const usePagination = ({ initialPage = 1, initialLimit = 10, total = 0 } = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canNext = page < totalPages;
  const canPrevious = page > 1;

  const nextPage = () => {
    if (canNext) setPage((p) => p + 1);
  };

  const previousPage = () => {
    if (canPrevious) setPage((p) => p - 1);
  };

  const goToPage = (p) => {
    const pageNumber = Math.max(1, Math.min(p, totalPages));
    setPage(pageNumber);
  };

  return {
    page,
    limit,
    setPage: goToPage,
    setLimit,
    nextPage,
    previousPage,
    canNext,
    canPrevious,
    totalPages,
    total,
  };
};
