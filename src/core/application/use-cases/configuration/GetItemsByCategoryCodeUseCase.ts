// core/application/use-cases/configuration/GetItemsByCategoryCodeUseCase.ts

import type { ConfigurationRepository } from '@/core/domain/repositories/ConfigurationRepository';
import { ConfigurationMapper } from '@/core/application/dto/ConfigurationMapper';
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';

export class GetItemsByCategoryCodeUseCase {
  constructor(private configRepo: ConfigurationRepository) {}

  async execute(categoryCode: string): Promise<ConfigurationItemDTO[]> {
    // Trouver la catégorie par code
    const category = await this.configRepo.findCategoryByCode(categoryCode);
    if (!category) {
      throw new Error(`Catégorie "${categoryCode}" non trouvée`);
    }

    // Récupérer les items actifs de cette catégorie
    const items = await this.configRepo.findActiveItemsByCategory(category.id);

    // Convertir en DTOs
    return items.map((item) =>
      ConfigurationMapper.itemToDTO(item, category.code)
    );
  }
}
