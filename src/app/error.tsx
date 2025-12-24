'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-slate-600 mb-6">
            {error.message || 'Erreur inconnue'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => reset()} variant="primary">
              Réessayer
            </Button>
            <Button onClick={() => (window.location.href = '/')} variant="secondary">
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
