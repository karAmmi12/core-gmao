'use client';

import { useState, useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Input } from '@/components';
import { activateAccountAction } from '@/app/actions';
import { APP_CONFIG } from '@/config/app.config';
import { CheckCircle } from 'lucide-react';
import { Logo } from '@/presentation/components/ui';

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, formAction, isPending] = useActionState(activateAccountAction, { success: false });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="text-danger-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Lien invalide</h2>
          <p className="text-neutral-600 mb-4">
            Ce lien d'invitation est invalide ou a expiré.
            Contactez votre administrateur pour obtenir un nouveau lien.
          </p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Aller à la connexion
          </Button>
        </Card>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Compte activé !</h2>
          <p className="text-neutral-600 mb-4">
            Votre compte a été activé avec succès.
            Vous pouvez maintenant vous connecter.
          </p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
            <Logo />
          <p className="text-neutral-500 mt-1">
            Créez votre mot de passe pour activer votre compte
          </p>
        </div>

        {/* Formulaire */}
        <Card className="p-6">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            {state?.error && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isPending}
              disabled={isPending}
            >
              {isPending ? 'Activation...' : 'Activer mon compte'}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-neutral-400 text-sm mt-6">
          © {new Date().getFullYear()} {APP_CONFIG.name}
        </p>
      </div>
    </div>
  );
}
