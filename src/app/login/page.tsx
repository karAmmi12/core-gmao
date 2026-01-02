'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Input } from '@/components';
import { APP_CONFIG } from '@/config/app.config';
import { Logo } from '@/presentation/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    error === 'CredentialsSignin' ? 'Identifiants incorrects' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
            <Logo />
          <p className="text-neutral-500 mt-1">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {/* Formulaire */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Adresse email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
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
