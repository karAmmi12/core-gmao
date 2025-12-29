// core/application/use-cases/configuration/GetAllCategoriesUseCase.ts

import type { ConfigurationRepository } from '@/core/domain/repositories/ConfigurationRepository';
import { ConfigurationMapper } from '@/core/application/dto/ConfigurationMapper';
import type { ConfigurationWithItemsDTO } from '@/core/application/dto/ConfigurationDTO';

export class GetAllCategoriesUseCase {
  constructor(private configRepo: ConfigurationRepository) {}

  async execute(): Promise<ConfigurationWithItemsDTO[]> {
    // Récupérer toutes les catégories
    const categories = await this.configRepo.findAllCategories();

    // Pour chaque catégorie, récupérer ses items (actifs ET inactifs)
    const categoriesWithItems = await Promise.all(
      categories.map(async (category) => {
        const items = await this.configRepo.findItemsByCategory(
          category.id
        );
        return ConfigurationMapper.categoryWithItemsToDTO(category, items);
      })
    );

    return categoriesWithItems;
  }
}
