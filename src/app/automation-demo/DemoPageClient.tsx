'use client';

import { DocumentUploader } from '@/presentation/components/features/DocumentUploader';
import { Card } from '@/presentation/components/ui';
import { FileText, Wrench, AlertCircle } from 'lucide-react';

interface DemoPageClientProps {
  workOrder: {
    id: string;
    title: string;
    status: string;
    asset: {
      name: string;
    };
  } | null;
}

export function DemoPageClient({ workOrder }: DemoPageClientProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 Automatisation IA - Traitement de Documents
        </h1>
        <p className="text-gray-600">
          Testez l'extraction automatique de données depuis des fiches techniques et comptes-rendus
          d'intervention
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Fiche Technique */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Fiche Technique → Asset</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Scannez une fiche technique pour créer automatiquement un équipement dans la GMAO
          </p>
          <DocumentUploader
            type="technical_sheet"
            onProcessed={(result) => {
              console.log('Technical sheet processed:', result);
            }}
          />
        </Card>

        {/* Compte-rendu */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <Wrench className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Compte-Rendu → WorkOrder</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Scannez un compte-rendu pour pré-remplir la clôture d'un ordre de travail
          </p>

          {workOrder ? (
            <>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-medium text-green-900">
                  WorkOrder utilisé pour la démo:
                </p>
                <p className="text-green-700">
                  {workOrder.title} - {workOrder.asset.name}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ID: {workOrder.id} | Status: {workOrder.status}
                </p>
              </div>
              <DocumentUploader
                type="work_report"
                workOrderId={workOrder.id}
                onProcessed={(result) => {
                  console.log('Work report processed:', result);
                }}
              />
            </>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Aucun ordre de travail disponible</p>
                  <p>
                    Pour tester cette fonctionnalité, créez d'abord un ordre de travail en statut
                    "EN COURS" depuis la page{' '}
                    <a href="/work-orders" className="underline hover:text-yellow-900">
                      Ordres de travail
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Instructions */}
      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">📋 Comment tester (MVP)</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Étape 1:</strong> Collez du texte brut dans la zone de saisie (fiche
            technique ou compte-rendu)
          </p>
          <p>
            <strong>Étape 2:</strong> Cliquez sur "Analyser avec IA"
          </p>
          <p>
            <strong>Étape 3:</strong> L'IA Groq extrait automatiquement les données structurées
          </p>
          <p className="pt-2 border-t border-blue-200">
            <strong>Note:</strong> Pour l'instant, seul le texte brut est supporté. L'upload de
            PDF/images sera ajouté dans la prochaine version avec Vercel Blob + OCR.
          </p>
        </div>
      </Card>

      {/* Exemple */}
      <Card className="p-6 mt-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Exemples de données à tester</h3>

        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-1">Exemple Fiche Technique:</p>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {`FICHE TECHNIQUE COMPRESSEUR

Marque: Atlas Copco
Modèle: GA 75 VSD+
Numéro de série: AII294567
Type: Compresseur à vis

Spécifications techniques:
- Puissance moteur: 75 kW
- Pression de service: 7.5 bar
- Débit d'air: 12.5 m³/min
- Dimensions: 1800 x 1200 x 1650 mm
- Poids: 1850 kg
- Année de fabrication: 2023`}
            </pre>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">Exemple Compte-Rendu:</p>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {`COMPTE-RENDU D'INTERVENTION

Équipement: Compresseur GA 75
Intervention: Maintenance corrective

Durée d'intervention: 3h15
Date: 28/02/2026

Diagnostic:
- Fuite d'huile importante au niveau du carter
- Vibrations anormales détectées
- Pression instable

Actions réalisées:
- Remplacement du joint de carter
- Vérification et resserrage des boulons de fixation
- Nettoyage complet du système de lubrification
- Test de fonctionnement OK

Pièces utilisées:
- Joint de carter (x1)
- Huile synthétique 5L (x2)
- Filtre à huile (x1)

Recommandations:
- Surveiller la pression durant 48h
- Prochain contrôle dans 1 mois`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
