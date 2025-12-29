import { TechnicianRepository, UpdateTechnicianData } from "@/core/domain/repositories/TechnicianRepository";
import { Technician, TechnicianSkill } from "@/core/domain/entities/Technician";
import { prisma } from "@/lib/prisma";

export class PrismaTechnicianRepository implements TechnicianRepository {
  async save(technician: Technician): Promise<void> {
    await prisma.technician.create({
      data: {
        id: technician.id,
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        skills: JSON.stringify(technician.skills),
        isActive: technician.isActive,
        createdAt: technician.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Technician | null> {
    const raw = await prisma.technician.findUnique({ where: { id } });
    if (!raw) return null;

    return Technician.restore(
      raw.id,
      raw.name,
      raw.email,
      raw.phone ?? undefined,
      JSON.parse(raw.skills) as TechnicianSkill[],
      raw.isActive,
      raw.createdAt
    );
  }

  async findByEmail(email: string): Promise<Technician | null> {
    const raw = await prisma.technician.findUnique({ where: { email } });
    if (!raw) return null;

    return Technician.restore(
      raw.id,
      raw.name,
      raw.email,
      raw.phone ?? undefined,
      JSON.parse(raw.skills) as TechnicianSkill[],
      raw.isActive,
      raw.createdAt
    );
  }

  async findAll(): Promise<Technician[]> {
    const rawTechs = await prisma.technician.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return rawTechs.map(raw =>
      Technician.restore(
        raw.id,
        raw.name,
        raw.email,
        raw.phone ?? undefined,
        JSON.parse(raw.skills) as TechnicianSkill[],
        raw.isActive,
        raw.createdAt
      )
    );
  }

  async findBySkill(skill: string): Promise<Technician[]> {
    const allTechs = await this.findAll();
    return allTechs.filter(tech => 
      tech.skills.includes(skill as TechnicianSkill)
    );
  }

  async findAvailable(date: Date, duration: number): Promise<Technician[]> {
    // Trouver les techniciens qui n'ont pas d'intervention planifiée
    // dans la période [date, date + duration]
    const endDate = new Date(date.getTime() + duration * 60 * 1000);

    const busyTechIds = await prisma.workOrder.findMany({
      where: {
        assignedToId: { not: null },
        scheduledAt: {
          gte: date,
          lt: endDate,
        },
        status: { in: ['PLANNED', 'IN_PROGRESS'] },
      },
      select: { assignedToId: true },
    });

    const busyIds = busyTechIds
      .map(wo => wo.assignedToId)
      .filter(Boolean) as string[];

    const availableTechs = await prisma.technician.findMany({
      where: {
        isActive: true,
        id: { notIn: busyIds },
      },
    });

    return availableTechs.map(raw =>
      Technician.restore(
        raw.id,
        raw.name,
        raw.email,
        raw.phone ?? undefined,
        JSON.parse(raw.skills) as TechnicianSkill[],
        raw.isActive,
        raw.createdAt
      )
    );
  }

  async update(id: string, data: UpdateTechnicianData): Promise<void> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.skills !== undefined) updateData.skills = JSON.stringify(data.skills);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await prisma.technician.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.technician.delete({
      where: { id },
    });
  }
}
