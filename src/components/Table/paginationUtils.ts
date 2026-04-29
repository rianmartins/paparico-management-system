type TableFooterPageItem = number | 'ellipsis';

export function getTotalPages(total: number, limit: number) {
  if (total <= 0 || limit <= 0) {
    return 0;
  }

  return Math.ceil(total / limit);
}

export function getCurrentPage(offset: number, limit: number, totalPages: number) {
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

  const visiblePages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 >= 1) visiblePages.add(currentPage - 1);
  if (currentPage + 1 <= totalPages) visiblePages.add(currentPage + 1);

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
