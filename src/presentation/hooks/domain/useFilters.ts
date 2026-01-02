/**
 * Hook générique pour gérer les filtres de données
 * Remplace la logique de filtrage répétée dans tous les composants
 */

'use client';

import { useState, useMemo, useCallback } from 'react';

export type FilterValue = string | number | boolean | null | undefined;
export type FilterConfig = Record<string, FilterValue>;

export interface FilterDefinition<T = any> {
  key: keyof T;
  matcher?: (item: T, value: FilterValue) => boolean;
}

export interface UseFiltersOptions<T> {
  initialFilters?: FilterConfig;
  customMatchers?: Record<string, (item: T, value: FilterValue) => boolean>;
}

export interface UseFiltersReturn<T> {
  filteredItems: T[];
  filters: FilterConfig;
  updateFilter: (key: string, value: FilterValue) => void;
  updateFilters: (updates: FilterConfig) => void;
  resetFilters: () => void;
  clearFilter: (key: string) => void;
  activeFiltersCount: number;
  hasActiveFilters: boolean;
}

/**
 * Default matcher - check equality or "all" value
 */
const defaultMatcher = <T,>(item: T, key: keyof T, value: FilterValue): boolean => {
  if (value === 'all' || value === '' || value === null || value === undefined) {
    return true;
  }
  return item[key] === value;
};

/**
 * Hook pour gérer les filtres de manière générique
 * 
 * @example
 * // Simple usage
 * const { filteredItems, updateFilter } = useFilters(workOrders, {
 *   initialFilters: { status: 'all', priority: 'all' }
 * });
 * 
 * <Select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
 *   <option value="all">Tous</option>
 *   <option value="PENDING">En attente</option>
 * </Select>
 * 
 * @example
 * // Avec custom matchers
 * const { filteredItems } = useFilters(parts, {
 *   initialFilters: { minStock: 10, category: 'all' },
 *   customMatchers: {
 *     minStock: (item, value) => item.quantityInStock >= value
 *   }
 * });
 */
export function useFilters<T extends Record<string, any>>(
  items: T[],
  options: UseFiltersOptions<T> = {}
): UseFiltersReturn<T> {
  const { initialFilters = {}, customMatchers = {} } = options;
  
  const [filters, setFilters] = useState<FilterConfig>(initialFilters);

  // Calculate filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        // Use custom matcher if provided
        if (customMatchers && customMatchers[key]) {
          return customMatchers[key](item, value);
        }
        
        // Use default matcher
        return defaultMatcher(item, key as keyof T, value);
      });
    });
  }, [items, filters, customMatchers]);

  // Update single filter
  const updateFilter = useCallback((key: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((updates: FilterConfig) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset to initial filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Clear specific filter
  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Count active filters (excluding "all" values)
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== 'all' && value !== '' && value !== null && value !== undefined
    ).length;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  return {
    filteredItems,
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    activeFiltersCount,
    hasActiveFilters,
  };
}

/**
 * Hook pour gérer des filtres avec recherche textuelle
 * Combine useFilters avec useSearch
 * 
 * @example
 * const { filteredItems, filters, updateFilter, query, setQuery } = 
 *   useFiltersWithSearch(assets, {
 *     initialFilters: { status: 'all' },
 *     searchKeys: ['name', 'serialNumber']
 *   });
 */
export function useFiltersWithSearch<T extends Record<string, any>>(
  items: T[],
  options: UseFiltersOptions<T> & {
    searchKeys: (keyof T)[];
    caseSensitive?: boolean;
  }
): UseFiltersReturn<T> & {
  query: string;
  setQuery: (query: string) => void;
  clearSearch: () => void;
} {
  const [query, setQuery] = useState('');
  
  const { searchKeys, caseSensitive = false, ...filterOptions } = options;
  
  // First apply filters
  const filterResult = useFilters(items, filterOptions);
  
  // Then apply search on filtered results
  const searchedItems = useMemo(() => {
    if (!query.trim()) return filterResult.filteredItems;
    
    const searchTerm = caseSensitive ? query : query.toLowerCase();
    
    return filterResult.filteredItems.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (value == null) return false;
        
        const stringValue = String(value);
        const searchValue = caseSensitive ? stringValue : stringValue.toLowerCase();
        
        return searchValue.includes(searchTerm);
      });
    });
  }, [filterResult.filteredItems, query, searchKeys, caseSensitive]);

  const clearSearch = useCallback(() => setQuery(''), []);

  return {
    ...filterResult,
    filteredItems: searchedItems,
    query,
    setQuery,
    clearSearch,
  };
}

/**
 * Hook pour gérer des filtres avec stats calculées
 * 
 * @example
 * const { filteredItems, stats } = useFiltersWithStats(requests, {
 *   initialFilters: { status: 'all' },
 *   statsCalculator: (items) => ({
 *     pending: items.filter(i => i.status === 'PENDING').length,
 *     total: items.length
 *   })
 * });
 */
export function useFiltersWithStats<T extends Record<string, any>, TStats = any>(
  items: T[],
  options: UseFiltersOptions<T> & {
    statsCalculator: (items: T[]) => TStats;
  }
): UseFiltersReturn<T> & {
  stats: TStats;
  filteredStats: TStats;
} {
  const { statsCalculator, ...filterOptions } = options;
  
  const filterResult = useFilters(items, filterOptions);
  
  const stats = useMemo(() => statsCalculator(items), [items, statsCalculator]);
  const filteredStats = useMemo(
    () => statsCalculator(filterResult.filteredItems),
    [filterResult.filteredItems, statsCalculator]
  );

  return {
    ...filterResult,
    stats,
    filteredStats,
  };
}
