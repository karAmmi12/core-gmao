// core/application/services/ConfigurationService.ts

import DIContainer from '@/core/infrastructure/di/DIContainer';
import { GetItemsByCategoryCodeUseCase } from '@/core/application/use-cases/configuration/GetItemsByCategoryCodeUseCase';
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';

/**
 * Service pour faciliter l'accès aux configurations
 * Utilisé dans les server components et server actions
 */
export class ConfigurationService {
  /**
   * Récupérer les items d'une catégorie par son code
   */
  static async getItemsByCategory(categoryCode: string): Promise<ConfigurationItemDTO[]> {
    const configRepo = DIContainer.getConfigurationRepository();
    const useCase = new GetItemsByCategoryCodeUseCase(configRepo);
    
    try {
      return await useCase.execute(categoryCode);
    } catch (error) {
      console.error(`Erreur lors du chargement de la catégorie ${categoryCode}:`, error);
      return [];
    }
  }

  /**
   * Récupérer les compétences technicien disponibles
   */
  static async getTechnicianSkills(): Promise<ConfigurationItemDTO[]> {
    return this.getItemsByCategory('TECHNICIAN_SKILL');
  }

  /**
   * Récupérer les types d'équipements
   */
  static async getAssetTypes(): Promise<ConfigurationItemDTO[]> {
    return this.getItemsByCategory('ASSET_TYPE');
  }

  /**
   * Récupérer les types de maintenance
   */
  static async getMaintenanceTypes(): Promise<ConfigurationItemDTO[]> {
    return this.getItemsByCategory('MAINTENANCE_TYPE');
  }

  /**
   * Récupérer les niveaux de priorité
   */
  static async getPriorities(): Promise<ConfigurationItemDTO[]> {
    return this.getItemsByCategory('WORK_ORDER_PRIORITY');
  }

  /**
   * Récupérer les catégories de pièces
   */
  static async getPartCategories(): Promise<ConfigurationItemDTO[]> {
    return this.getItemsByCategory('PART_CATEGORY');
  }
}
