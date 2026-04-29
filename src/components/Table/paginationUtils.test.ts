import { describe, expect, it } from 'vitest';

import { getCurrentPage, getTableFooterPageItems, getTotalPages } from './paginationUtils';

describe('getTotalPages', () => {
  it('returns 0 when total is 0', () => {
    expect(getTotalPages(0, 10)).toBe(0);
  });

  it('returns 0 when limit is 0', () => {
    expect(getTotalPages(100, 0)).toBe(0);
  });

  it('returns 0 when total is negative', () => {
    expect(getTotalPages(-1, 10)).toBe(0);
  });

  it('returns 0 when limit is negative', () => {
    expect(getTotalPages(100, -1)).toBe(0);
  });

  it('returns exact page count when items divide evenly', () => {
    expect(getTotalPages(100, 10)).toBe(10);
  });

  it('rounds up when items do not divide evenly', () => {
    expect(getTotalPages(101, 10)).toBe(11);
  });

  it('returns 1 when total is less than limit', () => {
    expect(getTotalPages(5, 10)).toBe(1);
  });
});

describe('getCurrentPage', () => {
  it('returns 1 when limit is 0', () => {
    expect(getCurrentPage(20, 0, 5)).toBe(1);
  });

  it('returns 1 when totalPages is 0', () => {
    expect(getCurrentPage(20, 10, 0)).toBe(1);
  });

  it('returns 1 for offset 0', () => {
    expect(getCurrentPage(0, 10, 5)).toBe(1);
  });

  it('returns 1 for negative offset', () => {
    expect(getCurrentPage(-5, 10, 5)).toBe(1);
  });

  it('calculates correct page from offset', () => {
    expect(getCurrentPage(20, 10, 5)).toBe(3);
  });

  it('clamps to first page when offset underflows', () => {
    expect(getCurrentPage(-100, 10, 5)).toBe(1);
  });

  it('clamps to last page when offset overflows', () => {
    expect(getCurrentPage(1000, 10, 5)).toBe(5);
  });

  it('returns last page when offset is exactly at the last page', () => {
    expect(getCurrentPage(40, 10, 5)).toBe(5);
  });
});

describe('getTableFooterPageItems', () => {
  it('returns empty array when totalPages is 0', () => {
    expect(getTableFooterPageItems(1, 0)).toEqual([]);
  });

  it('returns empty array when totalPages is negative', () => {
    expect(getTableFooterPageItems(1, -1)).toEqual([]);
  });

  it('returns a single page when totalPages is 1', () => {
    expect(getTableFooterPageItems(1, 1)).toEqual([1]);
  });

  it('shows all pages without ellipsis when range is small', () => {
    expect(getTableFooterPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it('always includes page 1 and last page', () => {
    const items = getTableFooterPageItems(5, 10);

    expect(items[0]).toBe(1);
    expect(items.at(-1)).toBe(10);
  });

  it('includes immediate previous and next neighbours of current page', () => {
    // page 5 of 10: visible = 1, 4, 5, 6, 10
    expect(getTableFooterPageItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });

  it('inserts ellipsis between non-adjacent pages', () => {
    // page 1 of 7: visible = 1, 2, 7
    expect(getTableFooterPageItems(1, 7)).toEqual([1, 2, 'ellipsis', 7]);
  });

  it('does not insert ellipsis when neighbours are adjacent to page 1', () => {
    // page 3 of 7: visible = 1, 2, 3, 4, 7
    expect(getTableFooterPageItems(3, 7)).toEqual([1, 2, 3, 4, 'ellipsis', 7]);
  });

  it('does not insert ellipsis when neighbours are adjacent to last page', () => {
    // page 5 of 7: visible = 1, 4, 5, 6, 7
    expect(getTableFooterPageItems(5, 7)).toEqual([1, 'ellipsis', 4, 5, 6, 7]);
  });

  it('handles current page being the last page', () => {
    // page 7 of 7: visible = 1, 6, 7
    expect(getTableFooterPageItems(7, 7)).toEqual([1, 'ellipsis', 6, 7]);
  });

  it('handles current page being the first page', () => {
    // page 1 of 7: visible = 1, 2, 7
    expect(getTableFooterPageItems(1, 7)).toEqual([1, 2, 'ellipsis', 7]);
  });

  it('shows all pages with no ellipsis when neighbours bridge the gap', () => {
    // page 4 of 5: visible = 1, 3, 4, 5
    expect(getTableFooterPageItems(4, 5)).toEqual([1, 'ellipsis', 3, 4, 5]);
  });
});
