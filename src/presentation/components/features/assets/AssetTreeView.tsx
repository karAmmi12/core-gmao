'use client';

import { AssetTreeDTO } from "@/core/application/dto/AssetDTO";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AssetStatusBadge } from "./AssetStatusBadge";
import Link from "next/link";

interface AssetTreeViewProps {
  tree: AssetTreeDTO[];
}

export function AssetTreeView({ tree }: AssetTreeViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        🏗️ Hiérarchie des Actifs
      </h3>
      <div className="space-y-1">
        {tree.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

interface TreeNodeProps {
  node: AssetTreeDTO;
}

function TreeNode({ node }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-neutral-50 transition-colors"
        style={{ paddingLeft: `${node.level * 24 + 12}px` }}
      >
        {/* Toggle icon */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-neutral-500 hover:text-neutral-700"
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        ) : (
          <span className="w-4" /> // Espaceur pour alignement
        )}

        {/* Type d'actif icon */}
        <span className="text-lg">{getAssetIcon(node.assetType)}</span>

        {/* Nom de l'actif */}
        <Link
          href={`/assets/${node.id}`}
          className="flex-1 font-medium text-neutral-900 hover:text-primary-600"
        >
          {node.name}
        </Link>

        {/* Status badge */}
        <AssetStatusBadge status={node.status} />

        {/* Métadonnées */}
        <span className="text-xs text-neutral-500">{node.serialNumber}</span>
      </div>

      {/* Enfants */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function getAssetIcon(assetType?: string): string {
  switch (assetType) {
    case 'SITE':
      return '🏭';
    case 'BUILDING':
      return '🏢';
    case 'LINE':
      return '⚙️';
    case 'MACHINE':
      return '🔧';
    case 'COMPONENT':
      return '🔩';
    default:
      return '📦';
  }
}
