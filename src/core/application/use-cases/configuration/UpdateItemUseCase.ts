// core/application/use-cases/configuration/UpdateItemUseCase.ts

import type { ConfigurationRepository } from '@/core/domain/repositories/ConfigurationRepository';
import { ConfigurationMapper } from '@/core/application/dto/ConfigurationMapper';
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import type { UpdateItemInput } from '@/core/application/validation/ConfigurationSchemas';

export class UpdateItemUseCase {
  constructor(private configRepo: ConfigurationRepository) {}

  async execute(
    itemId: string,
    input: UpdateItemInput
  ): Promise<ConfigurationItemDTO> {
    // Vérifier que l'item existe
    const item = await this.configRepo.findItemById(itemId);
    if (!item) {
      throw new Error('Item de configuration non trouvé');
    }

    // Récupérer la catégorie pour le DTO
    const category = await this.configRepo.findCategoryById(item.categoryId);
    if (!category) {
      throw new Error('Catégorie non trouvée');
    }

    // Mettre à jour
    await this.configRepo.updateItem(itemId, input);

    // Récupérer l'item mis à jour
    const updatedItem = await this.configRepo.findItemById(itemId);
    if (!updatedItem) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return ConfigurationMapper.itemToDTO(updatedItem, category.code);
  }
}
