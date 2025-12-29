// presentation/views/settings/ConfigurationCategory.tsx
'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, Code2, Palette } from 'lucide-react';
import type { ConfigurationWithItemsDTO } from '@/core/application/dto/ConfigurationDTO';
import { Card, Button, Badge } from '@/components';
import { CreateItemModal } from './CreateItemModal';
import { EditItemModal } from './EditItemModal';
import { deleteItemAction } from '@/app/actions';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface ConfigurationCategoryProps {
  category: ConfigurationWithItemsDTO;
}

export function ConfigurationCategory({ category }: ConfigurationCategoryProps) {
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string, label: string) => {
    if (!confirm(`Supprimer "${label}" ?`)) return;

    const result = await deleteItemAction(itemId);
    if (result?.error) {
      alert(`Erreur: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Info */}
      <Card>
        <div className={LAYOUT_STYLES.flexResponsiveBetween}>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-neutral-600 mb-3">{category.description}</p>
            )}
            <div className={cn(LAYOUT_STYLES.flexRow, 'flex-wrap')}>
              <Badge color="neutral" size="sm">
                <Code2 size={12} className="mr-1" />
                {category.code}
              </Badge>
              {category.isSystem && (
                <Badge color="primary" size="sm">
                  Système
                </Badge>
              )}
            </div>
          </div>
          <Button onClick={() => setShowCreateItem(true)} icon={<Plus size={18} />}>
            Ajouter
          </Button>
        </div>
      </Card>

      {/* Items List */}
      <div className={LAYOUT_STYLES.gridResponsive3}>
        {category.items.length === 0 ? (
          <Card className="col-span-full">
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-4">Aucun élément dans cette catégorie</p>
              <Button onClick={() => setShowCreateItem(true)} variant="secondary">
                Ajouter le premier élément
              </Button>
            </div>
          </Card>
        ) : (
          category.items.map((item) => (
            <Card 
              key={item.id} 
              className={cn(
                'hover:shadow-md transition-shadow',
                !item.isActive && 'opacity-50 bg-neutral-50'
              )}
            >
              <div className={cn(LAYOUT_STYLES.flexRow, 'justify-between items-start mb-3')}>
                <div className={cn(LAYOUT_STYLES.flexRow, 'gap-2 flex-1')}>
                  {item.color && (
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  <h3 className="font-medium text-neutral-900">{item.label}</h3>
                </div>
                <div className={cn(LAYOUT_STYLES.flexRow, 'gap-1')}>
                  {!item.isActive && <Badge color="neutral" size="sm">Inactif</Badge>}
                  {item.isDefault && <Badge color="primary" size="sm">Par défaut</Badge>}
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-neutral-600 mb-3">{item.description}</p>
              )}

              <div className={cn(LAYOUT_STYLES.flexRow, 'gap-2 text-xs text-neutral-500 mb-3')}>
                <span className="font-mono bg-neutral-100 px-2 py-1 rounded">
                  {item.code}
                </span>
                {item.icon && <span>{item.icon}</span>}
              </div>

              <div className={cn(LAYOUT_STYLES.flexRow, 'gap-2 pt-3 border-t border-neutral-200')}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingItemId(item.id)}
                >
                  Modifier
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(item.id, item.label)}
                >
                  Supprimer
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateItem && (
        <CreateItemModal
          categoryId={category.id}
          onClose={() => setShowCreateItem(false)}
        />
      )}
      {editingItemId && (
        <EditItemModal
          item={category.items.find((i) => i.id === editingItemId)!}
          onClose={() => setEditingItemId(null)}
        />
      )}
    </div>
  );
}
