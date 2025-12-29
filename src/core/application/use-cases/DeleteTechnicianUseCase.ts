import { TechnicianRepository } from '@/core/domain/repositories/TechnicianRepository';

export class DeleteTechnicianUseCase {
  constructor(private technicianRepo: TechnicianRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.technicianRepo.findById(id);
    
    if (!existing) {
      throw new Error('Technicien non trouvé');
    }

    // Soft delete: désactiver le technicien
    await this.technicianRepo.update(id, { isActive: false });
  }

  async hardDelete(id: string): Promise<void> {
    const existing = await this.technicianRepo.findById(id);
    
    if (!existing) {
      throw new Error('Technicien non trouvé');
    }

    await this.technicianRepo.delete(id);
  }
}
