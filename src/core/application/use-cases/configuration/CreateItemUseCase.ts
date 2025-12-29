// core/application/use-cases/configuration/CreateItemUseCase.ts

import type { ConfigurationRepository } from '@/core/domain/repositories/ConfigurationRepository';
import { ConfigurationItem } from '@/core/domain/entities/ConfigurationItem';
import { ConfigurationMapper } from '@/core/application/dto/ConfigurationMapper';
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import type { CreateItemInput } from '@/core/application/validation/ConfigurationSchemas';

export class CreateItemUseCase {
  constructor(private configRepo: ConfigurationRepository) {}

  async execute(input: CreateItemInput): Promise<ConfigurationItemDTO> {
    // Vérifier que la catégorie existe
    const category = await this.configRepo.findCategoryById(input.categoryId);
    if (!category) {
      throw new Error('Catégorie non trouvée');
    }

    // Vérifier si un item avec ce code existe déjà dans cette catégorie
    const existing = await this.configRepo.findItemByCode(
      input.categoryId,
      input.code
    );
    if (existing) {
      throw new Error(
        `Un item avec le code "${input.code}" existe déjà dans cette catégorie`
      );
    }

    // Créer l'entité domaine
    const item = ConfigurationItem.create(
      input.categoryId,
      input.code,
      input.label,
      input.description,
      input.color,
      input.icon,
      input.isDefault || false,
      input.sortOrder || 0,
      input.metadata
    );

    // Persister
    await this.configRepo.saveItem(item);

    // Retourner le DTO
    return ConfigurationMapper.itemToDTO(item, category.code);
  }
}
