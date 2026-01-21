import { WorkOrder, OrderStatus, OrderPriority, MaintenanceType } from "../entities/WorkOrder";

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface WorkOrderSummary {
    id: string;
    title: string;
    status: OrderStatus;
    priority: OrderPriority;
    type: MaintenanceType;
    assetId: string;
    assetName: string;
    assignedToId?: string;
    assignedToName?: string;
    createdAt: Date;
    scheduledAt?: Date;
    description?: string;
    estimatedCost?: number;
    requiresApproval: boolean;
}

export interface WorkOrderPartDetails {
    partId: string;
    partReference: string;
    partName: string;
    quantityPlanned: number;
    quantityReserved: number;
    quantityConsumed: number;
    status: string;
    unitPrice: number;
    totalPrice: number;
}

export interface OrdersByTypeStats {
    CORRECTIVE: number;
    PREVENTIVE: number;
    PREDICTIVE: number;
    CONDITIONAL: number;
}

export interface WorkOrderRepository {
    save(order: WorkOrder): Promise<void>;
    findAll(): Promise<WorkOrder[]>;
    findMany(filters: any, limit?: number): Promise<WorkOrder[]>;
    count(filters: any): Promise<number>; // Nouvelle méthode pour compter
    findAllPaginated(page: number, pageSize: number): Promise<PaginatedResult<WorkOrder>>;
    findByAssetId(assetId: string): Promise<WorkOrder[]>;
    findByAssignedTo(technicianId: string): Promise<WorkOrder[]>;
    findById(id:string): Promise<WorkOrder | null>;
    update(order: WorkOrder): Promise<void>;
    findPending(): Promise<WorkOrderSummary[]>;
    countPending(): Promise<number>;
    countByType?(): Promise<OrdersByTypeStats>;
    addPart(workOrderId: string, partId: string, quantity: number, unitPrice: number): Promise<void>;
    getWorkOrderParts(workOrderId: string): Promise<WorkOrderPartDetails[]>;
    getWorkOrderPartsBatch(workOrderIds: string[]): Promise<Record<string, WorkOrderPartDetails[]>>;
}   