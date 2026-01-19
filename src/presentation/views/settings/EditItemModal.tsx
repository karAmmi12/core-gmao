// presentation/views/settings/EditItemModal.tsx
'use client';

import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import { Modal, Input, Label, Checkbox, Textarea } from '@/components';
import { updateItemAction } from '@/app/actions';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';
import { DataForm } from '@/presentation/components/forms/DataForm';

interface EditItemModalProps {
  item: ConfigurationItemDTO;
  onClose: () => void;
}

export function EditItemModal({ item, onClose }: EditItemModalProps) {
  const boundAction = updateItemAction.bind(null, item.id);

  return (
    <Modal title="Modifier l'Élément" onClose={onClose} size="md">
      <DataForm
        action={boundAction}
        bare={true}
        submitLabel="Enregistrer"
        onSuccess={() => setTimeout(onClose, 500)}
      >
        {({ isPending }) => (
          <>
            <div>
              <Label htmlFor="label">Libellé *</Label>
              <Input
                id="label"
                name="label"
                defaultValue={item.label}
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={item.description || ''}
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
                    defaultValue={item.color || '#3b82f6'}
                    disabled={isPending}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    defaultValue={item.color || ''}
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
                  defaultValue={item.icon || ''}
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
                  defaultValue={item.sortOrder}
                  disabled={isPending}
                />
              </div>

              <div className={cn(LAYOUT_STYLES.flexColSm, 'pt-4')}>
                <div className={LAYOUT_STYLES.flexRow}>
                  <Checkbox
                    id="isDefault"
                    name="isDefault"
                    defaultChecked={item.isDefault}
                    disabled={isPending}
                  />
                  <Label htmlFor="isDefault" className="ml-2 mt-0!">
                    Par défaut
                  </Label>
                </div>

                <div className={LAYOUT_STYLES.flexRow}>
                  <Checkbox
                    id="isActive"
                    name="isActive"
                    defaultChecked={item.isActive}
                    disabled={isPending}
                  />
                  <Label htmlFor="isActive" className="ml-2 mt-0!">
                    Actif
                  </Label>
                </div>
              </div>
            </div>
          </>
        )}
      </DataForm>
    </Modal>
  );
}
