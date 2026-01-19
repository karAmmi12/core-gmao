// presentation/views/settings/CreateItemModal.tsx
'use client';

import { Modal, Input, Label, Checkbox, Textarea } from '@/components';
import { createItemAction } from '@/app/actions';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';
import { DataForm } from '@/presentation/components/forms/DataForm';

interface CreateItemModalProps {
  categoryId: string;
  onClose: () => void;
}

export function CreateItemModal({ categoryId, onClose }: CreateItemModalProps) {
  return (
    <Modal title="Nouvel Élément" onClose={onClose} size="md">
      <DataForm
        action={createItemAction}
        bare={true}
        submitLabel="Créer"
        onSuccess={() => setTimeout(onClose, 500)}
      >
        {({ isPending }) => (
          <>
            <input type="hidden" name="categoryId" value={categoryId} />

            <div className={LAYOUT_STYLES.grid2}>
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="MECHANICAL"
                  required
                  disabled={isPending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  En majuscules (ex: ELECTRICAL)
                </p>
              </div>

              <div>
                <Label htmlFor="label">Libellé *</Label>
                <Input
                  id="label"
                  name="label"
                  placeholder="Mécanique"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                disabled={isPending}
              />
            </div>

            <div className={LAYOUT_STYLES.grid2}>
              <div>
                <Label htmlFor="color">Couleur</Label>
                <div className={LAYOUT_STYLES.flexRow}>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue="#3b82f6"
                    disabled={isPending}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    placeholder="#3b82f6"
                    disabled={isPending}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="icon">Icône</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="wrench"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className={LAYOUT_STYLES.grid2}>
              <div>
                <Label htmlFor="sortOrder">Ordre</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  defaultValue="0"
                  disabled={isPending}
                />
              </div>

              <div className={cn(LAYOUT_STYLES.flexRow, 'pt-6')}>
                <Checkbox
                  id="isDefault"
                  name="isDefault"
                  disabled={isPending}
                />
                <Label htmlFor="isDefault" className="ml-2 mt-0!">
                  Par défaut
                </Label>
              </div>
            </div>
          </>
        )}
      </DataForm>
    </Modal>
  );
}
