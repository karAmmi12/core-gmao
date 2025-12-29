/**
 * Formulaire Technicien - Création et Édition
 */

'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, Button, Input, Label, Checkbox, FormError, FormSuccess } from '@/components';
import { createTechnicianAction, updateTechnicianAction } from '@/app/actions';
import type { TechnicianDTO } from '@/core/application/dto/TechnicianDTO';
import type { ActionState } from '@/core/application/types/ActionState';
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface TechnicianFormProps {
  technician?: TechnicianDTO;
  mode: 'create' | 'edit';
  availableSkills: ConfigurationItemDTO[];
}

export function TechnicianForm({ technician, mode, availableSkills }: TechnicianFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  
  const action = isEdit ? updateTechnicianAction : createTechnicianAction;
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(action, null);
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    technician?.skills || []
  );

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        router.push('/technicians');
        router.refresh();
      }, 1000);
    }
  }, [state?.success, router]);

  const toggleSkill = (skillLabel: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillLabel)
        ? prev.filter(s => s !== skillLabel)
        : [...prev, skillLabel]
    );
  };

  return (
    <Card>
      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={technician?.id} />}
        
        {/* Hidden inputs for skills */}
        {selectedSkills.map(skill => (
          <input key={skill} type="hidden" name="skills" value={skill} />
        ))}

        {/* Messages */}
        {state?.error && <FormError message={state.error} />}
        {state?.success && <FormSuccess message={isEdit ? "Technicien mis à jour !" : "Technicien créé !"} />}

        {/* Nom */}
        <div>
          <Label htmlFor="name">Nom complet *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ex: Jean Dupont"
            defaultValue={technician?.name}
            required
            minLength={3}
            maxLength={100}
          />
          {state?.errors?.name && (
            <p className="text-sm text-danger-600 mt-1">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Ex: jean.dupont@exemple.fr"
            defaultValue={technician?.email}
            required
          />
          {state?.errors?.email && (
            <p className="text-sm text-danger-600 mt-1">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Ex: 0612345678"
            defaultValue={technician?.phone || ''}
          />
          {state?.errors?.phone && (
            <p className="text-sm text-danger-600 mt-1">{state.errors.phone[0]}</p>
          )}
        </div>

        {/* Compétences */}
        <div>
          <Label>Compétences * (sélectionnez au moins une)</Label>
          <div className={cn(LAYOUT_STYLES.grid4, 'mt-2')}>
            {availableSkills.map(skill => (
              <label
                key={skill.id}
                className={`
                  ${LAYOUT_STYLES.flexRow} p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedSkills.includes(skill.label)
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <Checkbox
                  checked={selectedSkills.includes(skill.label)}
                  onChange={() => toggleSkill(skill.label)}
                />
                <span className="text-sm font-medium flex items-center gap-1">
                  {skill.color && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: skill.color }}
                    />
                  )}
                  {skill.label}
                </span>
              </label>
            ))}
          </div>
          {state?.errors?.skills && (
            <p className="text-sm text-danger-600 mt-1">{state.errors.skills[0]}</p>
          )}
          {selectedSkills.length === 0 && (
            <p className="text-sm text-neutral-500 mt-2">
              Sélectionnez au moins une compétence
            </p>
          )}
        </div>

        {/* Statut actif (seulement en édition) */}
        {isEdit && (
          <div>
            <label className={cn(LAYOUT_STYLES.flexRow, 'gap-3 cursor-pointer')}>
              <Checkbox
                name="isActive"
                defaultChecked={technician?.isActive}
                value="true"
              />
              <span className="font-medium text-neutral-700">Technicien actif</span>
            </label>
            <p className="text-sm text-neutral-500 mt-1">
              Désactivez pour retirer le technicien des affectations
            </p>
          </div>
        )}

        {/* Actions */}
        <div className={cn(LAYOUT_STYLES.flexRow, 'pt-4 border-t border-neutral-200')}>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending || selectedSkills.length === 0}
          >
            {isPending ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le technicien'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
}
