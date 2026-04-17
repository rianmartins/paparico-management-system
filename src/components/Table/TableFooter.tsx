import cx from 'classnames';

import styles from './Table.module.css';
import type { TablePaginationState } from './type';

type TableFooterPageItem = number | 'ellipsis';

const leadingPageCount = 3;

function getTotalPages(total: number, limit: number) {
  if (total <= 0 || limit <= 0) {
    return 0;
  }

  return Math.ceil(total / limit);
}

function getCurrentPage(offset: number, limit: number, totalPages: number) {
  if (limit <= 0 || totalPages <= 0) {
    return 1;
  }

  const currentPage = Math.floor(Math.max(offset, 0) / limit) + 1;

  return Math.min(Math.max(currentPage, 1), totalPages);
}

export function getTableFooterPageItems(currentPage: number, totalPages: number): TableFooterPageItem[] {
  if (totalPages <= 0) {
    return [];
  }

  const visiblePages = new Set<number>([currentPage, totalPages]);
  const leadingPages = Math.min(leadingPageCount, totalPages);

  for (let page = 1; page <= leadingPages; page += 1) {
    visiblePages.add(page);
  }

  return [...visiblePages]
    .sort((leftPage, rightPage) => leftPage - rightPage)
    .reduce<TableFooterPageItem[]>((items, page) => {
      const previousItem = items.at(-1);

      if (typeof previousItem === 'number' && page - previousItem > 1) {
        items.push('ellipsis');
      }

      items.push(page);

      return items;
    }, []);
}

type TableFooterProps = {
  disabled?: boolean;
  pagination: TablePaginationState;
};

export default function TableFooter({ disabled = false, pagination }: TableFooterProps) {
  const totalPages = getTotalPages(pagination.total, pagination.limit);

  if (totalPages <= 1) {
    return null;
  }

  const currentPage = getCurrentPage(pagination.offset, pagination.limit, totalPages);
  const pageItems = getTableFooterPageItems(currentPage, totalPages);
  const startResult = pagination.total === 0 ? 0 : Math.min(pagination.offset + 1, pagination.total);
  const endResult = Math.min(pagination.offset + pagination.limit, pagination.total);

  function handlePageSelect(page: number) {
    pagination.onPageChange({
      page,
      offset: (page - 1) * pagination.limit,
      limit: pagination.limit
    });
  }

  return (
    <div className={styles.TableFooter}>
      <p className={styles.paginationSummary}>
        Showing {startResult}-{endResult} of {pagination.total}
      </p>

      <nav aria-label="Table pagination" className={styles.paginationControls}>
        <button
          aria-label="Previous page"
          className={styles.paginationButton}
          disabled={disabled || currentPage === 1}
          onClick={() => handlePageSelect(currentPage - 1)}
          type="button"
        >
          Prev
        </button>

        {pageItems.map((pageItem, index) =>
          pageItem === 'ellipsis' ? (
            <span className={styles.paginationEllipsis} key={`ellipsis-${index}`}>
              ...
            </span>
          ) : (
            <button
              aria-current={pageItem === currentPage ? 'page' : undefined}
              aria-label={pageItem === currentPage ? `Page ${pageItem}, current page` : `Page ${pageItem}`}
              className={cx(styles.paginationButton, pageItem === currentPage && styles.activePaginationButton)}
              disabled={disabled || pageItem === currentPage}
              key={pageItem}
              onClick={() => handlePageSelect(pageItem)}
              type="button"
            >
              {pageItem}
            </button>
          )
        )}

        <button
          aria-label="Next page"
          className={styles.paginationButton}
          disabled={disabled || currentPage === totalPages}
          onClick={() => handlePageSelect(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
