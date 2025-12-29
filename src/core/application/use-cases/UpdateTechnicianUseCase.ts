import { TechnicianRepository } from '@/core/domain/repositories/TechnicianRepository';
import { TechnicianSkill } from '@/core/domain/entities/Technician';
import { TechnicianDTO, TechnicianMapper } from '../dto/TechnicianDTO';

export interface UpdateTechnicianInput {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: TechnicianSkill[];
  isActive?: boolean;
}

export class UpdateTechnicianUseCase {
  constructor(private technicianRepo: TechnicianRepository) {}

  async execute(input: UpdateTechnicianInput): Promise<TechnicianDTO> {
    const existing = await this.technicianRepo.findById(input.id);
    
    if (!existing) {
      throw new Error('Technicien non trouvé');
    }

    // Mettre à jour via le repository
    await this.technicianRepo.update(input.id, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      skills: input.skills,
      isActive: input.isActive ?? existing.isActive,
    });

    // Récupérer l'entité mise à jour
    const updated = await this.technicianRepo.findById(input.id);
    
    if (!updated) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return TechnicianMapper.toDTO(updated);
  }
}
