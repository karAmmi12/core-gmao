import { Technician, TechnicianSkill } from "../entities/Technician";

export interface UpdateTechnicianData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: TechnicianSkill[];
  isActive?: boolean;
}

export interface TechnicianRepository {
  save(technician: Technician): Promise<void>;
  findById(id: string): Promise<Technician | null>;
  findByEmail(email: string): Promise<Technician | null>;
  findAll(): Promise<Technician[]>;
  findBySkill(skill: string): Promise<Technician[]>;
  findAvailable(date: Date, duration: number): Promise<Technician[]>;
  update(id: string, data: UpdateTechnicianData): Promise<void>;
  delete(id: string): Promise<void>;
}
