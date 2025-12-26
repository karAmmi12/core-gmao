import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { WorkOrder, OrderStatus, OrderPriority } from "@/core/domain/entities/WorkOrder";
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
      },
    });
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
        o.assetId,
        o.createdAt,
        o.scheduledAt ?? undefined,
        o.startedAt ?? undefined,
        o.completedAt ?? undefined,
        o.estimatedDuration ?? undefined,
        o.actualDuration ?? undefined,
        o.assignedToId ?? undefined,
        o.laborCost,
        o.materialCost,
        o.totalCost
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
      raw.assetId,
      raw.createdAt,
      raw.scheduledAt ?? undefined,
      raw.startedAt ?? undefined,
      raw.completedAt ?? undefined,
      raw.estimatedDuration ?? undefined,
      raw.actualDuration ?? undefined,
      raw.assignedToId ?? undefined,
      raw.laborCost,
      raw.materialCost,
      raw.totalCost
    );
  }

  async update(order: WorkOrder): Promise<void> {
    await prisma.workOrder.update({
      where: { id: order.id },
      data: {
        status: order.status,
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

  async addPart(workOrderId: string, partId: string, quantity: number, unitPrice: number): Promise<void> {
    const totalPrice = quantity * unitPrice;
    const { v4: uuidv4 } = await import('uuid');
    await prisma.workOrderPart.create({
      data: {
        id: uuidv4(),
        workOrderId,
        partId,
        quantity,
        unitPrice,
        totalPrice,
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
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
    }));
  }
}