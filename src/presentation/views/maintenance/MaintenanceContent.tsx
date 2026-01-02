/**
 * Maintenance - Contenu Client
 */

'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { Clock, Activity } from 'lucide-react';
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
  StatsGrid,
  StatCard,
  Alert,
  Input,
  Modal,
} from '@/components';
import { useSearch } from '@/presentation/hooks';
import { formatDate, cn } from '@/styles/design-system';
import type { MaintenanceScheduleDTO } from '@/core/application/dto/MaintenanceScheduleDTO';
import { executeMaintenanceScheduleAction, updateMaintenanceReadingAction } from '@/app/actions';

interface MaintenanceContentProps {
  schedules: MaintenanceScheduleDTO[];
}

type TypeFilter = '' | 'TIME_BASED' | 'THRESHOLD_BASED';

export function MaintenanceContent({ schedules }: MaintenanceContentProps) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
  const [executing, setExecuting] = useState<string | null>(null);
  const [updatingReading, setUpdatingReading] = useState<MaintenanceScheduleDTO | null>(null);

  const { query, setQuery, filteredItems, clearSearch } = useSearch(schedules, {
    searchKeys: ['title', 'assetName', 'description', 'thresholdMetric'],
  });

  // Apply filters
  const filtered = filteredItems.filter(s => {
    if (statusFilter) {
      if (statusFilter === 'DUE' && !(s.isDue && s.isActive)) return false;
      if (statusFilter === 'ACTIVE' && !(s.isActive && !s.isDue)) return false;
      if (statusFilter === 'INACTIVE' && s.isActive) return false;
    }
    if (typeFilter && s.triggerType !== typeFilter) return false;
    return true;
  });

  // Stats
  const dueCount = schedules.filter(s => s.isDue && s.isActive).length;
  const timeBasedCount = schedules.filter(s => s.triggerType === 'TIME_BASED').length;
  const thresholdBasedCount = schedules.filter(s => s.triggerType === 'THRESHOLD_BASED').length;

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
    } finally {
      setExecuting(null);
    }
  };

  const resetFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    clearSearch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Planifiée"
        description="Plannings de maintenance préventive et prédictive"
        icon="🔧"
        actions={
          <LinkButton href="/maintenance/new" variant="primary" icon="➕">
            Nouveau planning
          </LinkButton>
        }
      />

      {/* Alert for due schedules */}
      {dueCount > 0 && (
        <Alert variant="warning" title={`${dueCount} maintenance(s) à effectuer`}>
          Certaines maintenances ont atteint leur date d'échéance ou leur seuil de déclenchement.
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
          label="📅 Préventives"
          value={timeBasedCount}
          subtitle="Basées sur le temps"
          icon={<Clock size={24} />}
          color="success"
        />
        <StatCard
          label="📊 Prédictives"
          value={thresholdBasedCount}
          subtitle="Basées sur des seuils"
          icon={<Activity size={24} />}
          color="primary"
        />
        <StatCard
          label="À effectuer"
          value={dueCount}
          icon={<span className="text-2xl">⚠️</span>}
          color={dueCount > 0 ? 'danger' : 'neutral'}
        />
      </StatsGrid>

      {/* Filters */}
      <FiltersBar onReset={resetFilters}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher..."
          className="w-64"
        />
        <FilterSelect
          label="Type"
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as TypeFilter)}
          options={[
            { value: 'TIME_BASED', label: '📅 Préventive' },
            { value: 'THRESHOLD_BASED', label: '📊 Prédictive' },
          ]}
        />
        <FilterSelect
          label="Statut"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'DUE', label: '⚠️ À effectuer' },
            { value: 'ACTIVE', label: '✅ Actif' },
            { value: 'INACTIVE', label: '⏸️ Inactif' },
          ]}
        />
      </FiltersBar>

      {/* Schedules List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<span className="text-5xl">🔧</span>}
          title={query || statusFilter || typeFilter ? 'Aucun résultat' : 'Aucun planning de maintenance'}
          description={
            query || statusFilter || typeFilter
              ? 'Modifiez vos filtres de recherche'
              : 'Créez votre premier planning de maintenance'
          }
          action={
            query || statusFilter || typeFilter ? (
              <Button variant="secondary" onClick={resetFilters}>
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
              onUpdateReading={() => setUpdatingReading(schedule)}
              executing={executing === schedule.id}
            />
          ))}
        </div>
      )}

      {/* Modal de mise à jour du compteur */}
      {updatingReading && (
        <UpdateReadingModal
          schedule={updatingReading}
          onClose={() => setUpdatingReading(null)}
        />
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
  onUpdateReading: () => void;
  executing: boolean;
}

function ScheduleCard({ schedule, getFrequencyLabel, onExecute, onUpdateReading, executing }: ScheduleCardProps) {
  const isTimeBased = schedule.triggerType === 'TIME_BASED';
  const isThresholdBased = schedule.triggerType === 'THRESHOLD_BASED';

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            {/* Type badge */}
            <Badge color={isTimeBased ? 'success' : 'primary'} size="sm">
              {isTimeBased ? '📅 Préventive' : '📊 Prédictive'}
            </Badge>
            
            <h3 className="text-lg font-semibold text-neutral-900">{schedule.title}</h3>
            
            {schedule.isDue && schedule.isActive && (
              <Badge color="danger">⚠️ À effectuer</Badge>
            )}
            {!schedule.isDue && schedule.isActive && (
              <Badge color="neutral">Planifié</Badge>
            )}
            {!schedule.isActive && (
              <Badge color="neutral">Inactif</Badge>
            )}
            {schedule.priority === 'HIGH' && (
              <Badge color="warning">🔥 Priorité haute</Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-neutral-600">
            <p>
              <span className="font-medium">Équipement:</span>{' '}
              <Link href={`/assets/${schedule.assetId}`} className="text-primary-600 hover:underline">
                {schedule.assetName || schedule.assetId}
              </Link>
            </p>
            
            {schedule.description && (
              <p className="text-neutral-500">{schedule.description}</p>
            )}

            {/* Affichage selon le type */}
            {isTimeBased ? (
              <>
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-neutral-400" />
                  <span className="font-medium">Fréquence:</span>{' '}
                  {getFrequencyLabel(schedule.frequency, schedule.intervalValue)}
                </p>
                <p>
                  <span className="font-medium">Prochaine date:</span>{' '}
                  <span className={cn(schedule.isDue && 'text-danger-600 font-semibold')}>
                    {formatDate(schedule.nextDueDate)}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2">
                  <Activity size={14} className="text-neutral-400" />
                  <span className="font-medium">Compteur:</span>{' '}
                  {schedule.thresholdMetric}
                </p>
                
                {/* Barre de progression */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>
                      Actuel: <strong>{schedule.currentValue || 0}</strong> {schedule.thresholdUnit}
                    </span>
                    <span>
                      Seuil: <strong>{schedule.thresholdValue}</strong> {schedule.thresholdUnit}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        (schedule.thresholdProgress || 0) >= 100 ? 'bg-danger-500' :
                        (schedule.thresholdProgress || 0) >= 80 ? 'bg-warning-500' :
                        'bg-primary-500'
                      )}
                      style={{ width: `${Math.min(100, schedule.thresholdProgress || 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {schedule.thresholdProgress}% du seuil atteint
                  </p>
                </div>
              </>
            )}

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
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {schedule.isDue && schedule.isActive && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onExecute(schedule.id)}
              loading={executing}
            >
              Générer intervention
            </Button>
          )}
          
          {isThresholdBased && schedule.isActive && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onUpdateReading}
            >
              📝 Mettre à jour compteur
            </Button>
          )}
          
          <LinkButton href={`/maintenance/${schedule.id}/edit`} variant="outline" size="sm">
            Modifier
          </LinkButton>
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// UPDATE READING MODAL
// =============================================================================

interface UpdateReadingModalProps {
  schedule: MaintenanceScheduleDTO;
  onClose: () => void;
}

function UpdateReadingModal({ schedule, onClose }: UpdateReadingModalProps) {
  const [state, formAction, isPending] = useActionState(updateMaintenanceReadingAction, null);

  // Fermer le modal si succès
  if (state?.success) {
    onClose();
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Mettre à jour le compteur"
      size="sm"
    >
      <form action={formAction}>
        <input type="hidden" name="scheduleId" value={schedule.id} />
        
        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="font-medium text-neutral-900">{schedule.title}</p>
            <p className="text-sm text-neutral-600">{schedule.thresholdMetric}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-neutral-100 rounded-lg">
              <p className="text-neutral-500">Valeur actuelle</p>
              <p className="text-lg font-semibold">
                {schedule.currentValue || 0} {schedule.thresholdUnit}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <p className="text-primary-600">Seuil de déclenchement</p>
              <p className="text-lg font-semibold text-primary-700">
                {schedule.thresholdValue} {schedule.thresholdUnit}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nouvelle valeur ({schedule.thresholdUnit})
            </label>
            <Input
              name="currentValue"
              type="number"
              min="0"
              step="0.1"
              defaultValue={schedule.currentValue || 0}
              placeholder={`Ex: ${(schedule.currentValue || 0) + 10}`}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Entrez la valeur actuelle relevée sur l'équipement
            </p>
          </div>

          {state?.error && (
            <Alert variant="danger">{state.error}</Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={isPending}>
              Enregistrer
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
