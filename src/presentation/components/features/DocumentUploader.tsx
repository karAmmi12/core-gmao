/**
 * DocumentUploader - Composant professionnel pour scanner et traiter des documents via IA
 *
 * Deux modes d'utilisation :
 * - technical_sheet → Extraction de données d'équipement → Création d'Asset
 * - work_report    → Extraction de compte-rendu d'intervention → Pré-remplissage formulaire
 *
 * Architecture: Presentation Layer (Clean Architecture)
 */

'use client';

import { useState, useCallback } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Loader2, Wrench } from 'lucide-react';
import { Button } from '@/presentation/components/ui';
import { cn } from '@/styles/design-system';

// ============================================================================
// Types
// ============================================================================

export type DocumentType = 'technical_sheet' | 'work_report';

export interface TechnicalSheetData {
  name?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  assetType?: string;
  specifications?: Record<string, string>;
  confidence: number;
}

export interface WorkReportData {
  actualDuration?: number;
  description?: string;
  partsUsed?: Array<{ name: string; quantity: number }>;
  diagnosis?: string;
  actionsPerformed?: string;
  confidence: number;
}

export interface TechnicalSheetResult {
  type: 'technical_sheet';
  extractedData: TechnicalSheetData;
  existingAsset?: { id: string; name: string; serialNumber?: string };
  canCreateAsset: boolean;
  reason?: string;
  extractionConfidence?: number;
  fileInfo?: { filename: string; size: number; mimetype: string };
}

export interface WorkReportResult {
  type: 'work_report';
  extractedData: WorkReportData;
  workOrderContext?: { id: string; title: string; assetName: string; currentStatus: string };
  canComplete: boolean;
  reason?: string;
  extractionConfidence?: number;
  fileInfo?: { filename: string; size: number; mimetype: string };
}

export type ProcessingResult = TechnicalSheetResult | WorkReportResult;

export interface DocumentUploaderProps {
  type: DocumentType;
  workOrderId?: string;
  onProcessed?: (result: ProcessingResult) => void;
  className?: string;
}

// ============================================================================
// Configuration visuelle par type
// ============================================================================

const DOC_CONFIG = {
  technical_sheet: {
    title: 'Scanner une fiche technique',
    resultTitle: '📋 Fiche Technique Extraite',
    ResultIcon: FileText,
    placeholder: `Collez ici le contenu de la fiche technique...\n\nExemple:\nMarque: Compresseur Atlas Copco\nModèle: GA 75\nN° série: AII 123456\nPuissance: 75 kW\nPression: 7.5 bar`,
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: 'text-blue-600',
    titleColor: 'text-blue-900',
    labelColor: 'text-blue-800',
    valueColor: 'text-blue-700',
    separator: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  work_report: {
    title: "Scanner un compte-rendu d'intervention",
    resultTitle: "🔧 Compte-Rendu d'Intervention Extrait",
    ResultIcon: Wrench,
    placeholder: `Collez ici le compte-rendu d'intervention...\n\nExemple:\nDurée: 2h30\nDiagnostic: Fuite d'huile au niveau du compresseur\nActions: Remplacement du joint torique\nPièces: Joint torique x2`,
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    icon: 'text-purple-600',
    titleColor: 'text-purple-900',
    labelColor: 'text-purple-800',
    valueColor: 'text-purple-700',
    separator: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
} as const;

// ============================================================================
// Normalisation: garantit toujours un champ `type` dans le résultat
// ============================================================================

function normalizeResult(apiResult: any, expectedType: DocumentType): ProcessingResult {
  const resolvedType: DocumentType = apiResult?.type ?? expectedType;
  return { ...apiResult, type: resolvedType } as ProcessingResult;
}

// ============================================================================
// Sous-composants d'affichage
// ============================================================================

function DataField({
  label,
  value,
  labelClass,
  valueClass,
}: {
  label: string;
  value?: string | number;
  labelClass: string;
  valueClass: string;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex gap-2">
      <span className={cn('font-medium whitespace-nowrap', labelClass)}>{label}:</span>
      <span className={valueClass}>{String(value)}</span>
    </div>
  );
}

function TechnicalSheetFields({ data, cfg }: { data: TechnicalSheetData; cfg: typeof DOC_CONFIG.technical_sheet }) {
  return (
    <div className="space-y-2 text-sm">
      <DataField label="Nom" value={data.name} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      <DataField label="Fabricant" value={data.manufacturer} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      <DataField label="Modèle" value={data.modelNumber} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      <DataField label="N° série" value={data.serialNumber} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      <DataField label="Type" value={data.assetType} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      <DataField label="Confiance" value={`${Math.round(data.confidence * 100)}%`} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      {data.specifications && Object.keys(data.specifications).length > 0 && (
        <div className={cn('pt-2 border-t', cfg.separator)}>
          <span className={cn('font-medium', cfg.labelColor)}>Spécifications:</span>
          <pre className={cn('mt-1 text-xs bg-white p-2 rounded overflow-auto border', cfg.separator)}>
            {JSON.stringify(data.specifications, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function WorkReportFields({ data, cfg }: { data: WorkReportData; cfg: typeof DOC_CONFIG.work_report }) {
  return (
    <div className="space-y-2 text-sm">
      <DataField
        label="⏱️ Durée réelle"
        value={data.actualDuration ? `${data.actualDuration} minutes` : undefined}
        labelClass={cfg.labelColor} valueClass={cfg.valueColor}
      />
      <DataField label="📝 Description" value={data.description} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      <DataField label="🔍 Diagnostic" value={data.diagnosis} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      <DataField label="✅ Actions effectuées" value={data.actionsPerformed} labelClass={cfg.labelColor} valueClass={cfg.valueColor} />
      {data.partsUsed && data.partsUsed.length > 0 && (
        <div className={cn('pt-2 mt-2 border-t', cfg.separator)}>
          <span className={cn('font-medium', cfg.labelColor)}>🔧 Pièces utilisées:</span>
          <ul className={cn('mt-1 ml-4 list-disc', cfg.valueColor)}>
            {data.partsUsed.map((part, i) => (
              <li key={i}>{part.name} <span className="font-medium">(×{part.quantity})</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Composant principal
// ============================================================================

export function DocumentUploader({ type, workOrderId, onProcessed, className }: DocumentUploaderProps) {
  const [mode, setMode] = useState<'text' | 'file'>('file');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdAsset, setCreatedAsset] = useState<{ id: string; name: string } | null>(null);

  // Type effectif: résultat API > prop
  const effectiveType: DocumentType = result?.type ?? type;
  const cfg = DOC_CONFIG[effectiveType];

  // ── Handlers ──

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  }, []);

  const processApiResponse = useCallback((data: any) => {
    const normalized = normalizeResult(data.result, type);
    console.log(`[DocumentUploader] ✅ type=${normalized.type}`, normalized.extractedData);
    setResult(normalized);
    onProcessed?.(normalized);
  }, [type, onProcessed]);

  const handleProcessFile = useCallback(async () => {
    if (!selectedFile) { setError('Veuillez sélectionner un fichier'); return; }
    if (type === 'work_report' && !workOrderId) { setError('workOrderId requis pour un compte-rendu'); return; }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);
      if (workOrderId) formData.append('workOrderId', workOrderId);

      console.log(`[DocumentUploader] 📤 Upload: file=${selectedFile.name} type=${type} workOrderId=${workOrderId ?? 'N/A'}`);

      const response = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de traitement');

      processApiResponse(data);
    } catch (err: any) {
      console.error('[DocumentUploader] ❌', err.message);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }, [selectedFile, type, workOrderId, processApiResponse]);

  const handleProcessText = useCallback(async () => {
    if (!content.trim()) { setError('Veuillez saisir du contenu'); return; }
    if (type === 'work_report' && !workOrderId) { setError('workOrderId requis pour un compte-rendu'); return; }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      console.log(`[DocumentUploader] 📤 Text: ${content.length} chars type=${type} workOrderId=${workOrderId ?? 'N/A'}`);

      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, workOrderId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de traitement');

      processApiResponse(data);
    } catch (err: any) {
      console.error('[DocumentUploader] ❌', err.message);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }, [content, type, workOrderId, processApiResponse]);

  const handleCreateAsset = useCallback(async () => {
    if (!result?.extractedData) return;
    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/documents/create-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedData: result.extractedData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de création');

      setCreatedAsset({ id: data.assetId, name: data.assetName });
      setTimeout(() => { setContent(''); setResult(null); setCreatedAsset(null); }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }, [result]);

  // ── Render ──

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header avec badge type */}
      <div className="flex items-center gap-3 text-gray-700">
        {type === 'work_report' ? <Wrench className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
        <h3 className="font-medium">{DOC_CONFIG[type].title}</h3>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', DOC_CONFIG[type].badge)}>
          {type === 'technical_sheet' ? 'Fiche technique' : 'Compte-rendu'}
        </span>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setMode('file')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            mode === 'file'
              ? type === 'work_report' ? 'border-purple-600 text-purple-600' : 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Uploader un fichier
        </button>
        <button
          onClick={() => setMode('text')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            mode === 'text'
              ? type === 'work_report' ? 'border-purple-600 text-purple-600' : 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Saisir du texte
        </button>
      </div>

      {/* Mode: Upload fichier */}
      {mode === 'file' && (
        <>
          <div className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            type === 'work_report'
              ? 'border-purple-300 hover:border-purple-400'
              : 'border-gray-300 hover:border-blue-400'
          )}>
            <input
              type="file"
              id={`file-upload-${type}`}
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={processing}
            />
            <label htmlFor={`file-upload-${type}`} className="cursor-pointer flex flex-col items-center gap-3">
              <Upload className={cn('w-12 h-12', type === 'work_report' ? 'text-purple-400' : 'text-gray-400')} />
              <div>
                <p className="text-sm font-medium text-gray-700">Cliquez pour uploader ou glissez un fichier</p>
                <p className="text-xs text-gray-500 mt-1">PDF, Images (JPG, PNG, TIFF, BMP) avec OCR, TXT - Max 10MB</p>
                <p className="text-xs text-emerald-600 mt-1">✅ Extraction automatique du texte depuis PDF ou OCR pour images</p>
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className={cn('w-5 h-5', type === 'work_report' ? 'text-purple-600' : 'text-blue-600')} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button onClick={handleProcessFile} disabled={processing} variant="primary" size="sm">
                {processing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse en cours...</>
                ) : (
                  'Analyser'
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Mode: Saisir du texte */}
      {mode === 'text' && (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={DOC_CONFIG[type].placeholder}
            disabled={processing}
            className={cn(
              'w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed',
              type === 'work_report'
                ? 'border-purple-300 focus:ring-purple-500'
                : 'border-gray-300 focus:ring-blue-500'
            )}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {content.length > 0 ? `${content.length} caractères` : 'Collez votre texte ici'}
            </span>
            <Button onClick={handleProcessText} disabled={!content.trim() || processing} variant="primary" size="md">
              {processing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse en cours...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Analyser avec IA</>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Erreur */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* RÉSULTAT - Stylé selon effectiveType (result.type ?? prop type) */}
      {/* ================================================================ */}
      {result && (
        <div className={cn('p-4 rounded-lg border-2', cfg.bg, cfg.border)}>
          <div className="flex items-start gap-2">
            <CheckCircle className={cn('w-5 h-5 mt-0.5 shrink-0', cfg.icon)} />
            <div className="flex-1 min-w-0">
              {/* Titre */}
              <h4 className={cn('font-semibold mb-3 text-base flex items-center gap-2', cfg.titleColor)}>
                <cfg.ResultIcon className="w-5 h-5" />
                {cfg.resultTitle}
              </h4>

              {/* Données fiche technique */}
              {effectiveType === 'technical_sheet' && result.extractedData && (
                <TechnicalSheetFields
                  data={result.extractedData as TechnicalSheetData}
                  cfg={DOC_CONFIG.technical_sheet}
                />
              )}

              {/* Données compte-rendu */}
              {effectiveType === 'work_report' && result.extractedData && (
                <WorkReportFields
                  data={result.extractedData as WorkReportData}
                  cfg={DOC_CONFIG.work_report}
                />
              )}

              {/* Avertissement */}
              {result.reason && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ⚠️ {result.reason}
                </div>
              )}

              {/* Bouton créer asset (fiche technique uniquement) */}
              {effectiveType === 'technical_sheet' && 'canCreateAsset' in result && result.canCreateAsset && !createdAsset && (
                <Button size="sm" variant="primary" className="mt-3" onClick={handleCreateAsset} disabled={creating}>
                  {creating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création en cours...</>
                  ) : (
                    'Créer cet équipement'
                  )}
                </Button>
              )}

              {/* Asset créé */}
              {createdAsset && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Équipement créé avec succès !</span>
                  </div>
                  <a href={`/assets/${createdAsset.id}`} className="text-sm text-blue-600 hover:text-blue-700 underline">
                    Voir {createdAsset.name} →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
