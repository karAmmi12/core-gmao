/**
 * Interface pour les Use Cases
 * Permet d'assurer une structure cohérente pour tous les use cases
 */
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

/**
 * Interface pour les Repositories
 * Permet d'assurer une structure cohérente pour tous les repositories
 */
export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Type générique pour les résultats paginés
 * Facilite l'ajout de la pagination dans le futur
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Type pour les filtres de recherche
 * Facilite l'ajout de filtres avancés dans le futur
 */
export interface SearchFilters {
  query?: string;
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
