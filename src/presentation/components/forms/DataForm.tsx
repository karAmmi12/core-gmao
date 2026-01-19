'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  Button
} from '@/presentation/components/ui';
import { Alert } from '@/presentation/components/composite';
import { FormActions } from '@/presentation/components/forms';
import { useForm, type FormState } from '@/presentation/components/forms';
import { Save, X } from 'lucide-react';

interface DataFormProps<T> {
  // Logique
  action: (prevState: FormState<T>, formData: FormData) => Promise<FormState<T>>;
  initialState?: FormState<T>;
  onSuccess?: (data?: T) => void;
  
  // Apparence
  title?: string;
  icon?: ReactNode;
  description?: string;
  bare?: boolean; // Si true, pas de Card wrapper (pour modals)
  
  // Navigation
  cancelHref?: string;
  submitLabel?: string;
  
  // Contenu (Render prop pour avoir accès aux erreurs)
  children: (props: { errors: Record<string, string[]>; isPending: boolean; data?: T }) => ReactNode;
}

export function DataForm<T = any>({
  action,
  initialState = { success: false },
  onSuccess,
  title,
  icon,
  description,
  bare = false,
  cancelHref,
  submitLabel = "Enregistrer",
  children
}: DataFormProps<T>) {
  const router = useRouter();

  // Utilisation de votre hook existant
  const { state, formAction, isPending, errors, isError, message, isSuccess } = useForm<T>(
    action, 
    initialState
  );

  // Gestion automatique du succès
  useEffect(() => {
    if (isSuccess && onSuccess) {
        onSuccess(state.data);
    }
  }, [isSuccess, onSuccess, state]);

  const formContent = (
    <form action={formAction} className={bare ? "space-y-4" : "p-6 pt-0 space-y-6"}>
      {/* Gestion automatique des erreurs globales */}
      {isError && (
        <Alert variant="danger" title="Erreur">
          {message || "Une erreur est survenue lors de l'enregistrement."}
        </Alert>
      )}

      {/* Gestion automatique du succès message */}
      {isSuccess && (
        <Alert variant="success" title="Succès">
          {message || "Enregistrement effectué avec succès."}
        </Alert>
      )}

      {/* Champs du formulaire */}
      {children({ errors, isPending, data: state.data })}

      {/* Actions standardisées */}
      <FormActions align="right">
        {cancelHref && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.push(cancelHref)}
            disabled={isPending}
          >
            <X size={16} className="mr-2" />
            Annuler
          </Button>
        )}
        
        <Button 
          type="submit" 
          loading={isPending} 
          disabled={isPending}
          variant="primary"
        >
          <Save size={16} className="mr-2" />
          {submitLabel}
        </Button>
      </FormActions>
    </form>
  );

  // Mode bare (pour modals) : pas de Card wrapper
  if (bare) {
    return formContent;
  }

  // Mode normal (pour pages) : avec Card wrapper
  return (
    <Card className="w-full">
      {title && <CardHeader title={title} icon={icon} />}
      
      {description && (
        <div className="px-6 pb-4 text-sm text-neutral-500 border-b border-neutral-100 mb-6">
          {description}
        </div>
      )}

      {formContent}
    </Card>
  );
}
