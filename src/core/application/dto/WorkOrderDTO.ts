import { OrderStatus, OrderPriority } from '@/core/domain/entities/WorkOrder';

export interface WorkOrderPartDTO {
  partId: string;
  partReference: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface WorkOrderDTO {
  id: string;
  title: string;
  description?: string;
  status: OrderStatus;
  priority: OrderPriority;
  assetId: string;
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
