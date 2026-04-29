'use client';

import { useState } from 'react';
import cx from 'classnames';

import Button from '@/components/Button';

import TableFooter from './TableFooter';
import styles from './Table.module.css';
import type { TableColumn, TableProps, TableSortState } from './type';
import {
  compareSortValues,
  getColumnVisibilityClass,
  getNextSortState,
  getRowKey,
  getSortAriaSort,
  resolveCellValue,
  resolveSortValue
} from './utils';

export default function Table<TData>({
  className = '',
  columns,
  data,
  defaultSortState = null,
  emptyMessage = 'No results found.',
  isLoading = false,
  onRowClick,
  onSortChange,
  pagination,
  rowActions,
  rowKey,
  sortState,
  tableClassName = ''
}: TableProps<TData>) {
  const [internalSortState, setInternalSortState] = useState<TableSortState | null>(defaultSortState);
  const activeSortState = sortState === undefined ? internalSortState : sortState;
  const visibleColumns = [...columns];
  const colSpan = visibleColumns.length + (rowActions?.length ? 1 : 0);

  const sortedData = (() => {
    if (!activeSortState) {
      return data;
    }

    const column = columns.find((candidate) => candidate.id === activeSortState.columnId);

    if (!column?.sortable) {
      return data;
    }

    return [...data].sort((leftRow, rightRow) => {
      const comparison = compareSortValues(resolveSortValue(leftRow, column), resolveSortValue(rightRow, column));

      return activeSortState.direction === 'asc' ? comparison : comparison * -1;
    });
  })();

  function handleSort(column: TableColumn<TData>) {
    if (!column.sortable) {
      return;
    }

    const nextSortState = getNextSortState(activeSortState, column.id);

    if (sortState === undefined) {
      setInternalSortState(nextSortState);
    }

    onSortChange?.(nextSortState);
  }

  return (
    <div className={cx(styles.TableWrapper, className)} data-testid="table-wrapper">
      <div className={styles.tableScrollArea}>
        <table className={cx(styles.Table, tableClassName)}>
          <thead>
            <tr className={styles.headerRow}>
              {visibleColumns.map((column) => (
                <th
                  aria-sort={getSortAriaSort(column.id, column.sortable, activeSortState)}
                  className={cx(
                    styles.headerCell,
                    styles[column.align ?? 'left'],
                    getColumnVisibilityClass(column.mobileVisibility, styles)
                  )}
                  key={column.id}
                  scope="col"
                >
                  {column.sortable ? (
                    <button className={styles.sortButton} onClick={() => handleSort(column)} type="button">
                      <span>{column.header}</span>
                      <span className={styles.sortIndicator}>
                        {activeSortState?.columnId === column.id
                          ? activeSortState.direction === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </th>
              ))}

              {rowActions?.length ? (
                <th className={cx(styles.headerCell, styles.actionsHeader)} scope="col">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={colSpan}>
                  Loading...
                </td>
              </tr>
            ) : null}

            {!isLoading && sortedData.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={colSpan}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? sortedData.map((row) => (
                  <tr
                    className={cx(styles.bodyRow, onRowClick ? styles.interactiveBodyRow : undefined)}
                    key={getRowKey(row, rowKey)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {visibleColumns.map((column) => (
                      <td
                        className={cx(
                          styles.bodyCell,
                          styles[column.align ?? 'left'],
                          getColumnVisibilityClass(column.mobileVisibility, styles)
                        )}
                        key={column.id}
                      >
                        {resolveCellValue(row, column)}
                      </td>
                    ))}

                    {rowActions?.length ? (
                      <td className={cx(styles.bodyCell, styles.actionsCell)}>
                        <div className={styles.actions}>
                          {rowActions.map((action) => (
                            <Button
                              disabled={action.disabled?.(row) ?? false}
                              key={String(action.label)}
                              onClick={() => action.onClick(row)}
                              variant={action.variant ?? 'secondary'}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {pagination ? <TableFooter disabled={isLoading} pagination={pagination} /> : null}
    </div>
  );
}
