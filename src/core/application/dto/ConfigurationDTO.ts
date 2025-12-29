// core/application/dto/ConfigurationDTO.ts

export interface ConfigurationCategoryDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  itemCount?: number; // Nombre d'items dans cette catégorie
}

export interface ConfigurationItemDTO {
  id: string;
  categoryId: string;
  categoryCode?: string; // Code de la catégorie parente (pour faciliter les filtres)
  code: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ConfigurationWithItemsDTO extends ConfigurationCategoryDTO {
  items: ConfigurationItemDTO[];
}
