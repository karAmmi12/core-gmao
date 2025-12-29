/**
 * Maintenance - Contenu Client
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  LinkButton,
  EmptyState,
  SearchInput,
  FilterSelect,
  FiltersBar,
  DataTable,
  StatsGrid,
  StatCard,
  Alert,
  type Column,
} from '@/components';
import { useSearch } from '@/presentation/hooks';
import { STATUS_CONFIG, formatDate, cn } from '@/styles/design-system';
import type { MaintenanceScheduleDTO } from '@/core/application/dto/MaintenanceScheduleDTO';
import { executeMaintenanceScheduleAction } from '@/app/actions';

interface MaintenanceContentProps {
  schedules: MaintenanceScheduleDTO[];
}

export function MaintenanceContent({ schedules }: MaintenanceContentProps) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [executing, setExecuting] = useState<string | null>(null);

  const { query, setQuery, filteredItems, clearSearch } = useSearch(schedules, {
    searchKeys: ['title', 'assetName', 'description'],
  });

  // Apply filters
  const filtered = filteredItems.filter(s => {
    if (!statusFilter) return true;
    if (statusFilter === 'DUE') return s.isDue && s.isActive;
    if (statusFilter === 'ACTIVE') return s.isActive && !s.isDue;
    if (statusFilter === 'INACTIVE') return !s.isActive;
    return true;
  });

  // Stats
  const activeCount = schedules.filter(s => s.isActive).length;
  const dueCount = schedules.filter(s => s.isDue && s.isActive).length;
  const highPriorityCount = schedules.filter(s => s.priority === 'HIGH').length;

  const getFrequencyLabel = (frequency: string, intervalValue: number) => {
    const labels: Record<string, string> = {
      DAILY: 'jour(s)',
      WEEKLY: 'semaine(s)',
      MONTHLY: 'mois',
      QUARTERLY: 'trimestre(s)',
      YEARLY: 'année(s)',
    };
    return intervalValue > 1 ? `Tous les ${intervalValue} ${labels[frequency] || frequency}` : labels[frequency] || frequency;
  };

  const handleExecute = async (id: string) => {
    setExecuting(id);
    try {
      await executeMaintenanceScheduleAction(id);
      // Force refresh would happen via revalidation
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Préventive"
        description="Plannings de maintenance et interventions programmées"
        icon="🔧"
        actions={
          <LinkButton href="/maintenance/new" variant="primary" icon="➕">
            Nouveau planning
          </LinkButton>
        }
      />

      {/* Alert for due schedules */}
      {dueCount > 0 && (
        <Alert variant="warning" title={`${dueCount} maintenance(s) en retard`}>
          Certaines maintenances ont dépassé leur date d'échéance et nécessitent une attention immédiate.
        </Alert>
      )}

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatCard
          label="Total plannings"
          value={schedules.length}
          icon={<span className="text-2xl">📋</span>}
          color="primary"
        />
        <StatCard
          label="Actifs"
          value={activeCount}
          icon={<span className="text-2xl">✅</span>}
          color="success"
        />
        <StatCard
          label="En retard"
          value={dueCount}
          icon={<span className="text-2xl">⚠️</span>}
          color={dueCount > 0 ? 'danger' : 'neutral'}
        />
        <StatCard
          label="Priorité haute"
          value={highPriorityCount}
          icon={<span className="text-2xl">🔥</span>}
          color="warning"
        />
      </StatsGrid>

      {/* Filters */}
      <FiltersBar onReset={() => { setStatusFilter(''); clearSearch(); }}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher..."
          className="w-64"
        />
        <FilterSelect
          label="Statut"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'DUE', label: '⚠️ En retard' },
            { value: 'ACTIVE', label: '✅ Actif' },
            { value: 'INACTIVE', label: '⏸️ Inactif' },
          ]}
        />
      </FiltersBar>

      {/* Schedules List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<span className="text-5xl">🔧</span>}
          title={query || statusFilter ? 'Aucun résultat' : 'Aucun planning de maintenance'}
          description={
            query || statusFilter
              ? 'Modifiez vos filtres de recherche'
              : 'Créez votre premier planning de maintenance préventive'
          }
          action={
            query || statusFilter ? (
              <Button variant="secondary" onClick={() => { clearSearch(); setStatusFilter(''); }}>
                Réinitialiser
              </Button>
            ) : (
              <LinkButton href="/maintenance/new" variant="primary">
                Créer un planning
              </LinkButton>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              getFrequencyLabel={getFrequencyLabel}
              onExecute={handleExecute}
              executing={executing === schedule.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SCHEDULE CARD
// =============================================================================

interface ScheduleCardProps {
  schedule: MaintenanceScheduleDTO;
  getFrequencyLabel: (frequency: string, interval: number) => string;
  onExecute: (id: string) => void;
  executing: boolean;
}

function ScheduleCard({ schedule, getFrequencyLabel, onExecute, executing }: ScheduleCardProps) {
  const frequencyConfig = STATUS_CONFIG.frequency[schedule.frequency as keyof typeof STATUS_CONFIG.frequency];

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="text-lg font-semibold text-neutral-900">{schedule.title}</h3>
            {schedule.isDue && schedule.isActive && (
              <Badge color="danger">⚠️ En retard</Badge>
            )}
            {!schedule.isDue && schedule.isActive && (
              <Badge color="success">Actif</Badge>
            )}
            {!schedule.isActive && (
              <Badge color="neutral">Inactif</Badge>
            )}
            <Badge color={schedule.priority === 'HIGH' ? 'warning' : 'neutral'}>
              {schedule.priority === 'HIGH' ? '🔥 Priorité haute' : 'Priorité normale'}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-1 text-sm text-neutral-600">
            <p>
              <span className="font-medium">Équipement:</span>{' '}
              <Link href={`/assets/${schedule.assetId}`} className="text-primary-600 hover:underline">
                {schedule.assetName || schedule.assetId}
              </Link>
            </p>
            {schedule.description && (
              <p className="text-neutral-500">{schedule.description}</p>
            )}
            <p className="flex items-center gap-2">
              <span className="font-medium">Fréquence:</span>
              {frequencyConfig && (
                <Badge color={frequencyConfig.color} size="sm">
                  {getFrequencyLabel(schedule.frequency, schedule.intervalValue)}
                </Badge>
              )}
            </p>
            <p>
              <span className="font-medium">Prochaine date:</span>{' '}
              <span className={cn(schedule.isDue && 'text-danger-600 font-semibold')}>
                {formatDate(schedule.nextDueDate)}
              </span>
            </p>
            {schedule.lastExecutedAt && (
              <p>
                <span className="font-medium">Dernière exécution:</span>{' '}
                {formatDate(schedule.lastExecutedAt)}
              </p>
            )}
            {schedule.assignedToName && (
              <p>
                <span className="font-medium">Assigné à:</span>{' '}
                👤 {schedule.assignedToName}
              </p>
            )}
            {schedule.estimatedDuration && (
              <p>
                <span className="font-medium">Durée estimée:</span>{' '}
                {schedule.estimatedDuration}h
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          {schedule.isDue && schedule.isActive && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onExecute(schedule.id)}
              loading={executing}
            >
              Exécuter
            </Button>
          )}
          <LinkButton href={`/maintenance/${schedule.id}/edit`} variant="secondary" size="sm">
            Modifier
          </LinkButton>
        </div>
      </div>
    </Card>
  );
}
