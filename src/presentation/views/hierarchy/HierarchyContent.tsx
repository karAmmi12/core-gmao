/**
 * Hiérarchie - Contenu Client
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PageHeader,
  Card,
  Badge,
  LinkButton,
  EmptyState,
} from '@/components';
import { ASSET_TYPES, STATUS_CONFIG, cn, type AssetStatus } from '@/styles/design-system';
import type { AssetTreeDTO } from '@/core/application/dto/AssetDTO';

interface HierarchyContentProps {
  tree: AssetTreeDTO[];
}

export function HierarchyContent({ tree }: HierarchyContentProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Compter les assets par type
  const countByType = tree.reduce((acc, node) => {
    const type = node.assetType || 'OTHER';
    acc[type] = (acc[type] || 0) + 1 + countChildren(node.children || []);
    return acc;
  }, {} as Record<string, number>);

  function countChildren(nodes: AssetTreeDTO[]): number {
    return nodes.reduce((sum, node) => {
      return sum + 1 + countChildren(node.children || []);
    }, 0);
  }

  const totalAssets = Object.values(countByType).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiérarchie des Équipements"
        description="Vue arborescente du parc machine : Site → Bâtiments → Lignes → Machines → Composants"
        icon="🏭"
        actions={
          <LinkButton href="/assets/new" variant="primary" icon="➕">
            Nouvel équipement
          </LinkButton>
        }
      />

      {/* Stats rapides */}
      <div className="flex flex-wrap gap-4">
        {ASSET_TYPES.map(type => (
          <div key={type.value} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
            <span className="text-xl">{type.icon}</span>
            <span className="font-semibold">{countByType[type.value] || 0}</span>
            <span className="text-sm text-neutral-500">{type.label}s</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg border border-primary-200">
          <span className="font-bold text-primary-700">{totalAssets}</span>
          <span className="text-sm text-primary-600">Total</span>
        </div>
      </div>

      {/* Arborescence */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">🏗️ Arborescence</h2>
          <span className="text-sm text-neutral-500">{tree.length} racine(s)</span>
        </div>

        {tree.length === 0 ? (
          <EmptyState
            icon={<span className="text-5xl">🏭</span>}
            title="Aucun équipement"
            description="Commencez par créer votre premier site ou équipement"
            action={
              <LinkButton href="/assets/new" variant="primary">
                Créer un équipement
              </LinkButton>
            }
          />
        ) : (
          <div className="space-y-1">
            {tree.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// =============================================================================
// TREE NODE COMPONENT
// =============================================================================

interface TreeNodeProps {
  node: AssetTreeDTO;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function TreeNode({ node, selectedId, onSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const typeConfig = ASSET_TYPES.find(t => t.value === node.assetType);
  const statusConfig = STATUS_CONFIG.asset[node.status as AssetStatus];

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg transition-colors',
          isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'
        )}
        style={{ paddingLeft: `${node.level * 24 + 12}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-neutral-400 hover:text-neutral-600 w-5 h-5 flex items-center justify-center"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Type Icon */}
        <span className="text-lg">{typeConfig?.icon || '📦'}</span>

        {/* Name */}
        <Link
          href={`/assets/${node.id}`}
          onClick={() => onSelect(node.id)}
          className={cn(
            'flex-1 font-medium transition-colors',
            isSelected ? 'text-primary-700' : 'text-neutral-900 hover:text-primary-600'
          )}
        >
          {node.name}
        </Link>

        {/* Status */}
        {statusConfig && (
          <Badge color={statusConfig.color} size="sm">
            {statusConfig.icon} {statusConfig.label}
          </Badge>
        )}

        {/* Serial Number */}
        <span className="text-xs text-neutral-400 font-mono">{node.serialNumber}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
