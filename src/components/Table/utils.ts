import type { TableColumn, TableProps, TableSortState } from './type';

export function getRowKey<TData>(row: TData, rowKey: TableProps<TData>['rowKey']) {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }

  return String(row[rowKey]);
}

export function resolveCellValue<TData>(row: TData, column: TableColumn<TData>) {
  if (column.render) {
    return column.render(row);
  }

  if (column.accessor) {
    return String(row[column.accessor] ?? '');
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`Table column "${column.id}" must define "accessor" or "render".`);
  }

  return null;
}

export function resolveSortValue<TData>(row: TData, column: TableColumn<TData>) {
  if (column.sortAccessor) {
    return column.sortAccessor(row);
  }

  if (column.accessor) {
    return row[column.accessor] as string | number | Date | null | undefined;
  }

  return null;
}

export function compareSortValues(
  left: string | number | Date | null | undefined,
  right: string | number | Date | null | undefined
) {
  if (left == null && right == null) {
    return 0;
  }

  if (left == null) {
    return 1;
  }

  if (right == null) {
    return -1;
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base'
  });
}

export function getNextSortState(currentSortState: TableSortState | null, columnId: string): TableSortState | null {
  if (!currentSortState || currentSortState.columnId !== columnId) {
    return {
      columnId,
      direction: 'asc'
    };
  }

  if (currentSortState.direction === 'asc') {
    return {
      columnId,
      direction: 'desc'
    };
  }

  return null;
}

export function getSortAriaSort(
  columnId: string,
  sortable: boolean | undefined,
  currentSortState: TableSortState | null
) {
  if (!sortable || currentSortState?.columnId !== columnId) {
    return 'none';
  }

  return currentSortState.direction === 'asc' ? 'ascending' : 'descending';
}

export function getColumnVisibilityClass(
  mobileVisibility: TableColumn<unknown>['mobileVisibility'],
  styles: Record<string, string>
) {
  if (mobileVisibility === 'tablet') {
    return styles.tablet;
  }

  if (mobileVisibility === 'desktop') {
    return styles.desktop;
  }

  return styles.always;
}
