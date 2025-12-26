import { Part, PartCreateInput } from '@/core/domain/entities/Part';
import { PartRepository } from '@/core/domain/repositories/PartRepository';

export class CreatePartUseCase {
  constructor(private partRepo: PartRepository) {}

  async execute(input: PartCreateInput): Promise<{ id: string }> {
    // Vérifier que la référence n'existe pas déjà
    const existing = await this.partRepo.findByReference(input.reference);
    if (existing) {
      throw new Error(`Une pièce avec la référence ${input.reference} existe déjà`);
    }

    const part = Part.create(input);
    await this.partRepo.save(part);

    return { id: part.id };
  }
}
