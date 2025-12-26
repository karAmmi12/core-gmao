'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary pour capturer les erreurs React et afficher une UI de secours
 * Utilisation : Envelopper les composants critiques avec ce composant
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Une erreur est survenue
              </h2>
              <p className="text-neutral-600 mb-6">
                {this.state.error?.message || 'Erreur inconnue'}
              </p>
              <Button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                variant="primary"
              >
                Retourner au tableau de bord
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
