import { WorkOrder } from "../entities/WorkOrder";

export interface WorkOrderRepository {
    save(order: WorkOrder): Promise<void>;
    findByAssetId(assetId: string): Promise<WorkOrder[]>;
    findById(id:string): Promise<WorkOrder | null>;
    update(order: WorkOrder): Promise<void>;
    countPending(): Promise<number>;
}   