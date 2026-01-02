import { prisma } from '@/lib/prisma';
import type { 
  AnalyticsRepository,
  AssetData,
  WorkOrderData,
  PartData,
  StockMovementData,
  TechnicianWithWorkOrdersData,
  AssetWithWorkOrdersData,
  WorkOrderStatusCount
} from '@/core/domain/repositories/AnalyticsRepository';

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  
  async findAllAssets(): Promise<AssetData[]> {
    const rawAssets = await prisma.asset.findMany();
    return rawAssets.map(raw => ({
      id: raw.id,
      name: raw.name,
      status: raw.status,
      createdAt: raw.createdAt
    }));
  }

  async findCompletedWorkOrders(): Promise<WorkOrderData[]> {
    const rawOrders = await prisma.workOrder.findMany({
      where: { completedAt: { not: null } }
    });
    
    return rawOrders.map(raw => ({
      id: raw.id,
      title: raw.title,
      status: raw.status,
      type: raw.type,
      priority: raw.priority,
      scheduledAt: raw.scheduledAt,
      completedAt: raw.completedAt,
      createdAt: raw.createdAt,
      assetId: raw.assetId
    }));
  }

  async findAllParts(): Promise<PartData[]> {
    const rawParts = await prisma.part.findMany();
    return rawParts.map(raw => ({
      id: raw.id,
      name: raw.name,
      quantityInStock: raw.quantityInStock,
      unitPrice: raw.unitPrice,
      minStockLevel: raw.minStockLevel
    }));
  }

  async countOverdueMaintenances(): Promise<number> {
    return await prisma.maintenanceSchedule.count({
      where: {
        isActive: true,
        nextDueDate: { lte: new Date() }
      }
    });
  }

  async countPendingWorkOrders(): Promise<number> {
    return await prisma.workOrder.count({
      where: { status: { in: ['PENDING', 'PLANNED'] } }
    });
  }

  async findAllWorkOrders(): Promise<WorkOrderData[]> {
    const rawOrders = await prisma.workOrder.findMany();
    return rawOrders.map(raw => ({
      id: raw.id,
      title: raw.title,
      status: raw.status,
      type: raw.type,
      priority: raw.priority,
      scheduledAt: raw.scheduledAt,
      completedAt: raw.completedAt,
      createdAt: raw.createdAt,
      assetId: raw.assetId
    }));
  }

  async findAllStockMovements(): Promise<StockMovementData[]> {
    const rawMovements = await prisma.stockMovement.findMany();
    return rawMovements.map(raw => ({
      id: raw.id,
      partId: raw.partId,
      type: raw.type,
      quantity: raw.quantity,
      createdAt: raw.createdAt
    }));
  }

  async findActiveTechniciansWithWorkOrders(): Promise<TechnicianWithWorkOrdersData[]> {
    const technicians = await prisma.technician.findMany({
      where: { isActive: true },
      include: {
        workOrders: true
      }
    });

    return technicians.map(tech => ({
      id: tech.id,
      name: tech.name,
      workOrders: tech.workOrders.map(raw => ({
        id: raw.id,
        title: raw.title,
        status: raw.status,
        type: raw.type,
        priority: raw.priority,
        scheduledAt: raw.scheduledAt,
        completedAt: raw.completedAt,
        createdAt: raw.createdAt,
        assetId: raw.assetId
      }))
    }));
  }

  async findWorkOrdersOrderedByDate(): Promise<WorkOrderData[]> {
    const rawOrders = await prisma.workOrder.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    return rawOrders.map(raw => ({
      id: raw.id,
      title: raw.title,
      status: raw.status,
      type: raw.type,
      priority: raw.priority,
      scheduledAt: raw.scheduledAt,
      completedAt: raw.completedAt,
      createdAt: raw.createdAt,
      assetId: raw.assetId
    }));
  }

  async findAssetsWithCompletedWorkOrders(): Promise<AssetWithWorkOrdersData[]> {
    const rawAssets = await prisma.asset.findMany({
      include: {
        workOrders: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    return rawAssets.map(raw => ({
      id: raw.id,
      name: raw.name,
      status: raw.status,
      createdAt: raw.createdAt,
      workOrders: raw.workOrders.map(wo => ({
        id: wo.id,
        title: wo.title,
        status: wo.status,
        type: wo.type,
        priority: wo.priority,
        scheduledAt: wo.scheduledAt,
        completedAt: wo.completedAt,
        createdAt: wo.createdAt,
        assetId: wo.assetId
      }))
    }));
  }

  async countWorkOrdersByStatus(): Promise<WorkOrderStatusCount[]> {
    const results = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: true
    });

    return results.map(r => ({
      status: r.status,
      count: r._count
    }));
  }
}
