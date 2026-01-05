'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  pageSize
}: PaginationProps) {
  const pages = [];
  
  // Toujours afficher la première page
  pages.push(1);
  
  // Calculer les pages à afficher autour de la page courante
  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);
  
  // Ajouter "..." après la première page si nécessaire
  if (startPage > 2) {
    pages.push(-1); // -1 représente "..."
  }
  
  // Ajouter les pages du milieu
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  // Ajouter "..." avant la dernière page si nécessaire
  if (endPage < totalPages - 1) {
    pages.push(-2); // -2 représente "..."
  }
  
  // Toujours afficher la dernière page (si > 1)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  const startItem = pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem = pageSize ? Math.min(currentPage * pageSize, totalItems || 0) : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 sm:px-6">
      {/* Info sur mobile */}
      {totalItems && pageSize && (
        <div className="flex justify-between sm:hidden w-full">
          <span className="text-sm text-neutral-700">
            {startItem}-{endItem} sur {totalItems}
          </span>
        </div>
      )}

      {/* Navigation complète sur desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {totalItems && pageSize && (
          <div>
            <p className="text-sm text-neutral-700">
              Affichage de <span className="font-medium">{startItem}</span> à{' '}
              <span className="font-medium">{endItem}</span> sur{' '}
              <span className="font-medium">{totalItems}</span> résultats
            </p>
          </div>
        )}
        
        <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
          {/* Bouton Précédent */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Précédent</span>
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Numéros de page */}
          {pages.map((page, index) => {
            if (page === -1 || page === -2) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-inset ring-neutral-300"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-neutral-300 focus:z-20 ${
                  currentPage === page
                    ? 'z-10 bg-primary-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                    : 'text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Bouton Suivant */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Suivant</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      </div>

      {/* Pagination mobile simplifiée */}
      <div className="flex flex-1 justify-between sm:hidden mt-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-neutral-900 bg-white ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          Précédent
        </button>
        <span className="text-sm text-neutral-700 flex items-center">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-neutral-900 bg-white ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
