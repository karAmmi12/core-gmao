'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportData {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string | number }[];
}

export class ExportService {
  // Méthodes d'export par type (définies dynamiquement ci-dessous)
  static exportTechniciansToPDF: (technicians: any[]) => void;
  static exportTechniciansToExcel: (technicians: any[]) => void;
  static exportInventoryToPDF: (parts: any[]) => void;
  static exportInventoryToExcel: (parts: any[]) => void;
  static exportInventoryToCSV: (parts: any[]) => void;
  static exportAssetsToPDF: (assets: any[]) => void;
  static exportAssetsToExcel: (assets: any[]) => void;
  static exportReportToPDF: (data: ExportData, filename?: string) => void;
  static exportReportToExcel: (data: ExportData, filename?: string) => void;
  static exportWorkOrdersToPDF: (workOrders: any[]) => void;
  static exportWorkOrdersToExcel: (workOrders: any[]) => void;
  static exportMaintenanceSchedulesToPDF: (schedules: any[]) => void;
  static exportMaintenanceSchedulesToExcel: (schedules: any[]) => void;
  
  /**
   * Génère et télécharge un PDF
   */
  static exportToPDF(data: ExportData, filename: string = 'rapport') {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175); // Bleu
    doc.text(data.title, pageWidth / 2, 20, { align: 'center' });
    
    if (data.subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(data.subtitle, pageWidth / 2, 28, { align: 'center' });
    }
    
    // Date de génération
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Généré le ${dateStr}`, pageWidth / 2, 35, { align: 'center' });
    
    // Tableau principal
    autoTable(doc, {
      startY: 45,
      head: [data.headers],
      body: data.rows.map(row => row.map(cell => String(cell))),
      theme: 'striped',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 45, left: 14, right: 14 },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });
    
    // Résumé si fourni
    if (data.summary && data.summary.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 45;
      
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text('Résumé', 14, finalY + 15);
      
      let summaryY = finalY + 25;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      data.summary.forEach(item => {
        doc.text(`${item.label}: `, 14, summaryY);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.value), 80, summaryY);
        doc.setFont('helvetica', 'normal');
        summaryY += 7;
      });
    }
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} / ${pageCount} - GMAO Core`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Téléchargement
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Génère et télécharge un fichier Excel
   */
  static exportToExcel(data: ExportData, filename: string = 'rapport') {
    // Créer le workbook
    const wb = XLSX.utils.book_new();
    
    // Préparer les données avec en-têtes
    const wsData = [
      [data.title],
      data.subtitle ? [data.subtitle] : [],
      [`Généré le ${new Date().toLocaleDateString('fr-FR')}`],
      [], // Ligne vide
      data.headers,
      ...data.rows
    ].filter(row => row.length > 0);
    
    // Ajouter le résumé si fourni
    if (data.summary && data.summary.length > 0) {
      wsData.push([]);
      wsData.push(['Résumé']);
      data.summary.forEach(item => {
        wsData.push([item.label, item.value]);
      });
    }
    
    // Créer la feuille
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Largeur des colonnes
    const colWidths = data.headers.map((h, i) => {
      const maxLength = Math.max(
        h.length,
        ...data.rows.map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 40) };
    });
    ws['!cols'] = colWidths;
    
    // Ajouter au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    
    // Téléchargement
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Génère et télécharge un fichier CSV
   */
  static exportToCSV(data: ExportData, filename: string = 'rapport') {
    const csvContent = [
      data.headers.join(';'),
      ...data.rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}

// Fonctions utilitaires pour formater les données

export function formatWorkOrdersForExport(workOrders: any[]): ExportData {
  return {
    title: 'Rapport des Ordres de Travail',
    subtitle: `${workOrders.length} intervention(s)`,
    headers: ['Titre', 'Équipement', 'Statut', 'Priorité', 'Type', 'Technicien', 'Date', 'Durée'],
    rows: workOrders.map(wo => [
      wo.title,
      wo.asset?.name || '-',
      wo.status,
      wo.priority,
      wo.type || 'CORRECTIVE',
      wo.assignedTo?.name || 'Non assigné',
      wo.scheduledAt ? new Date(wo.scheduledAt).toLocaleDateString('fr-FR') : '-',
      wo.actualDuration ? `${wo.actualDuration} min` : '-'
    ]),
    summary: [
      { label: 'Total interventions', value: workOrders.length },
      { label: 'Complétées', value: workOrders.filter(w => w.status === 'COMPLETED').length },
      { label: 'En cours', value: workOrders.filter(w => w.status === 'IN_PROGRESS').length },
      { label: 'En attente', value: workOrders.filter(w => w.status === 'PENDING' || w.status === 'PLANNED').length }
    ]
  };
}

export function formatPartsForExport(parts: any[]): ExportData {
  const totalValue = parts.reduce((sum, p) => sum + (p.quantityInStock * p.unitPrice), 0);
  const lowStock = parts.filter(p => p.quantityInStock <= p.minStockLevel);
  
  return {
    title: 'Rapport d\'Inventaire',
    subtitle: `${parts.length} pièce(s) en stock`,
    headers: ['Référence', 'Désignation', 'Catégorie', 'Stock', 'Seuil Min', 'Prix Unit.', 'Valeur Stock'],
    rows: parts.map(p => [
      p.reference,
      p.name,
      p.category || '-',
      p.quantityInStock,
      p.minStockLevel,
      `${p.unitPrice.toFixed(2)}€`,
      `${(p.quantityInStock * p.unitPrice).toFixed(2)}€`
    ]),
    summary: [
      { label: 'Total pièces', value: parts.length },
      { label: 'Valeur totale du stock', value: `${totalValue.toFixed(2)}€` },
      { label: 'Pièces en stock bas', value: lowStock.length },
      { label: 'Pièces en rupture', value: parts.filter(p => p.quantityInStock === 0).length }
    ]
  };
}

export function formatAssetsForExport(assets: any[]): ExportData {
  return {
    title: 'Rapport des Équipements',
    subtitle: `${assets.length} équipement(s)`,
    headers: ['Nom', 'N° Série', 'Type', 'Statut', 'Emplacement', 'Fabricant', 'Modèle'],
    rows: assets.map(a => [
      a.name,
      a.serialNumber,
      a.assetType || '-',
      a.status,
      a.location || '-',
      a.manufacturer || '-',
      a.modelNumber || '-'
    ]),
    summary: [
      { label: 'Total équipements', value: assets.length },
      { label: 'En service', value: assets.filter(a => a.status === 'RUNNING').length },
      { label: 'En maintenance', value: assets.filter(a => a.status === 'MAINTENANCE').length },
      { label: 'Arrêtés', value: assets.filter(a => a.status === 'STOPPED').length }
    ]
  };
}

export function formatTechniciansForExport(technicians: any[]): ExportData {
  return {
    title: 'Rapport des Techniciens',
    subtitle: `${technicians.length} technicien(s)`,
    headers: ['Nom', 'Email', 'Téléphone', 'Compétences', 'Interventions', 'Taux Complétion', 'Statut'],
    rows: technicians.map(t => [
      t.name || t.fullName,
      t.email,
      t.phone || '-',
      Array.isArray(t.skills) ? t.skills.join(', ') : t.skills,
      t.totalAssigned || 0,
      t.completionRate ? `${t.completionRate}%` : '-',
      t.isActive ? 'Actif' : 'Inactif'
    ]),
    summary: [
      { label: 'Total techniciens', value: technicians.length },
      { label: 'Actifs', value: technicians.filter(t => t.isActive).length },
      { label: 'Inactifs', value: technicians.filter(t => !t.isActive).length }
    ]
  };
}

export function formatMaintenanceSchedulesForExport(schedules: any[]): ExportData {
  return {
    title: 'Rapport des Plannings de Maintenance',
    subtitle: `${schedules.length} planning(s)`,
    headers: ['Titre', 'Équipement', 'Fréquence', 'Prochaine Échéance', 'Priorité', 'Technicien', 'Statut'],
    rows: schedules.map(s => [
      s.title,
      s.asset?.name || '-',
      `${s.frequency} (x${s.intervalValue})`,
      new Date(s.nextDueDate).toLocaleDateString('fr-FR'),
      s.priority,
      s.assignedTo?.name || 'Non assigné',
      s.isActive ? 'Actif' : 'Inactif'
    ]),
    summary: [
      { label: 'Total plannings', value: schedules.length },
      { label: 'Actifs', value: schedules.filter(s => s.isActive).length },
      { label: 'À échéance', value: schedules.filter(s => new Date(s.nextDueDate) <= new Date()).length }
    ]
  };
}

// =============================================================================
// HELPER METHODS - Raccourcis pour l'export
// =============================================================================

// Techniciens
ExportService.exportTechniciansToPDF = (technicians: any[]) => {
  ExportService.exportToPDF(formatTechniciansForExport(technicians), 'techniciens');
};

ExportService.exportTechniciansToExcel = (technicians: any[]) => {
  ExportService.exportToExcel(formatTechniciansForExport(technicians), 'techniciens');
};

// Inventaire
ExportService.exportInventoryToPDF = (parts: any[]) => {
  ExportService.exportToPDF(formatPartsForExport(parts), 'inventaire');
};

ExportService.exportInventoryToExcel = (parts: any[]) => {
  ExportService.exportToExcel(formatPartsForExport(parts), 'inventaire');
};

ExportService.exportInventoryToCSV = (parts: any[]) => {
  ExportService.exportToCSV(formatPartsForExport(parts), 'inventaire');
};

// Équipements
ExportService.exportAssetsToPDF = (assets: any[]) => {
  ExportService.exportToPDF(formatAssetsForExport(assets), 'equipements');
};

ExportService.exportAssetsToExcel = (assets: any[]) => {
  ExportService.exportToExcel(formatAssetsForExport(assets), 'equipements');
};

// Rapports génériques
ExportService.exportReportToPDF = (data: ExportData, filename?: string) => {
  ExportService.exportToPDF(data, filename || 'rapport');
};

ExportService.exportReportToExcel = (data: ExportData, filename?: string) => {
  ExportService.exportToExcel(data, filename || 'rapport');
};

// Ordres de travail
ExportService.exportWorkOrdersToPDF = (workOrders: any[]) => {
  ExportService.exportToPDF(formatWorkOrdersForExport(workOrders), 'interventions');
};

ExportService.exportWorkOrdersToExcel = (workOrders: any[]) => {
  ExportService.exportToExcel(formatWorkOrdersForExport(workOrders), 'interventions');
};

// Maintenances planifiées
ExportService.exportMaintenanceSchedulesToPDF = (schedules: any[]) => {
  ExportService.exportToPDF(formatMaintenanceSchedulesForExport(schedules), 'maintenances');
};

ExportService.exportMaintenanceSchedulesToExcel = (schedules: any[]) => {
  ExportService.exportToExcel(formatMaintenanceSchedulesForExport(schedules), 'maintenances');
};

// Déclarations de types pour les méthodes statiques
declare module './ExportService' {
  interface ExportServiceType {
    exportTechniciansToPDF: (technicians: any[]) => void;
    exportTechniciansToExcel: (technicians: any[]) => void;
    exportInventoryToPDF: (parts: any[]) => void;
    exportInventoryToExcel: (parts: any[]) => void;
    exportInventoryToCSV: (parts: any[]) => void;
    exportAssetsToPDF: (assets: any[]) => void;
    exportAssetsToExcel: (assets: any[]) => void;
    exportReportToPDF: (data: ExportData, filename?: string) => void;
    exportReportToExcel: (data: ExportData, filename?: string) => void;
    exportWorkOrdersToPDF: (workOrders: any[]) => void;
    exportWorkOrdersToExcel: (workOrders: any[]) => void;
    exportMaintenanceSchedulesToPDF: (schedules: any[]) => void;
    exportMaintenanceSchedulesToExcel: (schedules: any[]) => void;
  }
}
