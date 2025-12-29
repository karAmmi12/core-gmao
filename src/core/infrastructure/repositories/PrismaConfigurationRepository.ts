// core/infrastructure/repositories/PrismaConfigurationRepository.ts

import { prisma } from '@/lib/prisma';
import type {
  ConfigurationRepository,
  UpdateCategoryData,
  UpdateItemData,
} from '@/core/domain/repositories/ConfigurationRepository';
import { ConfigurationCategory } from '@/core/domain/entities/ConfigurationCategory';
import { ConfigurationItem } from '@/core/domain/entities/ConfigurationItem';

export class PrismaConfigurationRepository implements ConfigurationRepository {
  // ===== CATEGORIES =====

  async saveCategory(category: ConfigurationCategory): Promise<void> {
    await prisma.configurationCategory.create({
      data: {
        id: category.id,
        code: category.code,
        name: category.name,
        description: category.description,
        isSystem: category.isSystem,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
      },
    });
  }

  async findCategoryById(id: string): Promise<ConfigurationCategory | null> {
    const raw = await prisma.configurationCategory.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return ConfigurationCategory.restore(
      raw.id,
      raw.code,
      raw.name,
      raw.description ?? undefined,
      raw.isSystem,
      raw.isActive,
      raw.sortOrder,
      raw.createdAt
    );
  }

  async findCategoryByCode(code: string): Promise<ConfigurationCategory | null> {
    const raw = await prisma.configurationCategory.findUnique({
      where: { code },
    });

    if (!raw) return null;

    return ConfigurationCategory.restore(
      raw.id,
      raw.code,
      raw.name,
      raw.description ?? undefined,
      raw.isSystem,
      raw.isActive,
      raw.sortOrder,
      raw.createdAt
    );
  }

  async findAllCategories(): Promise<ConfigurationCategory[]> {
    const rows = await prisma.configurationCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((raw) =>
      ConfigurationCategory.restore(
        raw.id,
        raw.code,
        raw.name,
        raw.description ?? undefined,
        raw.isSystem,
        raw.isActive,
        raw.sortOrder,
        raw.createdAt
      )
    );
  }

  async updateCategory(id: string, data: UpdateCategoryData): Promise<void> {
    await prisma.configurationCategory.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteCategory(id: string): Promise<void> {
    // Vérifier si la catégorie peut être supprimée
    const category = await this.findCategoryById(id);
    if (!category) {
      throw new Error('Catégorie non trouvée');
    }

    if (!category.canBeDeleted()) {
      throw new Error('Les catégories système ne peuvent pas être supprimées');
    }

    // Supprimer en cascade les items associés
    await prisma.configurationCategory.delete({
      where: { id },
    });
  }

  // ===== ITEMS =====

  async saveItem(item: ConfigurationItem): Promise<void> {
    await prisma.configurationItem.create({
      data: {
        id: item.id,
        categoryId: item.categoryId,
        code: item.code,
        label: item.label,
        description: item.description,
        color: item.color,
        icon: item.icon,
        isDefault: item.isDefault,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        metadata: item.metadata ? JSON.stringify(item.metadata) : null,
        createdAt: item.createdAt,
      },
    });
  }

  async findItemById(id: string): Promise<ConfigurationItem | null> {
    const raw = await prisma.configurationItem.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return ConfigurationItem.restore(
      raw.id,
      raw.categoryId,
      raw.code,
      raw.label,
      raw.description ?? undefined,
      raw.color ?? undefined,
      raw.icon ?? undefined,
      raw.isDefault,
      raw.isActive,
      raw.sortOrder,
      raw.metadata ? JSON.parse(raw.metadata) : undefined,
      raw.createdAt
    );
  }

  async findItemByCode(
    categoryId: string,
    code: string
  ): Promise<ConfigurationItem | null> {
    const raw = await prisma.configurationItem.findUnique({
      where: {
        categoryId_code: { categoryId, code },
      },
    });

    if (!raw) return null;

    return ConfigurationItem.restore(
      raw.id,
      raw.categoryId,
      raw.code,
      raw.label,
      raw.description ?? undefined,
      raw.color ?? undefined,
      raw.icon ?? undefined,
      raw.isDefault,
      raw.isActive,
      raw.sortOrder,
      raw.metadata ? JSON.parse(raw.metadata) : undefined,
      raw.createdAt
    );
  }

  async findItemsByCategory(categoryId: string): Promise<ConfigurationItem[]> {
    const rows = await prisma.configurationItem.findMany({
      where: { categoryId },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((raw) =>
      ConfigurationItem.restore(
        raw.id,
        raw.categoryId,
        raw.code,
        raw.label,
        raw.description ?? undefined,
        raw.color ?? undefined,
        raw.icon ?? undefined,
        raw.isDefault,
        raw.isActive,
        raw.sortOrder,
        raw.metadata ? JSON.parse(raw.metadata) : undefined,
        raw.createdAt
      )
    );
  }

  async findActiveItemsByCategory(
    categoryId: string
  ): Promise<ConfigurationItem[]> {
    const rows = await prisma.configurationItem.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((raw) =>
      ConfigurationItem.restore(
        raw.id,
        raw.categoryId,
        raw.code,
        raw.label,
        raw.description ?? undefined,
        raw.color ?? undefined,
        raw.icon ?? undefined,
        raw.isDefault,
        raw.isActive,
        raw.sortOrder,
        raw.metadata ? JSON.parse(raw.metadata) : undefined,
        raw.createdAt
      )
    );
  }

  async updateItem(id: string, data: UpdateItemData): Promise<void> {
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };

    // Convertir metadata en JSON si fourni
    if (data.metadata !== undefined) {
      updateData.metadata = JSON.stringify(data.metadata);
    }

    await prisma.configurationItem.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteItem(id: string): Promise<void> {
    await prisma.configurationItem.delete({
      where: { id },
    });
  }
}
