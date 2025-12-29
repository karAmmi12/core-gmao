import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';
import { Card } from '@/components';
import { Button } from '@/components';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-neutral-900 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Page introuvable
          </h2>
          <p className="text-neutral-600 mb-6">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link href="/">
            <Button variant="primary" className="inline-flex items-center gap-2">
              <Home size={16} />
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
