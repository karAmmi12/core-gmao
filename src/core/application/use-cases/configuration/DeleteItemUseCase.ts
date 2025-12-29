// core/application/use-cases/configuration/DeleteItemUseCase.ts

import type { ConfigurationRepository } from '@/core/domain/repositories/ConfigurationRepository';

export class DeleteItemUseCase {
  constructor(private configRepo: ConfigurationRepository) {}

  async execute(itemId: string): Promise<void> {
    // Vérifier que l'item existe
    const item = await this.configRepo.findItemById(itemId);
    if (!item) {
      throw new Error('Item de configuration non trouvé');
    }

    // Supprimer l'item
    await this.configRepo.deleteItem(itemId);
  }
}
