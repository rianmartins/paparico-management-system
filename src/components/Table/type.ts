import type { ReactNode } from 'react';

export type TableSortDirection = 'asc' | 'desc';

export type TableSortState = {
  columnId: string;
  direction: TableSortDirection;
};

export type TableColumn<TData> = {
  id: string;
  header: ReactNode;
  accessor?: keyof TData;
  render?: (row: TData) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (row: TData) => string | number | Date | null | undefined;
  align?: 'left' | 'center' | 'right';
  mobileVisibility?: 'always' | 'tablet' | 'desktop';
};

export type TableRowAction<TData> = {
  label: ReactNode;
  onClick: (row: TData) => void;
  variant?: 'primary' | 'secondary';
  disabled?: (row: TData) => boolean;
};

export type TablePaginationChange = {
  page: number;
  offset: number;
  limit: number;
};

export type TablePaginationState = {
  offset: number;
  limit: number;
  total: number;
  onPageChange: (nextPagination: TablePaginationChange) => void;
};

export type TableProps<TData> = {
  data: readonly TData[];
  columns: readonly TableColumn<TData>[];
  rowKey: keyof TData | ((row: TData) => string);
  caption?: ReactNode;
  isLoading?: boolean;
  emptyMessage?: ReactNode;
  className?: string;
  tableClassName?: string;
  sortState?: TableSortState | null;
  defaultSortState?: TableSortState | null;
  onSortChange?: (nextSort: TableSortState | null) => void;
  rowActions?: readonly TableRowAction<TData>[];
  onRowClick?: (row: TData) => void;
  pagination?: TablePaginationState;
};
