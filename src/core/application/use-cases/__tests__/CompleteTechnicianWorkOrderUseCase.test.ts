import { CompleteTechnicianWorkOrderUseCase } from '../CompleteTechnicianWorkOrderUseCase';
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

  // Helper for tests
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

  // Helper for tests
  addPart(part: WorkOrderPart): void {
    this.parts.set(part.id, part);
  }
}

describe('CompleteTechnicianWorkOrderUseCase', () => {
  let useCase: CompleteTechnicianWorkOrderUseCase;
  let workOrderRepo: MockWorkOrderRepository;
  let workOrderPartRepo: MockWorkOrderPartRepository;

  beforeEach(() => {
    workOrderRepo = new MockWorkOrderRepository();
    workOrderPartRepo = new MockWorkOrderPartRepository();
    useCase = new CompleteTechnicianWorkOrderUseCase(
      workOrderRepo,
      workOrderPartRepo
    );
  });

  it('should complete work order and mark parts as consumed', async () => {
    // Arrange
    const workOrder = WorkOrder.forTest({
      id: 'wo-1',
      assetId: 'asset-1',
      type: 'CORRECTIVE',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      title: 'Test intervention',
      description: 'Test description',
      assignedToId: 'tech-1',
      startedAt: new Date(),
    });
    workOrderRepo.addWorkOrder(workOrder);

    const part1 = WorkOrderPart.create({
      id: 'part-1',
      workOrderId: 'wo-1',
      partId: 'spare-1',
      quantityPlanned: 5,
      unitPrice: 10,
    });

    const part2 = WorkOrderPart.create({
      id: 'part-2',
      workOrderId: 'wo-1',
      partId: 'spare-2',
      quantityPlanned: 3,
      unitPrice: 20,
    });
    // Simuler la réservation
    part2.reserve(3, 'stock-manager-1');

    workOrderPartRepo.addPart(part1);
    workOrderPartRepo.addPart(part2);

    // Act
    await useCase.execute({
      workOrderId: 'wo-1',
      technicianId: 'tech-1',
      actualDuration: 120,
      notes: 'Test completion notes',
    });

    // Assert
    const updatedWorkOrder = await workOrderRepo.findById('wo-1');
    expect(updatedWorkOrder?.status).toBe('COMPLETED');
    expect(updatedWorkOrder?.actualDuration).toBe(120);
    expect(updatedWorkOrder?.completedAt).toBeInstanceOf(Date);

    const updatedParts = await workOrderPartRepo.findByWorkOrderId('wo-1');
    expect(updatedParts).toHaveLength(2);
    
    const updatedPart1 = updatedParts.find((p) => p.id === 'part-1');
    expect(updatedPart1?.status).toBe('CONSUMED');
    expect(updatedPart1?.quantityConsumed).toBe(5);
    expect(updatedPart1?.totalPrice).toBe(50); // 5 * 10

    const updatedPart2 = updatedParts.find((p) => p.id === 'part-2');
    expect(updatedPart2?.status).toBe('CONSUMED');
    expect(updatedPart2?.quantityConsumed).toBe(3);
    expect(updatedPart2?.totalPrice).toBe(60); // 3 * 20
  });

  it('should throw error if work order not found', async () => {
    await expect(
      useCase.execute({
        workOrderId: 'non-existent',
        technicianId: 'tech-1',
        actualDuration: 120,
      })
    ).rejects.toThrow('Intervention non trouvée.');
  });

  it('should throw error if work order is not in progress', async () => {
    const workOrder = WorkOrder.forTest({
      id: 'wo-1',
      assetId: 'asset-1',
      type: 'CORRECTIVE',
      priority: 'MEDIUM',
      status: 'PENDING',
      title: 'Test intervention',
      description: 'Test description',      assignedToId: 'tech-1',    });
    workOrderRepo.addWorkOrder(workOrder);

    await expect(
      useCase.execute({
        workOrderId: 'wo-1',
        technicianId: 'tech-1',
        actualDuration: 120,
      })
    ).rejects.toThrow("L'intervention doit être en cours pour être terminée.");
  });

  it('should complete work order without parts', async () => {
    const workOrder = WorkOrder.forTest({
      id: 'wo-1',
      assetId: 'asset-1',
      type: 'CORRECTIVE',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      title: 'Test intervention',
      description: 'Test description',
      assignedToId: 'tech-1',
      startedAt: new Date(),
    });
    workOrderRepo.addWorkOrder(workOrder);

    await useCase.execute({
      workOrderId: 'wo-1',
      technicianId: 'tech-1',
      actualDuration: 120,
    });

    const updatedWorkOrder = await workOrderRepo.findById('wo-1');
    expect(updatedWorkOrder?.status).toBe('COMPLETED');
  });
});
