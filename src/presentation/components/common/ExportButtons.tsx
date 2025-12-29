'use client';

import { useState } from 'react';
import { Button } from '@/components';
import { ExportService, ExportData } from '@/core/application/services/ExportService';

interface ExportButtonsProps {
  getData: () => ExportData;
  filename: string;
  className?: string;
}

export function ExportButtons({ getData, filename, className = '' }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(format);
    try {
      const data = getData();
      
      switch (format) {
        case 'pdf':
          ExportService.exportToPDF(data, filename);
          break;
        case 'excel':
          ExportService.exportToExcel(data, filename);
          break;
        case 'csv':
          ExportService.exportToCSV(data, filename);
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    } finally {
      setTimeout(() => setIsExporting(null), 500);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={isExporting !== null}
      >
        {isExporting === 'pdf' ? (
          <span className="flex items-center gap-2">
            <Spinner /> Export...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>📄</span> PDF
          </span>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('excel')}
        disabled={isExporting !== null}
      >
        {isExporting === 'excel' ? (
          <span className="flex items-center gap-2">
            <Spinner /> Export...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>📊</span> Excel
          </span>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('csv')}
        disabled={isExporting !== null}
      >
        {isExporting === 'csv' ? (
          <span className="flex items-center gap-2">
            <Spinner /> Export...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>📋</span> CSV
          </span>
        )}
      </Button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4"
        fill="none"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Composant pour export rapide avec données pré-chargées
interface QuickExportProps {
  data: ExportData;
  filename: string;
  label?: string;
}

export function QuickExportDropdown({ data, filename, label = 'Exporter' }: QuickExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    setIsOpen(false);
    
    try {
      switch (format) {
        case 'pdf':
          ExportService.exportToPDF(data, filename);
          break;
        case 'excel':
          ExportService.exportToExcel(data, filename);
          break;
        case 'csv':
          ExportService.exportToCSV(data, filename);
          break;
      }
    } catch (error) {
      console.error('Erreur export:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
      >
        {isExporting ? (
          <span className="flex items-center gap-2">
            <Spinner /> Export...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            📥 {label}
          </span>
        )}
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-20 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => handleExport('pdf')}
            >
              📄 Export PDF
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => handleExport('excel')}
            >
              📊 Export Excel
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => handleExport('csv')}
            >
              📋 Export CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
