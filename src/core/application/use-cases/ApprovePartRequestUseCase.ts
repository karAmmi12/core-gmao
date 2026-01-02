import { IPartRequestRepository } from '@/core/domain/repositories/PartRequestRepository';
import { PartRepository } from '@/core/domain/repositories/PartRepository';

export interface ApprovePartRequestInput {
  partRequestId: string;
  approvedById: string;
  notes?: string;
}

export class ApprovePartRequestUseCase {
  constructor(
    private readonly partRequestRepository: IPartRequestRepository,
    private readonly partRepository: PartRepository
  ) {}

  async execute(input: ApprovePartRequestInput): Promise<void> {
    const partRequest = await this.partRequestRepository.findById(input.partRequestId);

    if (!partRequest) {
      throw new Error('Demande non trouvée');
    }

    if (!partRequest.isPending) {
      throw new Error('Cette demande a déjà été traitée');
    }

    // Vérifier le stock disponible
    const part = await this.partRepository.findById(partRequest.partId);
    
    if (!part) {
      throw new Error('Pièce non trouvée');
    }

    if (part.quantityInStock < partRequest.quantity) {
      throw new Error(`Stock insuffisant. Disponible: ${part.quantityInStock}, Demandé: ${partRequest.quantity}`);
    }

    // Approuver la demande
    partRequest.approve(input.approvedById, input.notes);
    await this.partRequestRepository.save(partRequest);
  }
}
