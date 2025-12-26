import { v4 as uuidv4 } from 'uuid';

export type TechnicianSkill = 
  | 'Électricité'
  | 'Mécanique'
  | 'Hydraulique'
  | 'Pneumatique'
  | 'Automatisme'
  | 'Informatique industrielle'
  | 'Soudure'
  | 'Usinage';

export class Technician {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string | undefined,
    public readonly skills: TechnicianSkill[],
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}

  static create(
    name: string,
    email: string,
    skills: TechnicianSkill[],
    phone?: string
  ): Technician {
    if (name.length < 3) {
      throw new Error("Le nom doit faire au moins 3 caractères");
    }
    
    if (!email.includes('@')) {
      throw new Error("Email invalide");
    }

    if (skills.length === 0) {
      throw new Error("Le technicien doit avoir au moins une compétence");
    }

    return new Technician(
      uuidv4(),
      name,
      email,
      phone,
      skills,
      true, // Par défaut actif
      new Date()
    );
  }

  static restore(
    id: string,
    name: string,
    email: string,
    phone: string | undefined,
    skills: TechnicianSkill[],
    isActive: boolean,
    createdAt: Date
  ): Technician {
    return new Technician(id, name, email, phone, skills, isActive, createdAt);
  }

  hasSkill(skill: TechnicianSkill): boolean {
    return this.skills.includes(skill);
  }

  hasAnySkill(requiredSkills: TechnicianSkill[]): boolean {
    return requiredSkills.some(skill => this.skills.includes(skill));
  }
}
