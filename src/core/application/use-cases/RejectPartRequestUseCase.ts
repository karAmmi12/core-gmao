import { IPartRequestRepository } from '@/core/domain/repositories/PartRequestRepository';

export interface RejectPartRequestInput {
  partRequestId: string;
  rejectedById: string;
  rejectionReason: string;
}

export class RejectPartRequestUseCase {
  constructor(
    private readonly partRequestRepository: IPartRequestRepository
  ) {}

  async execute(input: RejectPartRequestInput): Promise<void> {
    if (!input.rejectionReason?.trim()) {
      throw new Error('La raison du refus est obligatoire');
    }

    const partRequest = await this.partRequestRepository.findById(input.partRequestId);

    if (!partRequest) {
      throw new Error('Demande non trouvée');
    }

    if (!partRequest.isPending) {
      throw new Error('Cette demande a déjà été traitée');
    }

    partRequest.reject(input.rejectedById, input.rejectionReason);
    await this.partRequestRepository.save(partRequest);
  }
}
