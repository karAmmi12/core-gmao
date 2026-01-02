import { WorkOrder } from "../entities/WorkOrder";

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
    findByAssetId(assetId: string): Promise<WorkOrder[]>;
    findByAssignedTo(technicianId: string): Promise<WorkOrder[]>;
    findById(id:string): Promise<WorkOrder | null>;
    update(order: WorkOrder): Promise<void>;
    countPending(): Promise<number>;
    countByType?(): Promise<OrdersByTypeStats>;
    addPart(workOrderId: string, partId: string, quantity: number, unitPrice: number): Promise<void>;
    getWorkOrderParts(workOrderId: string): Promise<WorkOrderPartDetails[]>;
}   