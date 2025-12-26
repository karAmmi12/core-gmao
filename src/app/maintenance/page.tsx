import { Suspense } from 'react';
import Link from 'next/link';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { MaintenanceScheduleService } from '@/core/application/services/MaintenanceScheduleService';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { TableSkeleton } from '@/presentation/components/common/LoadingSkeletons';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { executeMaintenanceScheduleAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

async function MaintenanceSchedulesList() {
  const maintenanceScheduleService = DIContainer.getMaintenanceScheduleService();
  const schedules = await maintenanceScheduleService.getAllSchedules();

  if (schedules.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun planning de maintenance</p>
          <Link href="/maintenance/new">
            <Button>Créer un planning</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const getFrequencyLabel = (frequency: string, intervalValue: number) => {
    const labels: Record<string, string> = {
      DAILY: 'jour(s)',
      WEEKLY: 'semaine(s)',
      MONTHLY: 'mois',
      QUARTERLY: 'trimestre(s)',
      YEARLY: 'année(s)',
    };
    return intervalValue > 1 ? `Tous les ${intervalValue} ${labels[frequency]}` : `${labels[frequency]}`;
  };

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{schedule.title}</h3>
                {schedule.isDue && (
                  <Badge variant="error">En retard</Badge>
                )}
                {!schedule.isDue && schedule.isActive && (
                  <Badge variant="success">Actif</Badge>
                )}
                {!schedule.isActive && (
                  <Badge variant="secondary">Inactif</Badge>
                )}
                <Badge variant={schedule.priority === 'HIGH' ? 'warning' : 'secondary'}>
                  {schedule.priority === 'HIGH' ? 'Priorité haute' : 'Priorité basse'}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Équipement:</span>{' '}
                  <Link href={`/assets/${schedule.assetId}`} className="text-blue-600 hover:underline">
                    {schedule.assetName || schedule.assetId}
                  </Link>
                </p>
                {schedule.description && (
                  <p>
                    <span className="font-medium">Description:</span> {schedule.description}
                  </p>
                )}
                <p>
                  <span className="font-medium">Fréquence:</span> {getFrequencyLabel(schedule.frequency, schedule.intervalValue)}
                </p>
                <p>
                  <span className="font-medium">Prochaine date:</span>{' '}
                  <span className={schedule.isDue ? 'text-red-600 font-semibold' : ''}>
                    {new Date(schedule.nextDueDate).toLocaleDateString('fr-FR')}
                  </span>
                </p>
                {schedule.lastExecutedAt && (
                  <p>
                    <span className="font-medium">Dernière exécution:</span>{' '}
                    {new Date(schedule.lastExecutedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {schedule.assignedToName && (
                  <p>
                    <span className="font-medium">Assigné à:</span> {schedule.assignedToName}
                  </p>
                )}
                {schedule.estimatedDuration && (
                  <p>
                    <span className="font-medium">Durée estimée:</span> {schedule.estimatedDuration}h
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {schedule.isDue && schedule.isActive && (
                <form action={async () => {
                  'use server';
                  await executeMaintenanceScheduleAction(schedule.id);
                }}>
                  <Button type="submit" size="sm">
                    Exécuter
                  </Button>
                </form>
              )}
              <Link href={`/maintenance/${schedule.id}/edit`}>
                <Button variant="secondary" size="sm">
                  Modifier
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Préventive</h1>
            <p className="text-gray-600 mt-1">Gérez les plannings de maintenance préventive</p>
          </div>
          <Link href="/maintenance/new">
            <Button>+ Nouveau planning</Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <MaintenanceSchedulesList />
      </Suspense>
    </MainLayout>
  );
}
