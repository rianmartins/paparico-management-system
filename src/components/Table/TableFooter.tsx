import cx from 'classnames';

import ChevronRightIcon from '@/icons/ChevronRightIcon';
import ChevronLeftIcon from '@/icons/ChevronLeftIcon';

import styles from './Table.module.css';
import type { TablePaginationState } from './type';
import { getCurrentPage, getTableFooterPageItems, getTotalPages } from './paginationUtils';

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
        Mostrando {startResult}-{endResult} de {pagination.total}
      </p>

      <nav aria-label="Table pagination" className={styles.paginationControls}>
        <button
          aria-label="Previous page"
          className={styles.paginationButton}
          disabled={disabled || currentPage === 1}
          onClick={() => handlePageSelect(currentPage - 1)}
          type="button"
        >
          <ChevronLeftIcon /> Anterior
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
          Próximo <ChevronRightIcon />
        </button>
      </nav>
    </div>
  );
}
