import { WorkOrder } from '../WorkOrder';

describe('WorkOrder Entity', () => {
  describe('completeByTechnician', () => {
    it('should mark work order as completed with actual duration', () => {
      const workOrder = WorkOrder.forTest({
        id: '1',
        assetId: 'asset-1',
        type: 'CORRECTIVE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        title: 'Test intervention',
        description: 'Test description',
        assignedToId: 'tech-1',
        startedAt: new Date(),
        createdAt: new Date(),
      });

      workOrder.completeByTechnician(120);

      expect(workOrder.status).toBe('COMPLETED');
      expect(workOrder.actualDuration).toBe(120);
      expect(workOrder.completedAt).toBeInstanceOf(Date);
    });

    it('should throw error if work order is not in progress', () => {
      const workOrder = WorkOrder.forTest({
        id: '1',
        assetId: 'asset-1',
        type: 'CORRECTIVE',
        priority: 'MEDIUM',
        status: 'PENDING',
        title: 'Test intervention',
        description: 'Test description',
      });

      expect(() => {
        workOrder.completeByTechnician(120);
      }).toThrow("L'intervention doit être en cours pour être terminée.");
    });
  });

  describe('validateByManager', () => {
    it('should add costs and manager validation', () => {
      const workOrder = WorkOrder.forTest({
        id: '1',
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

      workOrder.validateByManager('manager-1', {
        laborCost: 150,
        materialCost: 50,
      });

      expect(workOrder.laborCost).toBe(150);
      expect(workOrder.materialCost).toBe(50);
      expect(workOrder.approvedById).toBe('manager-1');
      expect(workOrder.approvedAt).toBeInstanceOf(Date);
    });

    it('should throw error if work order is not completed', () => {
      const workOrder = WorkOrder.forTest({
        id: '1',
        assetId: 'asset-1',
        type: 'CORRECTIVE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        title: 'Test intervention',
        description: 'Test description',
      });

      expect(() => {
        workOrder.validateByManager('manager-1', {
          laborCost: 150,
          materialCost: 50,
        });
      }).toThrow("L'intervention doit être terminée pour être validée.");
    });

    it('should throw error if costs are negative', () => {
      const workOrder = WorkOrder.forTest({
        id: '1',
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

      expect(() => {
        workOrder.validateByManager('manager-1', {
          laborCost: -50,
          materialCost: 50,
        });
      }).toThrow('Les coûts ne peuvent pas être négatifs');
    });
  });
});
