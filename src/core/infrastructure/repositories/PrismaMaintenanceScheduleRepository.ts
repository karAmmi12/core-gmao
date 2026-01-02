import { MaintenanceSchedule, MaintenanceFrequency, MaintenanceTriggerType, MaintenanceType } from '@/core/domain/entities/MaintenanceSchedule';
import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';
import { prisma } from '@/shared/lib/prisma';

// Type pour les données brutes de Prisma
type PrismaSchedule = {
  id: string;
  assetId: string;
  title: string;
  description: string | null;
  maintenanceType: string;
  triggerType: string;
  frequency: string;
  intervalValue: number;
  lastExecutedAt: Date | null;
  nextDueDate: Date;
  thresholdMetric: string | null;
  thresholdValue: number | null;
  thresholdUnit: string | null;
  currentValue: number | null;
  estimatedDuration: number | null;
  assignedToId: string | null;
  isActive: boolean;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
};

// Fonction helper pour mapper les données Prisma vers l'entité
function mapToEntity(raw: PrismaSchedule): MaintenanceSchedule {
  return MaintenanceSchedule.restore(
    raw.id,
    raw.assetId,
    raw.title,
    raw.description ?? undefined,
    (raw.maintenanceType as MaintenanceType) || 'PREVENTIVE',
    (raw.triggerType as MaintenanceTriggerType) || 'TIME_BASED',
    raw.frequency as MaintenanceFrequency,
    raw.intervalValue,
    raw.lastExecutedAt ?? undefined,
    raw.nextDueDate,
    raw.thresholdMetric ?? undefined,
    raw.thresholdValue ?? undefined,
    raw.thresholdUnit ?? undefined,
    raw.currentValue ?? undefined,
    raw.estimatedDuration ?? undefined,
    raw.assignedToId ?? undefined,
    raw.isActive,
    raw.priority as 'LOW' | 'HIGH',
    raw.createdAt,
    raw.updatedAt
  );
}

export class PrismaMaintenanceScheduleRepository implements MaintenanceScheduleRepository {
  async save(schedule: MaintenanceSchedule): Promise<void> {
    await prisma.maintenanceSchedule.create({
      data: {
        id: schedule.id,
        assetId: schedule.assetId,
        title: schedule.title,
        description: schedule.description,
        maintenanceType: schedule.maintenanceType,
        triggerType: schedule.triggerType,
        frequency: schedule.frequency,
        intervalValue: schedule.intervalValue,
        lastExecutedAt: schedule.lastExecutedAt,
        nextDueDate: schedule.nextDueDate,
        thresholdMetric: schedule.thresholdMetric,
        thresholdValue: schedule.thresholdValue,
        thresholdUnit: schedule.thresholdUnit,
        currentValue: schedule.currentValue,
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
    return mapToEntity(raw as PrismaSchedule);
  }

  async findByAssetId(assetId: string): Promise<MaintenanceSchedule[]> {
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: { assetId },
      orderBy: { nextDueDate: 'asc' },
    });

    return schedules.map(raw => mapToEntity(raw as PrismaSchedule));
  }

  async findByAssignedTo(technicianId: string): Promise<MaintenanceSchedule[]> {
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: { assignedToId: technicianId },
      orderBy: { nextDueDate: 'asc' },
    });

    return schedules.map(raw => mapToEntity(raw as PrismaSchedule));
  }

  async findDueSchedules(): Promise<MaintenanceSchedule[]> {
    // Pour TIME_BASED : nextDueDate <= now
    // Pour THRESHOLD_BASED : currentValue >= thresholdValue
    const now = new Date();
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: {
        isActive: true,
        OR: [
          // Time-based schedules qui sont en retard
          {
            triggerType: 'TIME_BASED',
            nextDueDate: { lte: now },
          },
          // Threshold-based schedules où le seuil est atteint
          // Note: Cette logique est vérifiée en code car Prisma ne supporte pas
          // facilement la comparaison de deux colonnes
        ],
      },
      orderBy: { nextDueDate: 'asc' },
    });

    // Filtrer les threshold-based qui sont vraiment dus
    return schedules
      .map(raw => mapToEntity(raw as PrismaSchedule))
      .filter(schedule => schedule.isDue());
  }

  async findAll(): Promise<MaintenanceSchedule[]> {
    const schedules = await prisma.maintenanceSchedule.findMany({
      orderBy: [
        { triggerType: 'asc' },
        { nextDueDate: 'asc' },
      ],
    });

    return schedules.map(raw => mapToEntity(raw as PrismaSchedule));
  }

  async update(schedule: MaintenanceSchedule): Promise<void> {
    await prisma.maintenanceSchedule.update({
      where: { id: schedule.id },
      data: {
        title: schedule.title,
        description: schedule.description,
        maintenanceType: schedule.maintenanceType,
        triggerType: schedule.triggerType,
        frequency: schedule.frequency,
        intervalValue: schedule.intervalValue,
        lastExecutedAt: schedule.lastExecutedAt,
        nextDueDate: schedule.nextDueDate,
        thresholdMetric: schedule.thresholdMetric,
        thresholdValue: schedule.thresholdValue,
        thresholdUnit: schedule.thresholdUnit,
        currentValue: schedule.currentValue,
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
