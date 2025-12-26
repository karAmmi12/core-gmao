import { Technician, TechnicianSkill } from '@/core/domain/entities/Technician';

export interface TechnicianDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  skills: TechnicianSkill[];
  isActive: boolean;
}

export class TechnicianMapper {
  static toDTO(technician: Technician): TechnicianDTO {
    return {
      id: technician.id,
      firstName: technician.firstName,
      lastName: technician.lastName,
      fullName: `${technician.firstName} ${technician.lastName}`,
      email: technician.email,
      phone: technician.phone,
      skills: technician.skills,
      isActive: technician.isActive,
    };
  }

  static toDTOList(technicians: Technician[]): TechnicianDTO[] {
    return technicians.map((t) => this.toDTO(t));
  }
}
