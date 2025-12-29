// core/application/dto/ConfigurationMapper.ts

import { ConfigurationCategory } from '@/core/domain/entities/ConfigurationCategory';
import { ConfigurationItem } from '@/core/domain/entities/ConfigurationItem';
import type {
  ConfigurationCategoryDTO,
  ConfigurationItemDTO,
  ConfigurationWithItemsDTO,
} from './ConfigurationDTO';

export class ConfigurationMapper {
  static categoryToDTO(
    category: ConfigurationCategory,
    itemCount?: number
  ): ConfigurationCategoryDTO {
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      isSystem: category.isSystem,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      itemCount,
    };
  }

  static itemToDTO(
    item: ConfigurationItem,
    categoryCode?: string
  ): ConfigurationItemDTO {
    return {
      id: item.id,
      categoryId: item.categoryId,
      categoryCode,
      code: item.code,
      label: item.label,
      description: item.description,
      color: item.color,
      icon: item.icon,
      isDefault: item.isDefault,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      metadata: item.metadata,
      createdAt: item.createdAt,
    };
  }

  static categoryWithItemsToDTO(
    category: ConfigurationCategory,
    items: ConfigurationItem[]
  ): ConfigurationWithItemsDTO {
    return {
      ...this.categoryToDTO(category, items.length),
      items: items.map((item) => this.itemToDTO(item, category.code)),
    };
  }
}
