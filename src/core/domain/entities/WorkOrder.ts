import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 'PENDING' | 'COMPLETED';
export type OrderPriority = 'LOW' | 'HIGH';

export class WorkOrder {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly status: OrderStatus,
    public readonly priority: OrderPriority,
    public readonly assetId: string,
    public readonly createdAt: Date
  ) {}

  static create(title: string, priority: OrderPriority, assetId: string): WorkOrder {
    if (title.length < 5) {
      throw new Error("Le titre de l'intervention doit être précis (min 5 caractères).");
    }

    return new WorkOrder(
      uuidv4(),
      title,
      'PENDING', // Toujours en attente à la création
      priority,
      assetId,
      new Date()
    );
  }


  markAsCompleted(): void {
    if (this.status === 'COMPLETED') {
      throw new Error("Cette intervention est déjà terminée.");
    }
    // On modifie les propriétés (attention, en Clean Arch pur, on préfère souvent l'immutabilité, 
    // mais pour simplifier ici on mute l'objet, ou on retourne une nouvelle instance).
    // Pour TypeScript, il faut enlever 'readonly' sur status ou utiliser une astuce.
    // LE PLUS SIMPLE ICI : On crée un setter ou on rend status public pour la démo.
    (this as any).status = 'COMPLETED'; 
  }

  static restore(id: string, title: string, status: OrderStatus, priority: OrderPriority, assetId: string, createdAt: Date): WorkOrder {
    return new WorkOrder(id, title, status, priority, assetId, createdAt);
  }
}