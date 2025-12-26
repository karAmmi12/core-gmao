import DIContainer from "@/core/infrastructure/di/DIContainer";
import { TechnicianRepository } from "@/core/domain/repositories/TechnicianRepository";
import { TechnicianDTO, TechnicianMapper } from "@/core/application/dto/TechnicianDTO";

export class TechnicianService {
  private technicianRepo: TechnicianRepository;

  constructor() {
    this.technicianRepo = DIContainer.getTechnicianRepository();
  }

  async getAllTechnicians(): Promise<TechnicianDTO[]> {
    const technicians = await this.technicianRepo.findAll();
    return TechnicianMapper.toDTOList(technicians);
  }

  async getActiveTechnicians(): Promise<TechnicianDTO[]> {
    const technicians = await this.technicianRepo.findAll();
    const active = technicians.filter(t => t.isActive);
    return TechnicianMapper.toDTOList(active);
  }

  async getAvailableTechnicians(
    date: Date,
    duration: number
  ): Promise<TechnicianDTO[]> {
    const technicians = await this.technicianRepo.findAvailable(date, duration);
    return TechnicianMapper.toDTOList(technicians);
  }
  async getAvailableTechnicians(
    date: Date,
    duration: number
  ): Promise<TechnicianDTO[]> {
    const technicians = await this.technicianRepo.findAvailable(date, duration);
    return TechnicianMapper.toDTOList(technicians);
  }
}
