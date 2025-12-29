// presentation/views/settings/EditItemModal.tsx
'use client';

import { useActionState } from 'react';
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import { Modal, Button, Input, Label, Checkbox, Textarea, FormError, FormSuccess } from '@/components';
import { updateItemAction } from '@/app/actions';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface EditItemModalProps {
  item: ConfigurationItemDTO;
  onClose: () => void;
}

export function EditItemModal({ item, onClose }: EditItemModalProps) {
  const boundAction = updateItemAction.bind(null, item.id);
  const [state, formAction, pending] = useActionState(boundAction, null);

  if (state?.success) {
    setTimeout(onClose, 500);
  }

  return (
    <Modal title="Modifier l'Élément" onClose={onClose} size="md">
      <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="label">Libellé *</Label>
            <Input
              id="label"
              name="label"
              defaultValue={item.label}
              required
              disabled={pending}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item.description || ''}
              rows={2}
              disabled={pending}
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
                  disabled={pending}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  defaultValue={item.color || ''}
                  placeholder="#3b82f6"
                  disabled={pending}
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
                disabled={pending}
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
                disabled={pending}
              />
            </div>

            <div className={cn(LAYOUT_STYLES.flexColSm, 'pt-4')}>
              <div className={LAYOUT_STYLES.flexRow}>
                <Checkbox
                  id="isDefault"
                  name="isDefault"
                  defaultChecked={item.isDefault}
                  disabled={pending}
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
                  disabled={pending}
                />
                <Label htmlFor="isActive" className="ml-2 mt-0!">
                  Actif
                </Label>
              </div>
            </div>
          </div>

          {state?.error && <FormError message={state.error} />}
          {state?.success && <FormSuccess message="Élément modifié avec succès !" />}

          <div className={cn(LAYOUT_STYLES.flexRow, 'pt-4')}>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={pending}
            >
              Annuler
            </Button>
          </div>
        </form>
    </Modal>
  );
}
