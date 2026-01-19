/**
 * Client Component pour les interactions sur la page détail technicien
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, Badge, Button } from '@/components';
import { deleteTechnicianAction } from '@/app/actions';
import type { TechnicianDTO } from '@/core/application/dto/TechnicianDTO';

interface TechnicianDetailClientProps {
  technician: TechnicianDTO;
}

export function TechnicianDetailClient({ technician }: TechnicianDetailClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTechnicianAction({ success: false }, technician.id);
    
    if (result?.success) {
      router.push('/technicians');
      router.refresh();
    } else {
      alert(result?.message || result?.error || 'Erreur lors de la suppression');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
              👷
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{technician.name}</h2>
              <p className="text-neutral-500">{technician.specialization}</p>
            </div>
          </div>
          <Badge color={technician.isActive ? 'success' : 'danger'} size="lg">
            {technician.isActive ? '✅ Actif' : '❌ Inactif'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase mb-2">Contact</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-neutral-700">
                <span>✉️</span>
                <a href={`mailto:${technician.email}`} className="hover:text-primary-600">
                  {technician.email}
                </a>
              </p>
              {technician.phone && (
                <p className="flex items-center gap-2 text-neutral-700">
                  <span>📞</span>
                  <a href={`tel:${technician.phone}`} className="hover:text-primary-600">
                    {technician.phone}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase mb-2">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {technician.skills.map((skill, idx) => (
                <Badge key={idx} color="primary" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Zone danger */}
      <Card className="border-danger-200 bg-danger-50">
        <h3 className="text-lg font-semibold text-danger-900 mb-2">Zone de danger</h3>
        <p className="text-sm text-danger-700 mb-4">
          La désactivation retire le technicien des affectations futures mais conserve son historique.
        </p>
        
        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️ Désactiver ce technicien
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-danger-700 font-medium">Confirmer la désactivation ?</p>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Désactivation...' : 'Oui, désactiver'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
