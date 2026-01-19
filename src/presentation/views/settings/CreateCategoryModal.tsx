// presentation/views/settings/CreateCategoryModal.tsx
'use client';

import { Modal, Input, Label, Textarea } from '@/components';
import { createCategoryAction } from '@/app/actions';
import { DataForm } from '@/presentation/components/forms/DataForm';

interface CreateCategoryModalProps {
  onClose: () => void;
}

export function CreateCategoryModal({ onClose }: CreateCategoryModalProps) {
  return (
    <Modal title="Nouvelle Catégorie" onClose={onClose} size="md">
      <DataForm
        action={createCategoryAction}
        bare={true}
        submitLabel="Créer"
        onSuccess={() => setTimeout(onClose, 500)}
      >
        {({ isPending }) => (
          <>
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                placeholder="TECHNICIAN_SKILL"
                required
                disabled={isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                En majuscules avec underscores (ex: ASSET_TYPE)
              </p>
            </div>

            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Compétences Technicien"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="sortOrder">Ordre d'affichage</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue="0"
                disabled={isPending}
              />
            </div>
          </>
        )}
      </DataForm>
    </Modal>
  );
}
