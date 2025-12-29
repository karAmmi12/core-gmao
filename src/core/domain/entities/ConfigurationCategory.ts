// core/domain/entities/ConfigurationCategory.ts

export class ConfigurationCategory {
  private constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly isSystem: boolean,
    public readonly isActive: boolean,
    public readonly sortOrder: number,
    public readonly createdAt: Date
  ) {}

  /**
   * Créer une nouvelle catégorie de configuration
   */
  static create(
    code: string,
    name: string,
    description?: string,
    isSystem: boolean = false,
    sortOrder: number = 0
  ): ConfigurationCategory {
    // Validation métier
    if (!code || code.trim() === '') {
      throw new Error('Le code de catégorie est requis');
    }
    
    if (!name || name.trim() === '') {
      throw new Error('Le nom de catégorie est requis');
    }

    // Format du code en UPPER_SNAKE_CASE
    const formattedCode = code.toUpperCase().replace(/\s+/g, '_');

    return new ConfigurationCategory(
      crypto.randomUUID(),
      formattedCode,
      name.trim(),
      description?.trim(),
      isSystem,
      true, // isActive par défaut
      sortOrder,
      new Date()
    );
  }

  /**
   * Restaurer une catégorie depuis la DB
   */
  static restore(
    id: string,
    code: string,
    name: string,
    description: string | undefined,
    isSystem: boolean,
    isActive: boolean,
    sortOrder: number,
    createdAt: Date
  ): ConfigurationCategory {
    return new ConfigurationCategory(
      id,
      code,
      name,
      description,
      isSystem,
      isActive,
      sortOrder,
      createdAt
    );
  }

  /**
   * Vérifier si la catégorie peut être supprimée
   */
  canBeDeleted(): boolean {
    return !this.isSystem;
  }
}
