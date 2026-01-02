import { ValidateManagerWorkOrderUseCase } from '../ValidateManagerWorkOrderUseCase';
import { IWorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { IWorkOrderPartRepository } from '@/core/domain/repositories/WorkOrderPartRepository';
import { WorkOrder } from '@/core/domain/entities/WorkOrder';
import { WorkOrderPart } from '@/core/domain/entities/WorkOrderPart';

// Mock repositories
class MockWorkOrderRepository implements IWorkOrderRepository {
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
    const part1 = new WorkOrderPart({
      id: 'part-1',
      workOrderId: 'wo-1',
      partId: 'spare-1',
      quantityPlanned: 5,
      quantityConsumed: 5,
      status: 'CONSUMED',
      unitPrice: 10,
      totalPrice: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const part2 = new WorkOrderPart({
      id: 'part-2',
      workOrderId: 'wo-1',
      partId: 'spare-2',
      quantityPlanned: 3,
      quantityConsumed: 3,
      status: 'CONSUMED',
      unitPrice: 20,
      totalPrice: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
