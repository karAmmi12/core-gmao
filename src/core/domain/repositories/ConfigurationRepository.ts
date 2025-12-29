// core/domain/repositories/ConfigurationRepository.ts

import type { ConfigurationCategory } from '../entities/ConfigurationCategory';
import type { ConfigurationItem } from '../entities/ConfigurationItem';

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateItemData {
  label?: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

export interface ConfigurationRepository {
  // Categories
  saveCategory(category: ConfigurationCategory): Promise<void>;
  findCategoryById(id: string): Promise<ConfigurationCategory | null>;
  findCategoryByCode(code: string): Promise<ConfigurationCategory | null>;
  findAllCategories(): Promise<ConfigurationCategory[]>;
  updateCategory(id: string, data: UpdateCategoryData): Promise<void>;
  deleteCategory(id: string): Promise<void>;

  // Items
  saveItem(item: ConfigurationItem): Promise<void>;
  findItemById(id: string): Promise<ConfigurationItem | null>;
  findItemByCode(categoryId: string, code: string): Promise<ConfigurationItem | null>;
  findItemsByCategory(categoryId: string): Promise<ConfigurationItem[]>;
  findActiveItemsByCategory(categoryId: string): Promise<ConfigurationItem[]>;
  updateItem(id: string, data: UpdateItemData): Promise<void>;
  deleteItem(id: string): Promise<void>;
}
