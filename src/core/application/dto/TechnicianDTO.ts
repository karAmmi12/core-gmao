import { Technician, TechnicianSkill } from '@/core/domain/entities/Technician';

export interface TechnicianDTO {
  id: string;
  name: string;
  fullName: string; // Alias for name (compatibilité)
  email: string;
  phone?: string;
  skills: TechnicianSkill[];
  specialization: string; // Primary skill
  isActive: boolean;
}

export class TechnicianMapper {
  static toDTO(technician: Technician): TechnicianDTO {
    return {
      id: technician.id,
      name: technician.name,
      fullName: technician.name,
      email: technician.email,
      phone: technician.phone,
      skills: technician.skills,
      specialization: technician.skills[0] || 'Général',
      isActive: technician.isActive,
    };
  }

  static toDTOList(technicians: Technician[]): TechnicianDTO[] {
    return technicians.map((t) => this.toDTO(t));
  }
}
