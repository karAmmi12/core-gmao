// presentation/views/settings/CreateItemModal.tsx
'use client';

import { useActionState } from 'react';
import { Modal, Button, Input, Label, Checkbox, Textarea, FormError, FormSuccess } from '@/components';
import { createItemAction } from '@/app/actions';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface CreateItemModalProps {
  categoryId: string;
  onClose: () => void;
}

export function CreateItemModal({ categoryId, onClose }: CreateItemModalProps) {
  const [state, formAction, pending] = useActionState(createItemAction, null);

  // Fermer le modal en cas de succès
  if (state?.success) {
    setTimeout(onClose, 500);
  }

  return (
    <Modal title="Nouvel Élément" onClose={onClose} size="md">
      <form action={formAction} className="space-y-4">
          <input type="hidden" name="categoryId" value={categoryId} />

          <div className={LAYOUT_STYLES.grid2}>
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                placeholder="MECHANICAL"
                required
                disabled={pending}
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
                disabled={pending}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
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
                  defaultValue="#3b82f6"
                  disabled={pending}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
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
                defaultValue="0"
                disabled={pending}
              />
            </div>

            <div className={cn(LAYOUT_STYLES.flexRow, 'pt-6')}>
              <Checkbox
                id="isDefault"
                name="isDefault"
                disabled={pending}
              />
              <Label htmlFor="isDefault" className="ml-2 mt-0!">
                Par défaut
              </Label>
            </div>
          </div>

          {state?.error && <FormError message={state.error} />}
          {state?.success && <FormSuccess message="Élément créé avec succès !" />}

          <div className={cn(LAYOUT_STYLES.flexRow, 'pt-4')}>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Création...' : 'Créer'}
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
