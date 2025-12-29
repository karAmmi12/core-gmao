import { TechnicianRepository } from '@/core/domain/repositories/TechnicianRepository';
import { Technician, TechnicianSkill } from '@/core/domain/entities/Technician';
import { TechnicianDTO, TechnicianMapper } from '../dto/TechnicianDTO';

export interface CreateTechnicianInput {
  name: string;
  email: string;
  phone?: string;
  skills: TechnicianSkill[];
}

export class CreateTechnicianUseCase {
  constructor(private technicianRepo: TechnicianRepository) {}

  async execute(input: CreateTechnicianInput): Promise<TechnicianDTO> {
    // Vérifier si un technicien avec cet email existe déjà
    const existing = await this.technicianRepo.findByEmail(input.email);
    
    if (existing) {
      if (existing.isActive) {
        throw new Error('Un technicien avec cet email existe déjà');
      }
      
      // Technicien désactivé trouvé : le réactiver avec les nouvelles données
      await this.technicianRepo.update(existing.id, {
        name: input.name,
        email: input.email,
        phone: input.phone,
        skills: input.skills,
        isActive: true,
      });
      
      const reactivated = await this.technicianRepo.findById(existing.id);
      if (!reactivated) {
        throw new Error('Erreur lors de la réactivation du technicien');
      }
      
      return TechnicianMapper.toDTO(reactivated);
    }

    // Créer l'entité domaine (validation métier incluse)
    const technician = Technician.create(
      input.name,
      input.email,
      input.skills,
      input.phone || undefined
    );

    // Persister
    await this.technicianRepo.save(technician);

    // Retourner le DTO
    return TechnicianMapper.toDTO(technician);
  }
}
