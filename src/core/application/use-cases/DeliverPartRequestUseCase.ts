import { IPartRequestRepository } from '@/core/domain/repositories/PartRequestRepository';
import { PartRepository } from '@/core/domain/repositories/PartRepository';
import { StockMovementRepository } from '@/core/domain/repositories/StockMovementRepository';

export interface DeliverPartRequestInput {
  partRequestId: string;
  deliveredById: string;
}

export class DeliverPartRequestUseCase {
  constructor(
    private readonly partRequestRepository: IPartRequestRepository,
    private readonly partRepository: PartRepository,
    private readonly stockMovementRepository: StockMovementRepository
  ) {}

  async execute(input: DeliverPartRequestInput): Promise<void> {
    const partRequest = await this.partRequestRepository.findById(input.partRequestId);

    if (!partRequest) {
      throw new Error('Demande non trouvée');
    }

    if (!partRequest.canBeDelivered) {
      throw new Error('Cette demande ne peut pas être livrée');
    }

    // Vérifier le stock
    const part = await this.partRepository.findById(partRequest.partId);
    if (!part) {
      throw new Error('Pièce non trouvée');
    }

    if (part.quantityInStock < partRequest.quantity) {
      throw new Error('Stock insuffisant');
    }

    // Créer un mouvement de sortie (import dynamique pour encapsuler l'entité)
    const { StockMovement } = await import('@/core/domain/entities/StockMovement');
    
    const movement = StockMovement.create({
      partId: partRequest.partId,
      type: 'OUT',
      quantity: partRequest.quantity,
      reason: `Demande urgente #${input.partRequestId.slice(0, 8)}`,
      reference: `REQ-${input.partRequestId.slice(0, 8)}`,
      createdBy: input.deliveredById,
    });
    
    await this.stockMovementRepository.save(movement);

    // Mettre à jour le stock de la pièce
    const newStock = part.quantityInStock - partRequest.quantity;
    await this.partRepository.updateStock(partRequest.partId, newStock);

    // Marquer comme livré
    partRequest.deliver(input.deliveredById);
    await this.partRequestRepository.save(partRequest);
  }
}
