// core/domain/entities/ConfigurationItem.ts

export interface ConfigurationItemMetadata {
  [key: string]: unknown;
}

export class ConfigurationItem {
  private constructor(
    public readonly id: string,
    public readonly categoryId: string,
    public readonly code: string,
    public readonly label: string,
    public readonly description: string | undefined,
    public readonly color: string | undefined,
    public readonly icon: string | undefined,
    public readonly isDefault: boolean,
    public readonly isActive: boolean,
    public readonly sortOrder: number,
    public readonly metadata: ConfigurationItemMetadata | undefined,
    public readonly createdAt: Date
  ) {}

  /**
   * Créer un nouvel item de configuration
   */
  static create(
    categoryId: string,
    code: string,
    label: string,
    description?: string,
    color?: string,
    icon?: string,
    isDefault: boolean = false,
    sortOrder: number = 0,
    metadata?: ConfigurationItemMetadata
  ): ConfigurationItem {
    // Validation métier
    if (!categoryId || categoryId.trim() === '') {
      throw new Error('La catégorie est requise');
    }

    if (!code || code.trim() === '') {
      throw new Error('Le code est requis');
    }
    
    if (!label || label.trim() === '') {
      throw new Error('Le libellé est requis');
    }

    // Format du code en UPPER_SNAKE_CASE
    const formattedCode = code.toUpperCase().replace(/\s+/g, '_');

    // Validation de la couleur si fournie
    if (color && !color.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error('La couleur doit être au format hexadécimal (#RRGGBB)');
    }

    return new ConfigurationItem(
      crypto.randomUUID(),
      categoryId,
      formattedCode,
      label.trim(),
      description?.trim(),
      color,
      icon,
      isDefault,
      true, // isActive par défaut
      sortOrder,
      metadata,
      new Date()
    );
  }

  /**
   * Restaurer un item depuis la DB
   */
  static restore(
    id: string,
    categoryId: string,
    code: string,
    label: string,
    description: string | undefined,
    color: string | undefined,
    icon: string | undefined,
    isDefault: boolean,
    isActive: boolean,
    sortOrder: number,
    metadata: ConfigurationItemMetadata | undefined,
    createdAt: Date
  ): ConfigurationItem {
    return new ConfigurationItem(
      id,
      categoryId,
      code,
      label,
      description,
      color,
      icon,
      isDefault,
      isActive,
      sortOrder,
      metadata,
      createdAt
    );
  }
}
