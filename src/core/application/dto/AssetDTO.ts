// Objet simple pour transférer les données (pas de logique métier)
export interface AssetDTO {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
  createdAt: string; // ISO 8601 format
}

export interface DashboardStatsDTO {
  totalAssets: number;
  runningAssets: number;
  stoppedAssets: number;
  brokenAssets: number;
  pendingOrders: number;
  availabilityRate: number;
}