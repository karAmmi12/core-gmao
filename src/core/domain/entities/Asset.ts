import { v4 as uuidv4 } from 'uuid';

export type AssetStatus = 'RUNNING' | 'STOPPED' | 'MAINTENANCE';

export class Asset {
  // Constructeur privé : on force l'usage de la méthode "create"
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly serialNumber: string,
    public readonly status: AssetStatus,
    public readonly createdAt: Date
  ) {}

  // Factory Method : C'est ici qu'on met les règles de validation
  static create(name: string, serialNumber: string): Asset {
    if (name.length < 3) {
      throw new Error("Le nom doit faire au moins 3 caractères.");
    }
    // Création d'une nouvelle instance
    return new Asset(uuidv4(), name, serialNumber, 'RUNNING', new Date());
  }
  
  // Méthode pour reconstituer un objet venant de la BDD (sans validation)
  static restore(id: string, name: string, serialNumber: string, status: AssetStatus, createdAt: Date): Asset {
    return new Asset(id, name, serialNumber, status, createdAt);
  }
}