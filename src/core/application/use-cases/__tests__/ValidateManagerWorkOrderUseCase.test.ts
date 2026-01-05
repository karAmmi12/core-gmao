import { ValidateManagerWorkOrderUseCase } from '../ValidateManagerWorkOrderUseCase';
import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { IWorkOrderPartRepository } from '@/core/domain/repositories/WorkOrderPartRepository';
import { WorkOrder } from '@/core/domain/entities/WorkOrder';
import { WorkOrderPart } from '@/core/domain/entities/WorkOrderPart';

// Mock TransactionManager
jest.mock('@/core/infrastructure/transaction/TransactionManager', () => ({
  TransactionManager: {
    executeWithRetry: jest.fn((fn) => fn({
      workOrder: { update: jest.fn() },
      workOrderPart: { update: jest.fn() }
    }))
  }
}));

// Mock repositories
class MockWorkOrderRepository implements WorkOrderRepository {
  private workOrders: Map<string, WorkOrder> = new Map();

  async findById(id: string): Promise<WorkOrder | null> {
    return this.workOrders.get(id) || null;
  }

  async save(workOrder: WorkOrder): Promise<void> {
    this.workOrders.set(workOrder.id, workOrder);
  }

  async update(workOrder: WorkOrder): Promise<void> {
    return this.save(workOrder);
  }

  async findAll(): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values());
  }

  async findAllPaginated(page: number, pageSize: number): Promise<any> {
    const items = Array.from(this.workOrders.values());
    return { items, total: items.length, page, pageSize, totalPages: 1 };
  }

  async findByAssetId(assetId: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).filter(wo => wo.assetId === assetId);
  }

  async findByAssignedTo(technicianId: string): Promise<WorkOrder[]> {
    return [];
  }

  async countPending(): Promise<number> {
    return 0;
  }

  async countByType(): Promise<any> {
    return {};
  }

  async addPart(workOrderId: string, partId: string, quantity: number, unitPrice: number): Promise<void> {}

  async getWorkOrderParts(workOrderId: string): Promise<any[]> {
    return [];
  }

  async getWorkOrderPartsBatch(workOrderIds: string[]): Promise<Record<string, any[]>> {
    return {};
  }

  async delete(id: string): Promise<void> {
    this.workOrders.delete(id);
  }

  addWorkOrder(workOrder: WorkOrder): void {
    this.workOrders.set(workOrder.id, workOrder);
  }
}

class MockWorkOrderPartRepository implements IWorkOrderPartRepository {
  private parts: Map<string, WorkOrderPart> = new Map();

  async findByWorkOrderId(workOrderId: string): Promise<WorkOrderPart[]> {
    return Array.from(this.parts.values()).filter(
      (part) => part.workOrderId === workOrderId
    );
  }

  async save(part: WorkOrderPart): Promise<void> {
    this.parts.set(part.id, part);
  }

  async findById(id: string): Promise<WorkOrderPart | null> {
    return this.parts.get(id) || null;
  }

  async findAll(): Promise<WorkOrderPart[]> {
    return Array.from(this.parts.values());
  }

  async findPendingReservations(): Promise<WorkOrderPart[]> {
    return [];
  }

  async delete(id: string): Promise<void> {
    this.parts.delete(id);
  }

  async deleteByWorkOrderId(workOrderId: string): Promise<void> {
    Array.from(this.parts.values())
      .filter(p => p.workOrderId === workOrderId)
      .forEach(p => this.parts.delete(p.id));
  }

  addPart(part: WorkOrderPart): void {
    this.parts.set(part.id, part);
  }
}

describe('ValidateManagerWorkOrderUseCase', () => {
  let useCase: ValidateManagerWorkOrderUseCase;
  let workOrderRepo: MockWorkOrderRepository;
  let workOrderPartRepo: MockWorkOrderPartRepository;

  beforeEach(() => {
    workOrderRepo = new MockWorkOrderRepository();
    workOrderPartRepo = new MockWorkOrderPartRepository();
    useCase = new ValidateManagerWorkOrderUseCase(
      workOrderRepo,
      workOrderPartRepo
    );
  });

  it('should validate work order with auto-calculated material cost', async () => {
    // Arrange
    const workOrder = WorkOrder.forTest({
      id: 'wo-1',
      assetId: 'asset-1',
      type: 'CORRECTIVE',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      title: 'Test intervention',
      description: 'Test description',
      assignedToId: 'tech-1',
      actualDuration: 120,
      completedAt: new Date(),
      startedAt: new Date(),
    });
    workOrderRepo.addWorkOrder(workOrder);

    // Add consumed parts
    const part1 = WorkOrderPart.create({
      id: 'part-1',
      workOrderId: 'wo-1',
      partId: 'spare-1',
      quantityPlanned: 5,
      unitPrice: 10,
    });
    part1.reserve(5, 'stock-manager-1');
    part1.consume(5);

    const part2 = WorkOrderPart.create({
      id: 'part-2',
      workOrderId: 'wo-1',
      partId: 'spare-2',
      quantityPlanned: 3,
      unitPrice: 20,
    });
    part2.reserve(3, 'stock-manager-1');
    part2.consume(3);

    workOrderPartRepo.addPart(part1);
    workOrderPartRepo.addPart(part2);

    // Act
    await useCase.execute({
      workOrderId: 'wo-1',
      managerId: 'manager-1',
      laborCost: 150,
      materialCostAdjustment: 10,
    });

    // Assert
    const updatedWorkOrder = await workOrderRepo.findById('wo-1');
    expect(updatedWorkOrder?.approvedById).toBe('manager-1');
    expect(updatedWorkOrder?.approvedAt).toBeInstanceOf(Date);
    expect(updatedWorkOrder?.laborCost).toBe(150);
    expect(updatedWorkOrder?.materialCost).toBe(120); // 50 + 60 + 10 (adjustment)
  });

  it('should throw error if work order not found', async () => {
    await expect(
      useCase.execute({
        workOrderId: 'non-existent',
        managerId: 'manager-1',
        laborCost: 150,
      })
    ).rejects.toThrow('Intervention non trouvée.');
  });

  it('should throw error if work order is not completed', async () => {
    const workOrder = WorkOrder.forTest({
      id: 'wo-1',
      assetId: 'asset-1',
      type: 'CORRECTIVE',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      title: 'Test intervention',
      description: 'Test description',
    });
    workOrderRepo.addWorkOrder(workOrder);

    await expect(
      useCase.execute({
        workOrderId: 'wo-1',
        managerId: 'manager-1',
        laborCost: 150,
      })
    ).rejects.toThrow("L'intervention doit être terminée pour être validée.");
  });

  it('should validate without consumed parts', async () => {
    const workOrder = WorkOrder.forTest({
      id: 'wo-1',
      assetId: 'asset-1',
      type: 'CORRECTIVE',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      title: 'Test intervention',
      description: 'Test description',
      actualDuration: 120,
      completedAt: new Date(),
      startedAt: new Date(),
    });
    workOrderRepo.addWorkOrder(workOrder);

    await useCase.execute({
      workOrderId: 'wo-1',
      managerId: 'manager-1',
      laborCost: 150,
    });

    const updatedWorkOrder = await workOrderRepo.findById('wo-1');
    expect(updatedWorkOrder?.materialCost).toBe(0);
    expect(updatedWorkOrder?.laborCost).toBe(150);
  });
});
