import { AnalyticsRepository } from '@/core/domain/repositories/AnalyticsRepository';

export interface AssetAvailability {
  assetId: string;
  assetName: string;
  totalHours: number;
  downtimeHours: number;
  availabilityRate: number;
}

export interface MaintenanceStats {
  totalInterventions: number;
  preventiveCount: number;
  correctiveCount: number;
  preventiveRate: number;
  avgResolutionTime: number; // en heures
  completionRate: number;
}

export interface InventoryStats {
  totalParts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  movementsThisMonth: number;
  consumptionValue: number;
}

export interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  totalAssigned: number;
  completed: number;
  completionRate: number;
  avgResolutionTime: number;
}

export interface MonthlyTrend {
  month: string;
  preventive: number;
  corrective: number;
  total: number;
}

export interface DashboardKPIs {
  availability: number;
  mttr: number; // Mean Time To Repair (heures)
  preventiveRate: number;
  completionRate: number;
  stockValue: number;
  pendingOrders: number;
  overdueMaintenances: number;
}

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}
  
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const [
      assets,
      workOrders,
      parts,
      dueSchedules
    ] = await Promise.all([
      this.analyticsRepository.findAllAssets(),
      this.analyticsRepository.findCompletedWorkOrders(),
      this.analyticsRepository.findAllParts(),
      this.analyticsRepository.countOverdueMaintenances()
    ]);

    // Calcul disponibilité
    const runningAssets = assets.filter(a => a.status === 'RUNNING').length;
    const availability = assets.length > 0 ? (runningAssets / assets.length) * 100 : 0;

    // MTTR (temps moyen de réparation)
    const completedOrders = workOrders.filter(o => o.completedAt && o.scheduledAt);
    let totalResolutionTime = 0;
    completedOrders.forEach(order => {
      if (order.completedAt && order.scheduledAt) {
        const hours = (order.completedAt.getTime() - order.scheduledAt.getTime()) / (1000 * 60 * 60);
        totalResolutionTime += hours;
      }
    });
    const mttr = completedOrders.length > 0 ? totalResolutionTime / completedOrders.length : 0;

    // Taux de préventif
    const allOrders = await this.analyticsRepository.findAllWorkOrders();
    const preventiveOrders = allOrders.filter(o => o.type === 'PREVENTIVE').length;
    const preventiveRate = allOrders.length > 0 ? (preventiveOrders / allOrders.length) * 100 : 0;

    // Taux de complétion
    const completed = allOrders.filter(o => o.status === 'COMPLETED').length;
    const completionRate = allOrders.length > 0 ? (completed / allOrders.length) * 100 : 0;

    // Valeur du stock
    const stockValue = parts.reduce((sum, p) => sum + (p.quantityInStock * p.unitPrice), 0);

    // Ordres en attente
    const pendingOrders = await this.analyticsRepository.countPendingWorkOrders();

    return {
      availability: Math.round(availability * 10) / 10,
      mttr: Math.round(mttr * 10) / 10,
      preventiveRate: Math.round(preventiveRate * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      stockValue: Math.round(stockValue * 100) / 100,
      pendingOrders,
      overdueMaintenances: dueSchedules
    };
  }

  async getMaintenanceStats(): Promise<MaintenanceStats> {
    const workOrders = await this.analyticsRepository.findAllWorkOrders();
    
    const preventiveCount = workOrders.filter(o => o.type === 'PREVENTIVE').length;
    const correctiveCount = workOrders.filter(o => o.type === 'CORRECTIVE').length;
    const completedCount = workOrders.filter(o => o.status === 'COMPLETED').length;
    
    // Calcul temps moyen de résolution
    const completedWithTimes = workOrders.filter(o => o.completedAt && o.scheduledAt);
    let totalTime = 0;
    completedWithTimes.forEach(order => {
      if (order.completedAt && order.scheduledAt) {
        totalTime += (order.completedAt.getTime() - order.scheduledAt.getTime()) / (1000 * 60 * 60);
      }
    });

    return {
      totalInterventions: workOrders.length,
      preventiveCount,
      correctiveCount,
      preventiveRate: workOrders.length > 0 ? Math.round((preventiveCount / workOrders.length) * 100 * 10) / 10 : 0,
      avgResolutionTime: completedWithTimes.length > 0 ? Math.round((totalTime / completedWithTimes.length) * 10) / 10 : 0,
      completionRate: workOrders.length > 0 ? Math.round((completedCount / workOrders.length) * 100 * 10) / 10 : 0
    };
  }

  async getInventoryStats(): Promise<InventoryStats> {
    const parts = await this.analyticsRepository.findAllParts();
    const movements = await this.analyticsRepository.findAllStockMovements();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const movementsThisMonth = movements.filter(m => m.createdAt >= startOfMonth).length;
    
    // Consommation (mouvements OUT) ce mois
    const outMovements = movements.filter(m => 
      m.type === 'OUT' && m.createdAt >= startOfMonth
    );
    
    let consumptionValue = 0;
    for (const mov of outMovements) {
      const part = parts.find(p => p.id === mov.partId);
      if (part) {
        consumptionValue += mov.quantity * part.unitPrice;
      }
    }

    return {
      totalParts: parts.length,
      totalValue: Math.round(parts.reduce((sum, p) => sum + (p.quantityInStock * p.unitPrice), 0) * 100) / 100,
      lowStockCount: parts.filter(p => p.quantityInStock < p.minStockLevel && p.quantityInStock > 0).length,
      outOfStockCount: parts.filter(p => p.quantityInStock === 0).length,
      movementsThisMonth,
      consumptionValue: Math.round(consumptionValue * 100) / 100
    };
  }

  async getTechnicianPerformance(): Promise<TechnicianPerformance[]> {
    const technicians = await this.analyticsRepository.findActiveTechniciansWithWorkOrders();

    return technicians.map(tech => {
      const completed = tech.workOrders.filter(o => o.status === 'COMPLETED').length;
      
      // Calcul temps moyen
      const completedWithTimes = tech.workOrders.filter(o => o.completedAt && o.scheduledAt);
      let totalTime = 0;
      completedWithTimes.forEach(order => {
        if (order.completedAt && order.scheduledAt) {
          totalTime += (order.completedAt.getTime() - order.scheduledAt.getTime()) / (1000 * 60 * 60);
        }
      });

      return {
        technicianId: tech.id,
        technicianName: tech.name,
        totalAssigned: tech.workOrders.length,
        completed,
        completionRate: tech.workOrders.length > 0 ? Math.round((completed / tech.workOrders.length) * 100 * 10) / 10 : 0,
        avgResolutionTime: completedWithTimes.length > 0 ? Math.round((totalTime / completedWithTimes.length) * 10) / 10 : 0
      };
    });
  }

  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
    const workOrders = await this.analyticsRepository.findWorkOrdersOrderedByDate();

    const trends: MonthlyTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthOrders = workOrders.filter(o => 
        o.createdAt >= date && o.createdAt < nextMonth
      );

      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      
      trends.push({
        month: monthName,
        preventive: monthOrders.filter(o => o.type === 'PREVENTIVE').length,
        corrective: monthOrders.filter(o => o.type === 'CORRECTIVE').length,
        total: monthOrders.length
      });
    }

    return trends;
  }

  async getAssetAvailability(): Promise<AssetAvailability[]> {
    const assets = await this.analyticsRepository.findAssetsWithCompletedWorkOrders();

    return assets.map(asset => {
      // Estimation basée sur les interventions
      let downtimeHours = 0;
      asset.workOrders.forEach(order => {
        if (order.completedAt && order.scheduledAt) {
          downtimeHours += (order.completedAt.getTime() - order.scheduledAt.getTime()) / (1000 * 60 * 60);
        }
      });

      // Total heures depuis création (simplifié)
      const daysSinceCreation = (Date.now() - asset.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const totalHours = daysSinceCreation * 24;

      const availabilityRate = totalHours > 0 ? 
        Math.max(0, Math.min(100, ((totalHours - downtimeHours) / totalHours) * 100)) : 100;

      return {
        assetId: asset.id,
        assetName: asset.name,
        totalHours: Math.round(totalHours),
        downtimeHours: Math.round(downtimeHours * 10) / 10,
        availabilityRate: Math.round(availabilityRate * 10) / 10
      };
    });
  }

  async getStatusDistribution(): Promise<{ status: string; count: number; percentage: number }[]> {
    const workOrders = await this.analyticsRepository.countWorkOrdersByStatus();

    const total = workOrders.reduce((sum, s) => sum + s.count, 0);

    return workOrders.map(s => ({
      status: s.status,
      count: s.count,
      percentage: total > 0 ? Math.round((s.count / total) * 100 * 10) / 10 : 0
    }));
  }
}
