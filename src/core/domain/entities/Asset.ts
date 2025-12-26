import { v4 as uuidv4 } from 'uuid';

export type AssetStatus = 'RUNNING' | 'STOPPED' | 'MAINTENANCE';

export type AssetType = 'SITE' | 'BUILDING' | 'LINE' | 'MACHINE' | 'COMPONENT';

export interface AssetHierarchy {
  parentId?: string;
  assetType?: AssetType;
  location?: string;
  manufacturer?: string;
  modelNumber?: string;
}

export class Asset {
  // Constructeur privé : on force l'usage de la méthode "create"
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly serialNumber: string,
    public readonly status: AssetStatus,
    public readonly createdAt: Date,
    public readonly parentId?: string,
    public readonly assetType?: AssetType,
    public readonly location?: string,
    public readonly manufacturer?: string,
    public readonly modelNumber?: string
  ) {}

  // Factory Method : C'est ici qu'on met les règles de validation
  static create(
    name: string,
    serialNumber: string,
    hierarchy?: AssetHierarchy,
    status: AssetStatus = 'RUNNING'
  ): Asset {
    if (name.length < 3) {
      throw new Error("Le nom doit faire au moins 3 caractères.");
    }
    // Création d'une nouvelle instance
    return new Asset(
      uuidv4(),
      name,
      serialNumber,
      status,
      new Date(),
      hierarchy?.parentId,
      hierarchy?.assetType,
      hierarchy?.location,
      hierarchy?.manufacturer,
      hierarchy?.modelNumber
    );
  }
  
  // Méthode pour reconstituer un objet venant de la BDD (sans validation)
  static restore(
    id: string,
    name: string,
    serialNumber: string,
    status: AssetStatus,
    createdAt: Date,
    parentId?: string,
    assetType?: AssetType,
    location?: string,
    manufacturer?: string,
    modelNumber?: string
  ): Asset {
    return new Asset(
      id,
      name,
      serialNumber,
      status,
      createdAt,
      parentId,
      assetType,
      location,
      manufacturer,
      modelNumber
    );
  }
}