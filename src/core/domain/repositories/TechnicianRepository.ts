import { Technician } from "../entities/Technician";

export interface TechnicianRepository {
  save(technician: Technician): Promise<void>;
  findById(id: string): Promise<Technician | null>;
  findAll(): Promise<Technician[]>;
  findBySkill(skill: string): Promise<Technician[]>;
  findAvailable(date: Date, duration: number): Promise<Technician[]>;
}
