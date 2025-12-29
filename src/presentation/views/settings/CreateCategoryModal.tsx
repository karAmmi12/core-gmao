// presentation/views/settings/CreateCategoryModal.tsx
'use client';

import { useActionState } from 'react';
import { Modal, Button, Input, Label, Textarea, FormError, FormSuccess } from '@/components';
import { createCategoryAction } from '@/app/actions';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface CreateCategoryModalProps {
  onClose: () => void;
}

export function CreateCategoryModal({ onClose }: CreateCategoryModalProps) {
  const [state, formAction, pending] = useActionState(createCategoryAction, null);

  if (state?.success) {
    setTimeout(onClose, 500);
  }

  return (
    <Modal title="Nouvelle Catégorie" onClose={onClose} size="md">
      <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              name="code"
              placeholder="TECHNICIAN_SKILL"
              required
              disabled={pending}
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
              disabled={pending}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              disabled={pending}
            />
          </div>

          <div>
            <Label htmlFor="sortOrder">Ordre d'affichage</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue="0"
              disabled={pending}
            />
          </div>

          {state?.error && <FormError message={state.error} />}
          {state?.success && <FormSuccess message="Catégorie créée avec succès !" />}

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
