import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { TechnicianRepository } from '@/core/domain/repositories/TechnicianRepository';
import { MaintenanceScheduleMapper, MaintenanceScheduleDTO } from '../dto/MaintenanceScheduleDTO';

export class MaintenanceScheduleService {
  constructor(
    private maintenanceScheduleRepository: MaintenanceScheduleRepository,
    private assetRepository: AssetRepository,
    private technicianRepository: TechnicianRepository
  ) {}

  async getScheduleById(id: string): Promise<MaintenanceScheduleDTO | null> {
    const schedule = await this.maintenanceScheduleRepository.findById(id);
    if (!schedule) return null;

    // Fetch asset name
    const asset = await this.assetRepository.findById(schedule.assetId);
    const assetName = asset?.name;

    // Fetch technician name if assigned
    let assignedToName: string | undefined;
    if (schedule.assignedToId) {
      const technician = await this.technicianRepository.findById(schedule.assignedToId);
      assignedToName = technician?.name;
    }

    return MaintenanceScheduleMapper.toDTO(schedule, assetName, assignedToName);
  }

  async getSchedulesByAssetId(assetId: string): Promise<MaintenanceScheduleDTO[]> {
    const schedules = await this.maintenanceScheduleRepository.findByAssetId(assetId);
    
    const asset = await this.assetRepository.findById(assetId);
    const assetName = asset?.name;

    const dtos = await Promise.all(
      schedules.map(async (schedule) => {
        let assignedToName: string | undefined;
        if (schedule.assignedToId) {
          const technician = await this.technicianRepository.findById(schedule.assignedToId);
          assignedToName = technician?.name;
        }
        return MaintenanceScheduleMapper.toDTO(schedule, assetName, assignedToName);
      })
    );

    return dtos;
  }

  async getAllSchedules(): Promise<MaintenanceScheduleDTO[]> {
    const schedules = await this.maintenanceScheduleRepository.findAll();
    
    const dtos = await Promise.all(
      schedules.map(async (schedule) => {
        const asset = await this.assetRepository.findById(schedule.assetId);
        const assetName = asset?.name;

        let assignedToName: string | undefined;
        if (schedule.assignedToId) {
          const technician = await this.technicianRepository.findById(schedule.assignedToId);
          assignedToName = technician?.name;
        }

        return MaintenanceScheduleMapper.toDTO(schedule, assetName, assignedToName);
      })
    );

    return dtos;
  }

  async getDueSchedules(): Promise<MaintenanceScheduleDTO[]> {
    const schedules = await this.maintenanceScheduleRepository.findDueSchedules();
    
    const dtos = await Promise.all(
      schedules.map(async (schedule) => {
        const asset = await this.assetRepository.findById(schedule.assetId);
        const assetName = asset?.name;

        let assignedToName: string | undefined;
        if (schedule.assignedToId) {
          const technician = await this.technicianRepository.findById(schedule.assignedToId);
          assignedToName = technician?.name;
        }

        return MaintenanceScheduleMapper.toDTO(schedule, assetName, assignedToName);
      })
    );

    return dtos;
  }
}
