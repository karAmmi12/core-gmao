import Link from 'next/link';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { MaintenanceScheduleDTO } from '@/core/application/dto/MaintenanceScheduleDTO';

interface DashboardMaintenanceDueProps {
  schedules: MaintenanceScheduleDTO[];
}

export function DashboardMaintenanceDue({ schedules }: DashboardMaintenanceDueProps) {
  if (schedules.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Maintenance en retard</h2>
          <p className="text-gray-500 text-sm">Aucune maintenance en retard</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Maintenance en retard
            <Badge variant="error" className="ml-2">
              {schedules.length}
            </Badge>
          </h2>
          <Link href="/maintenance" className="text-sm text-blue-600 hover:underline">
            Voir tout
          </Link>
        </div>
        
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{schedule.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    <Link href={`/assets/${schedule.assetId}`} className="text-blue-600 hover:underline">
                      {schedule.assetName}
                    </Link>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Prévue le {new Date(schedule.nextDueDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {schedule.priority === 'HIGH' && (
                  <Badge variant="error" size="sm">
                    Priorité haute
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
