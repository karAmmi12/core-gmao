import { OrderStatus, OrderPriority, MaintenanceType } from '@/core/domain/entities/WorkOrder';

export interface WorkOrderPartDTO {
  partId: string;
  partReference: string;
  partName: string;
  quantity: number; // For backward compatibility (= quantityPlanned)
  quantityPlanned: number;
  quantityReserved: number;
  quantityConsumed: number;
  status: string;
  unitPrice: number;
  totalPrice: number;
}

export interface WorkOrderDTO {
  id: string;
  title: string;
  description?: string;
  status: OrderStatus;
  priority: OrderPriority;
  type: MaintenanceType;
  assetId: string;
  scheduleId?: string;
  createdAt: string; // ISO 8601
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  assignedToId?: string;
  laborCost: number;
  materialCost: number;
  totalCost: number;
  parts?: WorkOrderPartDTO[];
  // Champs d'approbation
  estimatedCost?: number;
  requiresApproval: boolean;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface AssetDetailsDTO {
  asset: {
    id: string;
    name: string;
    serialNumber: string;
    status: string;
    createdAt: string;
    parentId?: string;
    assetType?: string;
    location?: string;
    manufacturer?: string;
    modelNumber?: string;
  };
  history: WorkOrderDTO[];
}
