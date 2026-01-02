import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { WorkOrder, OrderStatus, OrderPriority, MaintenanceType } from "@/core/domain/entities/WorkOrder";
import { prisma } from "@/lib/prisma";

export class PrismaWorkOrderRepository implements WorkOrderRepository {
  
  async save(order: WorkOrder): Promise<void> {
    await prisma.workOrder.create({
      data: {
        id: order.id,
        title: order.title,
        description: order.description,
        status: order.status,
        priority: order.priority,
        type: order.type,
        assetId: order.assetId,
        createdAt: order.createdAt,
        scheduledAt: order.scheduledAt,
        startedAt: order.startedAt,
        completedAt: order.completedAt,
        estimatedDuration: order.estimatedDuration,
        actualDuration: order.actualDuration,
        assignedToId: order.assignedToId,
        laborCost: order.laborCost,
        materialCost: order.materialCost,
        totalCost: order.totalCost,
        estimatedCost: order.estimatedCost,
        requiresApproval: order.requiresApproval,
        approvedById: order.approvedById,
        approvedAt: order.approvedAt,
        rejectionReason: order.rejectionReason,
      },
    });
  }

  async findAll(): Promise<WorkOrder[]> {
    const rawOrders = await prisma.workOrder.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return rawOrders.map(o => 
      WorkOrder.restore(
        o.id,
        o.title,
        o.description ?? undefined,
        o.status as OrderStatus,
        o.priority as OrderPriority,
        (o.type || 'CORRECTIVE') as MaintenanceType,
        o.assetId,
        undefined, // scheduleId - not in schema yet
        o.createdAt,
        o.scheduledAt ?? undefined,
        o.startedAt ?? undefined,
        o.completedAt ?? undefined,
        o.estimatedDuration ?? undefined,
        o.actualDuration ?? undefined,
        o.assignedToId ?? undefined,
        o.laborCost,
        o.materialCost,
        o.totalCost,
        o.estimatedCost ?? undefined,
        o.requiresApproval,
        o.approvedById ?? undefined,
        o.approvedAt ?? undefined,
        o.rejectionReason ?? undefined
      )
    );
  }

  async findByAssetId(assetId: string): Promise<WorkOrder[]> {
    const rawOrders = await prisma.workOrder.findMany({ 
      where: { assetId },
      orderBy: { createdAt: 'desc' }
    });
    
    return rawOrders.map(o => 
      WorkOrder.restore(
        o.id,
        o.title,
        o.description ?? undefined,
        o.status as OrderStatus,
        o.priority as OrderPriority,
        (o.type || 'CORRECTIVE') as MaintenanceType,
        o.assetId,
        undefined, // scheduleId
        o.createdAt,
        o.scheduledAt ?? undefined,
        o.startedAt ?? undefined,
        o.completedAt ?? undefined,
        o.estimatedDuration ?? undefined,
        o.actualDuration ?? undefined,
        o.assignedToId ?? undefined,
        o.laborCost,
        o.materialCost,
        o.totalCost,
        o.estimatedCost ?? undefined,
        o.requiresApproval,
        o.approvedById ?? undefined,
        o.approvedAt ?? undefined,
        o.rejectionReason ?? undefined
      )
    );
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const raw = await prisma.workOrder.findUnique({ where: { id } });
    if (!raw) return null;
    
    return WorkOrder.restore(
      raw.id,
      raw.title,
      raw.description ?? undefined,
      raw.status as OrderStatus,
      raw.priority as OrderPriority,
      (raw.type || 'CORRECTIVE') as MaintenanceType,
      raw.assetId,
      undefined, // scheduleId
      raw.createdAt,
      raw.scheduledAt ?? undefined,
      raw.startedAt ?? undefined,
      raw.completedAt ?? undefined,
      raw.estimatedDuration ?? undefined,
      raw.actualDuration ?? undefined,
      raw.assignedToId ?? undefined,
      raw.laborCost,
      raw.materialCost,
      raw.totalCost,
      raw.estimatedCost ?? undefined,
      raw.requiresApproval,
      raw.approvedById ?? undefined,
      raw.approvedAt ?? undefined,
      raw.rejectionReason ?? undefined
    );
  }

  async update(order: WorkOrder): Promise<void> {
    await prisma.workOrder.update({
      where: { id: order.id },
      data: {
        title: order.title,
        status: order.status,
        priority: order.priority,
        type: order.type,
        description: order.description,
        scheduledAt: order.scheduledAt,
        startedAt: order.startedAt,
        completedAt: order.completedAt,
        estimatedDuration: order.estimatedDuration,
        actualDuration: order.actualDuration,
        assignedToId: order.assignedToId,
        laborCost: order.laborCost,
        materialCost: order.materialCost,
        totalCost: order.totalCost,
      },
    });
  }

  async countPending(): Promise<number> {
    return prisma.workOrder.count({ 
      where: { status: { in: ['DRAFT', 'PLANNED', 'IN_PROGRESS'] } }
    });
  }

  async countByType(): Promise<{ CORRECTIVE: number; PREVENTIVE: number; PREDICTIVE: number; CONDITIONAL: number }> {
    const counts = await prisma.workOrder.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    const result = {
      CORRECTIVE: 0,
      PREVENTIVE: 0,
      PREDICTIVE: 0,
      CONDITIONAL: 0
    };

    for (const count of counts) {
      const type = count.type as keyof typeof result;
      if (type in result) {
        result[type] = count._count.id;
      }
    }

    return result;
  }

  async addPart(workOrderId: string, partId: string, quantity: number, unitPrice: number): Promise<void> {
    const { v4: uuidv4 } = await import('uuid');
    await prisma.workOrderPart.create({
      data: {
        id: uuidv4(),
        workOrderId,
        partId,
        quantityPlanned: quantity,
        quantityReserved: 0,
        quantityConsumed: 0,
        status: 'PLANNED',
        unitPrice,
        totalPrice: 0, // Calculé à la consommation
      },
    });
  }

  async getWorkOrderParts(workOrderId: string) {
    const parts = await prisma.workOrderPart.findMany({
      where: { workOrderId },
      include: {
        part: true,
      },
    });

    return parts.map(p => ({
      partId: p.partId,
      partReference: p.part.reference,
      partName: p.part.name,
      quantityPlanned: p.quantityPlanned,
      quantityReserved: p.quantityReserved,
      quantityConsumed: p.quantityConsumed,
      status: p.status,
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
    }));
  }
}