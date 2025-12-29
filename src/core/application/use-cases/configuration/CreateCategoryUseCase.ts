// core/application/use-cases/configuration/CreateCategoryUseCase.ts

import type { ConfigurationRepository } from '@/core/domain/repositories/ConfigurationRepository';
import { ConfigurationCategory } from '@/core/domain/entities/ConfigurationCategory';
import { ConfigurationMapper } from '@/core/application/dto/ConfigurationMapper';
import type { ConfigurationCategoryDTO } from '@/core/application/dto/ConfigurationDTO';
import type { CreateCategoryInput } from '@/core/application/validation/ConfigurationSchemas';

export class CreateCategoryUseCase {
  constructor(private configRepo: ConfigurationRepository) {}

  async execute(input: CreateCategoryInput): Promise<ConfigurationCategoryDTO> {
    // Vérifier si une catégorie avec ce code existe déjà
    const existing = await this.configRepo.findCategoryByCode(input.code);
    if (existing) {
      throw new Error(`Une catégorie avec le code "${input.code}" existe déjà`);
    }

    // Créer l'entité domaine
    const category = ConfigurationCategory.create(
      input.code,
      input.name,
      input.description,
      false, // Pas une catégorie système par défaut
      input.sortOrder || 0
    );

    // Persister
    await this.configRepo.saveCategory(category);

    // Retourner le DTO
    return ConfigurationMapper.categoryToDTO(category, 0);
  }
}
