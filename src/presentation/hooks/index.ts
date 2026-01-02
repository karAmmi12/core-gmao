/**
 * Hooks personnalisés pour la gestion des données et de l'état
 */

'use client';

import { useState, useCallback, useMemo, useTransition, useEffect } from 'react';

// =============================================================================
// DOMAIN HOOKS (Business Logic)
// =============================================================================
export * from './domain';

// =============================================================================
// USE PAGINATION
// =============================================================================

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizes?: number[];
}

export interface PaginationState<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
}

export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
): PaginationState<T> {
  const { 
    initialPage = 1, 
    initialPageSize = 10,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Reset to page 1 if current page exceeds total
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const data = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    data,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex: startIndex + 1,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
  };
}

// =============================================================================
// USE SEARCH
// =============================================================================

export interface SearchOptions<T> {
  searchKeys: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T extends Record<string, any>>(
  items: T[],
  options: SearchOptions<T>
) {
  const { searchKeys, debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items;

    const lowercaseQuery = debouncedQuery.toLowerCase();
    return items.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowercaseQuery);
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowercaseQuery);
        }
        return false;
      })
    );
  }, [items, searchKeys, debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    filteredItems,
    isSearching: query !== debouncedQuery,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
    clearSearch,
  };
}

// =============================================================================
// USE FILTER
// =============================================================================

export type FilterValue = string | number | boolean | null;

export interface UseFilterOptions<T> {
  initialFilters?: Record<string, FilterValue>;
}

export function useFilter<T extends Record<string, any>>(
  items: T[],
  options: UseFilterOptions<T> = {}
) {
  const [filters, setFilters] = useState<Record<string, FilterValue>>(
    options.initialFilters || {}
  );

  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === '' || value === undefined) return true;
        return item[key] === value;
      });
    });
  }, [items, filters]);

  const activeFilterCount = Object.values(filters).filter(v => v !== null && v !== '').length;

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filteredItems,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}

// =============================================================================
// USE SORT
// =============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export function useSort<T extends Record<string, any>>(
  items: T[],
  initialSort?: SortState
) {
  const [sortState, setSortState] = useState<SortState | null>(initialSort || null);

  const toggleSort = useCallback((key: string) => {
    setSortState(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Third click removes sort
    });
  }, []);

  const setSort = useCallback((key: string, direction: SortDirection) => {
    setSortState({ key, direction });
  }, []);

  const clearSort = useCallback(() => {
    setSortState(null);
  }, []);

  const sortedItems = useMemo(() => {
    if (!sortState) return items;

    return [...items].sort((a, b) => {
      const aVal = a[sortState.key];
      const bVal = b[sortState.key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison: number;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = aVal < bVal ? -1 : 1;
      }

      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, sortState]);

  return {
    sortState,
    sortedItems,
    toggleSort,
    setSort,
    clearSort,
    isSorted: sortState !== null,
  };
}

// =============================================================================
// USE TABLE (Combinaison search + filter + sort + pagination)
// =============================================================================

export interface UseTableOptions<T> {
  searchKeys?: (keyof T)[];
  initialFilters?: Record<string, FilterValue>;
  initialSort?: SortState;
  pageSize?: number;
}

export function useTable<T extends Record<string, any>>(
  items: T[],
  options: UseTableOptions<T> = {}
) {
  const { searchKeys = [], initialFilters, initialSort, pageSize = 10 } = options;

  // Search
  const search = useSearch(items, { searchKeys });
  
  // Filter
  const filter = useFilter(search.filteredItems, { initialFilters });
  
  // Sort
  const sort = useSort(filter.filteredItems, initialSort);
  
  // Pagination
  const pagination = usePagination(sort.sortedItems, { initialPageSize: pageSize });

  return {
    // Final data
    data: pagination.data,
    allFilteredData: sort.sortedItems,
    
    // Search
    searchQuery: search.query,
    setSearchQuery: search.setQuery,
    clearSearch: search.clearSearch,
    
    // Filters
    filters: filter.filters,
    setFilter: filter.setFilter,
    clearFilter: filter.clearFilter,
    clearAllFilters: filter.clearAllFilters,
    activeFilterCount: filter.activeFilterCount,
    
    // Sort
    sortState: sort.sortState,
    toggleSort: sort.toggleSort,
    setSort: sort.setSort,
    clearSort: sort.clearSort,
    
    // Pagination
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    goToPage: pagination.goToPage,
    nextPage: pagination.nextPage,
    previousPage: pagination.previousPage,
    setPageSize: pagination.setPageSize,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    
    // Reset all
    resetAll: () => {
      search.clearSearch();
      filter.clearAllFilters();
      sort.clearSort();
      pagination.goToPage(1);
    },
  };
}

// =============================================================================
// USE LOCAL STORAGE
// =============================================================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// =============================================================================
// USE ASYNC ACTION
// =============================================================================

export interface AsyncActionState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsyncAction<T, Args extends any[]>(
  action: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<AsyncActionState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(async (...args: Args) => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
    });

    try {
      const data = await action(...args);
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({
        data: null,
        error: err,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
      throw err;
    }
  }, [action]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return { ...state, execute, reset };
}

// =============================================================================
// USE DEBOUNCE
// =============================================================================

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// USE TOGGLE
// =============================================================================

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse, setValue };
}

// =============================================================================
// USE DISCLOSURE (Modal, Dialog, Dropdown)
// =============================================================================

export function useDisclosure(initialOpen: boolean = false) {
  const { value: isOpen, toggle, setTrue: open, setFalse: close } = useToggle(initialOpen);

  return { isOpen, open, close, toggle };
}
