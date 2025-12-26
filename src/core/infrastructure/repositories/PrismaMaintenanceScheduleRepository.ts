import { MaintenanceSchedule, MaintenanceFrequency } from '@/core/domain/entities/MaintenanceSchedule';
import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';
import { prisma } from '@/lib/prisma';

export class PrismaMaintenanceScheduleRepository implements MaintenanceScheduleRepository {
  async save(schedule: MaintenanceSchedule): Promise<void> {
    await prisma.maintenanceSchedule.create({
      data: {
        id: schedule.id,
        assetId: schedule.assetId,
        title: schedule.title,
        description: schedule.description,
        frequency: schedule.frequency,
        intervalValue: schedule.intervalValue,
        lastExecutedAt: schedule.lastExecutedAt,
        nextDueDate: schedule.nextDueDate,
        estimatedDuration: schedule.estimatedDuration,
        assignedToId: schedule.assignedToId,
        isActive: schedule.isActive,
        priority: schedule.priority,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<MaintenanceSchedule | null> {
    const raw = await prisma.maintenanceSchedule.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return MaintenanceSchedule.restore(
      raw.id,
      raw.assetId,
      raw.title,
      raw.description ?? undefined,
      raw.frequency as MaintenanceFrequency,
      raw.intervalValue,
      raw.lastExecutedAt ?? undefined,
      raw.nextDueDate,
      raw.estimatedDuration ?? undefined,
      raw.assignedToId ?? undefined,
      raw.isActive,
      raw.priority as 'LOW' | 'HIGH',
      raw.createdAt,
      raw.updatedAt
    );
  }

  async findByAssetId(assetId: string): Promise<MaintenanceSchedule[]> {
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: { assetId },
      orderBy: { nextDueDate: 'asc' },
    });

    return schedules.map(raw =>
      MaintenanceSchedule.restore(
        raw.id,
        raw.assetId,
        raw.title,
        raw.description ?? undefined,
        raw.frequency as MaintenanceFrequency,
        raw.intervalValue,
        raw.lastExecutedAt ?? undefined,
        raw.nextDueDate,
        raw.estimatedDuration ?? undefined,
        raw.assignedToId ?? undefined,
        raw.isActive,
        raw.priority as 'LOW' | 'HIGH',
        raw.createdAt,
        raw.updatedAt
      )
    );
  }

  async findDueSchedules(): Promise<MaintenanceSchedule[]> {
    const now = new Date();
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: now },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    return schedules.map(raw =>
      MaintenanceSchedule.restore(
        raw.id,
        raw.assetId,
        raw.title,
        raw.description ?? undefined,
        raw.frequency as MaintenanceFrequency,
        raw.intervalValue,
        raw.lastExecutedAt ?? undefined,
        raw.nextDueDate,
        raw.estimatedDuration ?? undefined,
        raw.assignedToId ?? undefined,
        raw.isActive,
        raw.priority as 'LOW' | 'HIGH',
        raw.createdAt,
        raw.updatedAt
      )
    );
  }

  async findAll(): Promise<MaintenanceSchedule[]> {
    const schedules = await prisma.maintenanceSchedule.findMany({
      orderBy: { nextDueDate: 'asc' },
    });

    return schedules.map(raw =>
      MaintenanceSchedule.restore(
        raw.id,
        raw.assetId,
        raw.title,
        raw.description ?? undefined,
        raw.frequency as MaintenanceFrequency,
        raw.intervalValue,
        raw.lastExecutedAt ?? undefined,
        raw.nextDueDate,
        raw.estimatedDuration ?? undefined,
        raw.assignedToId ?? undefined,
        raw.isActive,
        raw.priority as 'LOW' | 'HIGH',
        raw.createdAt,
        raw.updatedAt
      )
    );
  }

  async update(schedule: MaintenanceSchedule): Promise<void> {
    await prisma.maintenanceSchedule.update({
      where: { id: schedule.id },
      data: {
        title: schedule.title,
        description: schedule.description,
        frequency: schedule.frequency,
        intervalValue: schedule.intervalValue,
        lastExecutedAt: schedule.lastExecutedAt,
        nextDueDate: schedule.nextDueDate,
        estimatedDuration: schedule.estimatedDuration,
        assignedToId: schedule.assignedToId,
        isActive: schedule.isActive,
        priority: schedule.priority,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.maintenanceSchedule.delete({
      where: { id },
    });
  }
}
