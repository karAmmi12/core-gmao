// Types pour les données d'analytics (simplifiés, sans mapper vers les entités Domain complètes)
export interface AssetData {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
}

export interface WorkOrderData {
  id: string;
  title: string;
  status: string;
  type: string;
  priority: string;
  scheduledAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  assetId: string;
}

export interface PartData {
  id: string;
  name: string;
  quantityInStock: number;
  unitPrice: number;
  minStockLevel: number;
}

export interface StockMovementData {
  id: string;
  partId: string;
  type: string;
  quantity: number;
  createdAt: Date;
}

export interface TechnicianWithWorkOrdersData {
  id: string;
  name: string;
  workOrders: WorkOrderData[];
}

export interface AssetWithWorkOrdersData extends AssetData {
  workOrders: WorkOrderData[];
}

export interface WorkOrderStatusCount {
  status: string;
  count: number;
}

export interface AnalyticsRepository {
  // Dashboard KPIs
  findAllAssets(): Promise<AssetData[]>;
  findCompletedWorkOrders(): Promise<WorkOrderData[]>;
  findAllParts(): Promise<PartData[]>;
  countOverdueMaintenances(): Promise<number>;
  countPendingWorkOrders(): Promise<number>;
  
  // Maintenance Stats
  findAllWorkOrders(): Promise<WorkOrderData[]>;
  
  // Inventory Stats
  findAllStockMovements(): Promise<StockMovementData[]>;
  
  // Technician Performance
  findActiveTechniciansWithWorkOrders(): Promise<TechnicianWithWorkOrdersData[]>;
  
  // Monthly Trends
  findWorkOrdersOrderedByDate(): Promise<WorkOrderData[]>;
  
  // Asset Availability
  findAssetsWithCompletedWorkOrders(): Promise<AssetWithWorkOrdersData[]>;
  
  // Status Distribution
  countWorkOrdersByStatus(): Promise<WorkOrderStatusCount[]>;
}
