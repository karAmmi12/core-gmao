import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { WorkOrder, OrderStatus, OrderPriority } from "@/core/domain/entities/WorkOrder";
import { prisma } from "@/lib/prisma";

export class PrismaWorkOrderRepository implements WorkOrderRepository {
  
  async save(order: WorkOrder): Promise<void> {
    await prisma.workOrder.create({
      data: {
        id: order.id,
        title: order.title,
        status: order.status,
        priority: order.priority,
        assetId: order.assetId,
        createdAt: order.createdAt,
      },
    });
  }

  async findByAssetId(assetId: string): Promise<WorkOrder[]> {
    const rawOrders = await prisma.workOrder.findMany({ 
      where: { assetId },
      orderBy: { createdAt: 'desc' } // Plus récent en premier
    });
    
    // ✅ Utilisez .restore() au lieu de .create()
    return rawOrders.map(o => 
      WorkOrder.restore(
        o.id,
        o.title,
        o.status as OrderStatus,
        o.priority as OrderPriority,
        o.assetId,
        o.createdAt
      )
    );
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const raw = await prisma.workOrder.findUnique({ where: { id } });
    if (!raw) return null;
    
    return WorkOrder.restore(
      raw.id, 
      raw.title, 
      raw.status as OrderStatus, 
      raw.priority as OrderPriority, 
      raw.assetId, 
      raw.createdAt
    );
  }

  async update(order: WorkOrder): Promise<void> {
    await prisma.workOrder.update({
      where: { id: order.id },
      data: {
        status: order.status,
      },
    });
  }

  async countPending(): Promise<number> {
    return prisma.workOrder.count({ where: { status: 'PENDING' } });
  }
}