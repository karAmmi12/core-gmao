import { TechnicianRepository } from '@/core/domain/repositories/TechnicianRepository';
import { TechnicianDTO, TechnicianMapper } from '../dto/TechnicianDTO';

export class GetTechnicianDetailsUseCase {
  constructor(private technicianRepo: TechnicianRepository) {}

  async execute(id: string): Promise<TechnicianDTO | null> {
    const technician = await this.technicianRepo.findById(id);
    
    if (!technician) {
      return null;
    }

    return TechnicianMapper.toDTO(technician);
  }
}
