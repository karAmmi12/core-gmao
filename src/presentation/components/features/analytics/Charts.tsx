/**
 * Composants graphiques pour Dashboard Analytics
 */

'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components';

// =============================================================================
// COLORS
// =============================================================================

const COLORS = {
  primary: '#ea580c',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  neutral: '#737373',
  blue: '#3b82f6',
};

// =============================================================================
// MONTHLY TRENDS CHART
// =============================================================================

interface MonthlyTrend {
  month: string;
  preventive: number;
  corrective: number;
  total: number;
}

export function InterventionTrendsChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Tendances des interventions
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis 
            dataKey="month" 
            stroke="#737373"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#737373"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="preventive"
            stackId="1"
            stroke={COLORS.success}
            fill={COLORS.success}
            name="Préventif"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="corrective"
            stackId="1"
            stroke={COLORS.warning}
            fill={COLORS.warning}
            name="Correctif"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// =============================================================================
// ASSET STATUS DISTRIBUTION CHART
// =============================================================================

interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Terminé',
  IN_PROGRESS: 'En cours',
  PLANNED: 'Planifié',
  PENDING: 'En attente',
  CANCELLED: 'Annulé',
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: COLORS.success,
  IN_PROGRESS: COLORS.blue,
  PLANNED: COLORS.warning,
  PENDING: COLORS.neutral,
  CANCELLED: COLORS.danger,
};

export function WorkOrderStatusChart({ data }: { data: StatusData[] }) {
  const chartData = data.map(item => ({
    ...item,
    name: STATUS_LABELS[item.status] || item.status,
    fill: STATUS_COLORS[item.status] || COLORS.neutral,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Répartition des ordres de travail
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any, name: any, props: any) => [
              `${value} (${props.payload.percentage}%)`,
              props.payload.name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

// =============================================================================
// TECHNICIAN PERFORMANCE CHART
// =============================================================================

interface TechnicianPerformance {
  technicianName: string;
  totalAssigned: number;
  completed: number;
  completionRate: number;
}

export function TechnicianPerformanceChart({ data }: { data: TechnicianPerformance[] }) {
  // Top 5 techniciens
  const topTechs = [...data]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Performance des techniciens (Top 5)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topTechs} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis type="number" stroke="#737373" style={{ fontSize: '12px' }} />
          <YAxis 
            type="category" 
            dataKey="technicianName" 
            width={120}
            stroke="#737373"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Legend iconType="circle" />
          <Bar 
            dataKey="completed" 
            fill={COLORS.success} 
            name="Terminés"
            radius={[0, 8, 8, 0]}
          />
          <Bar 
            dataKey="totalAssigned" 
            fill={COLORS.neutral} 
            name="Total assignés"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// =============================================================================
// ASSET AVAILABILITY CHART
// =============================================================================

interface AssetAvailability {
  assetName: string;
  availabilityRate: number;
}

export function AssetAvailabilityChart({ data }: { data: AssetAvailability[] }) {
  // Top/Bottom 5 assets
  const sorted = [...data].sort((a, b) => b.availabilityRate - a.availabilityRate);
  const chartData = [...sorted.slice(0, 3), ...sorted.slice(-3)];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Taux de disponibilité (Top/Bottom 3)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis 
            dataKey="assetName" 
            stroke="#737373"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, 100]}
            stroke="#737373"
            style={{ fontSize: '12px' }}
            label={{ value: '(%)', position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: any) => [`${value}%`, 'Disponibilité']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Bar 
            dataKey="availabilityRate" 
            fill={COLORS.primary}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// =============================================================================
// MTTR TREND CHART (Simplified)
// =============================================================================

interface MTTRData {
  month: string;
  mttr: number;
}

export function MTTRTrendChart({ data }: { data: MTTRData[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Évolution MTTR (heures)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis 
            dataKey="month" 
            stroke="#737373"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#737373"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: any) => [`${value}h`, 'MTTR']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="mttr" 
            stroke={COLORS.primary}
            strokeWidth={3}
            dot={{ fill: COLORS.primary, r: 5 }}
            name="MTTR"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
