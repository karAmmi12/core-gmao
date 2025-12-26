import { StockMovement, StockMovementInput } from '@/core/domain/entities/StockMovement';
import { PartRepository } from '@/core/domain/repositories/PartRepository';
import { StockMovementRepository } from '@/core/domain/repositories/StockMovementRepository';

export class AddStockMovementUseCase {
  constructor(
    private partRepo: PartRepository,
    private stockMovementRepo: StockMovementRepository
  ) {}

  async execute(input: StockMovementInput): Promise<{ id: string }> {
    // Vérifier que la pièce existe
    const part = await this.partRepo.findById(input.partId);
    if (!part) {
      throw new Error('Pièce introuvable');
    }

    // Calculer la nouvelle quantité
    const signedQuantity = input.type === 'IN' ? input.quantity : -input.quantity;
    const newQuantity = part.quantityInStock + signedQuantity;

    // Vérifier qu'on ne descend pas en négatif
    if (newQuantity < 0) {
      throw new Error(`Stock insuffisant. Disponible: ${part.quantityInStock}, Demandé: ${input.quantity}`);
    }

    // Créer le mouvement
    const movement = StockMovement.create(input);
    await this.stockMovementRepo.save(movement);

    // Mettre à jour le stock
    await this.partRepo.updateStock(input.partId, newQuantity);

    return { id: movement.id };
  }
}
