import { WorkOrder } from "../entities/WorkOrder";

export interface WorkOrderPartDetails {
    partId: string;
    partReference: string;
    partName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface WorkOrderRepository {
    save(order: WorkOrder): Promise<void>;
    findByAssetId(assetId: string): Promise<WorkOrder[]>;
    findById(id:string): Promise<WorkOrder | null>;
    update(order: WorkOrder): Promise<void>;
    countPending(): Promise<number>;
    addPart(workOrderId: string, partId: string, quantity: number, unitPrice: number): Promise<void>;
    getWorkOrderParts(workOrderId: string): Promise<WorkOrderPartDetails[]>;
}   