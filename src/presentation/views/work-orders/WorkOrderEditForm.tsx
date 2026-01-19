'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { updateWorkOrderAction } from '@/app/actions';
import { WorkOrderDTO } from '@/core/application/dto/WorkOrderDTO';
import {
  Card,
  Input,
  Select,
  Button,
  PageHeader,
  Textarea
} from '@/components';
import { MainLayout } from '@/components/layouts/MainLayout';
import { LAYOUT_STYLES } from '@/styles/design-system';
import { DataForm } from '@/presentation/components/forms/DataForm';

// ============================================================================
// Types
// ============================================================================

interface WorkOrderEditFormProps {
  workOrder: WorkOrderDTO;
  assetName: string;
  technicians: { id: string; name: string }[];
}

// ============================================================================
// Main Component
// ============================================================================

export default function WorkOrderEditForm({ workOrder, assetName, technicians }: WorkOrderEditFormProps) {
  // Parse scheduled date/time
  const scheduledDate = workOrder.scheduledAt 
    ? new Date(workOrder.scheduledAt).toISOString().split('T')[0]
    : '';
  const scheduledTime = workOrder.scheduledAt 
    ? new Date(workOrder.scheduledAt).toTimeString().slice(0, 5)
    : '';

  return (
    <MainLayout>
      <div className="min-h-screen bg-neutral-50">
        <PageHeader
          icon="✏️"
          title="Modifier l'intervention"
          description={`Intervention #${workOrder.id.slice(0, 8)}`}
          actions={
            <Link href={`/work-orders/${workOrder.id}`}>
              <Button variant="outline" icon={<ArrowLeft size={18} />}>
                Retour
              </Button>
            </Link>
          }
        />

        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <DataForm
            action={updateWorkOrderAction}
            submitLabel="Enregistrer les modifications"
            onSuccess={() => window.location.href = `/work-orders/${workOrder.id}`}
          >
            {({ errors, isPending }) => (
              <>
                <input type="hidden" name="workOrderId" value={workOrder.id} />

                {/* Basic Info */}
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Titre de l'intervention <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="title"
                        defaultValue={workOrder.title}
                        required
                        disabled={isPending}
                        error={errors?.title?.[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Description
                      </label>
                      <Textarea
                        name="description"
                        defaultValue={workOrder.description || ''}
                        rows={4}
                        disabled={isPending}
                      />
                    </div>

                    <div className={LAYOUT_STYLES.grid2}>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Équipement
                        </label>
                        <Input
                          value={assetName}
                          disabled
                          className="bg-neutral-100"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          L'équipement ne peut pas être modifié
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Priorité <span className="text-red-500">*</span>
                        </label>
                        <Select
                          name="priority"
                          defaultValue={workOrder.priority}
                          required
                          disabled={isPending}
                        >
                          <option value="LOW">Normale</option>
                          <option value="HIGH">Urgente</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Scheduling */}
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Planification</h3>

                  <div className={LAYOUT_STYLES.grid2}>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Technicien assigné
                      </label>
                      <Select 
                        name="assignedToId" 
                        defaultValue={workOrder.assignedToId || ''}
                        disabled={isPending}
                      >
                        <option value="">-- Non assigné --</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Durée estimée (minutes)
                      </label>
                      <Input
                        type="number"
                        name="estimatedDuration"
                        min="1"
                        defaultValue={workOrder.estimatedDuration || ''}
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Date prévue
                      </label>
                      <Input
                        type="date"
                        name="scheduledDate"
                        defaultValue={scheduledDate}
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Heure prévue
                      </label>
                      <Input
                        type="time"
                        name="scheduledTime"
                        defaultValue={scheduledTime}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </DataForm>
        </div>
      </div>
    </MainLayout>
  );
}
