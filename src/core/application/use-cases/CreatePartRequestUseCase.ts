import { IPartRequestRepository } from '@/core/domain/repositories/PartRequestRepository';
import { PartRepository } from '@/core/domain/repositories/PartRepository';

export interface CreatePartRequestInput {
  partId: string;
  quantity: number;
  requestedById: string;
  reason: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  workOrderId?: string;
  assetId?: string;
}

export interface CreatePartRequestOutput {
  id: string;
}

export class CreatePartRequestUseCase {
  constructor(
    private readonly partRequestRepository: IPartRequestRepository,
    private readonly partRepository: PartRepository
  ) {}

  async execute(input: CreatePartRequestInput): Promise<CreatePartRequestOutput> {
    // Vérifier que la pièce existe
    const part = await this.partRepository.findById(input.partId);
    if (!part) {
      throw new Error('Pièce non trouvée');
    }

    // Importer l'entité ici uniquement (encapsulé dans le use case)
    const { PartRequest } = await import('@/core/domain/entities/PartRequest');
    const { v4: uuidv4 } = await import('uuid');

    const partRequest = PartRequest.create({
      id: uuidv4(),
      partId: input.partId,
      quantity: input.quantity,
      requestedById: input.requestedById,
      reason: input.reason,
      urgency: input.urgency,
      workOrderId: input.workOrderId,
      assetId: input.assetId,
    });

    await this.partRequestRepository.save(partRequest);

    return { id: partRequest.id };
  }
}
