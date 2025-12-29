/**
 * Techniciens - Contenu Client
 */

'use client';

import { useState } from 'react';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  LinkButton,
  Avatar,
  EmptyState,
  SearchInput,
  DataTable,
  StatsGrid,
  StatCard,
  type Column,
} from '@/components';
import Link from 'next/link';
import { useSearch } from '@/presentation/hooks';
import { cn, LAYOUT_STYLES } from '@/styles/design-system';
import type { TechnicianDTO } from '@/core/application/dto/TechnicianDTO';

// Export buttons (simplified version)
import { ExportService } from '@/core/application/services/ExportService';

interface TechniciansContentProps {
  technicians: TechnicianDTO[];
}

export function TechniciansContent({ technicians }: TechniciansContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { query, setQuery, filteredItems, clearSearch } = useSearch(technicians, {
    searchKeys: ['fullName', 'email', 'specialization'],
  });

  // Stats
  const activeTechs = technicians.filter(t => t.isActive).length;
  const allSkills = [...new Set(technicians.flatMap(t => t.skills))];

  // Export handlers
  const handleExportPDF = () => {
    ExportService.exportTechniciansToPDF(technicians);
  };

  const handleExportExcel = () => {
    ExportService.exportTechniciansToExcel(technicians);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Équipe Technique"
        description={`${technicians.length} techniciens • ${activeTechs} actifs`}
        icon="👷"
        actions={
          <div className={LAYOUT_STYLES.flexRow}>
            <Button variant="secondary" onClick={handleExportPDF} icon="📄">
              PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon="📊">
              Excel
            </Button>
            <LinkButton href="/technicians/new" variant="primary" icon="➕">
              Nouveau
            </LinkButton>
          </div>
        }
      />

      {/* Stats */}
      <StatsGrid columns={3}>
        <StatCard
          label="Techniciens"
          value={technicians.length}
          icon={<span className="text-2xl">👷</span>}
          color="primary"
        />
        <StatCard
          label="Actifs"
          value={activeTechs}
          icon={<span className="text-2xl">✅</span>}
          color="success"
        />
        <StatCard
          label="Compétences"
          value={allSkills.length}
          icon={<span className="text-2xl">🛠️</span>}
          color="neutral"
        />
      </StatsGrid>

      {/* Filters & View Toggle */}
      <div className={LAYOUT_STYLES.flexResponsiveBetween}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un technicien..."
          className="w-full md:w-80"
        />
        <div className={LAYOUT_STYLES.flexRow}>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grille
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<span className="text-5xl">👷</span>}
          title={query ? 'Aucun résultat' : 'Aucun technicien'}
          description={query ? `Aucun technicien trouvé pour "${query}"` : 'Ajoutez votre premier technicien'}
          action={
            query ? (
              <Button variant="secondary" onClick={clearSearch}>
                Effacer la recherche
              </Button>
            ) : (
              <LinkButton href="/technicians/new" variant="primary">
                Ajouter un technicien
              </LinkButton>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <TechniciansGrid technicians={filteredItems} />
      ) : (
        <TechniciansTable technicians={filteredItems} />
      )}
    </div>
  );
}

// =============================================================================
// GRID VIEW
// =============================================================================

function TechniciansGrid({ technicians }: { technicians: TechnicianDTO[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {technicians.map(tech => (
        <TechnicianCard key={tech.id} technician={tech} />
      ))}
    </div>
  );
}

function TechnicianCard({ technician }: { technician: TechnicianDTO }) {
  return (
    <Link href={`/technicians/${technician.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <Avatar name={technician.fullName} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-900 truncate">
                {technician.fullName}
              </h3>
              <Badge color={technician.isActive ? 'success' : 'danger'} size="sm">
                {technician.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {technician.specialization && (
              <p className="text-sm text-neutral-500 mb-2">{technician.specialization}</p>
            )}

            <div className="space-y-1 text-sm text-neutral-600">
              <p className="flex items-center gap-2">
                <span>✉️</span>
                <span className="truncate">{technician.email}</span>
              </p>
              {technician.phone && (
                <p className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{technician.phone}</span>
                </p>
              )}
            </div>

            {technician.skills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">
                  Compétences
                </p>
                <div className="flex flex-wrap gap-1">
                {technician.skills.slice(0, 4).map((skill, idx) => (
                  <Badge key={idx} color="primary" size="xs">
                    {skill}
                  </Badge>
                ))}
                {technician.skills.length > 4 && (
                  <Badge color="neutral" size="xs">
                    +{technician.skills.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </Card>
    </Link>
  );
}

// =============================================================================
// TABLE VIEW
// =============================================================================

function TechniciansTable({ technicians }: { technicians: TechnicianDTO[] }) {
  const columns: Column<TechnicianDTO>[] = [
    {
      key: 'fullName',
      header: 'Technicien',
      render: (tech) => (
        <div className="flex items-center gap-3">
          <Avatar name={tech.fullName} size="sm" />
          <div>
            <p className="font-medium text-neutral-900">{tech.fullName}</p>
            <p className="text-xs text-neutral-500">{tech.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Spécialisation',
      render: (tech) => tech.specialization || '-',
    },
    {
      key: 'phone',
      header: 'Téléphone',
      render: (tech) => tech.phone || '-',
    },
    {
      key: 'skills',
      header: 'Compétences',
      render: (tech) => (
        <div className="flex flex-wrap gap-1">
          {tech.skills.slice(0, 2).map((skill, idx) => (
            <Badge key={idx} color="primary" size="xs">
              {skill}
            </Badge>
          ))}
          {tech.skills.length > 2 && (
            <Badge color="neutral" size="xs">
              +{tech.skills.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      align: 'center',
      render: (tech) => (
        <Badge color={tech.isActive ? 'success' : 'danger'} size="sm">
          {tech.isActive ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
  ];

  return (
    <Card padding="none">
      <DataTable columns={columns} data={technicians} keyField="id" />
    </Card>
  );
}
