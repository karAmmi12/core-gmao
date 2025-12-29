// presentation/views/settings/SettingsContent.tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ConfigurationWithItemsDTO } from '@/core/application/dto/ConfigurationDTO';
import { Card, Button, PageHeader } from '@/components';
import { ConfigurationCategory } from './ConfigurationCategory';
import { CreateCategoryModal } from './CreateCategoryModal';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface SettingsContentProps {
  categories: ConfigurationWithItemsDTO[];
}

export function SettingsContent({ categories }: SettingsContentProps) {
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>(categories[0]?.code || '');

  const selectedCategory = categories.find((cat) => cat.code === selectedTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Paramètres"
        description={`${categories.length} catégorie${categories.length > 1 ? 's' : ''} de configuration`}
        icon="⚙️"
        actions={
          <Button onClick={() => setShowCreateCategory(true)} icon={<Plus size={18} />}>
            Nouvelle Catégorie
          </Button>
        }
      />

      {/* Tabs */}
      {categories.length > 0 ? (
        <div className="border-b border-neutral-200">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedTab(category.code)}
                className={cn(
                  'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  selectedTab === category.code
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                )}
              >
                {category.name}
                <span className="ml-2 text-xs text-neutral-400">
                  ({category.itemCount || 0})
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">
              Aucune catégorie de configuration définie
            </p>
            <Button onClick={() => setShowCreateCategory(true)}>
              Créer la première catégorie
            </Button>
          </div>
        </Card>
      )}

      {/* Content */}
      {selectedCategory && (
        <ConfigurationCategory category={selectedCategory} />
      )}

      {/* Create Category Modal */}
      {showCreateCategory && (
        <CreateCategoryModal onClose={() => setShowCreateCategory(false)} />
      )}
    </div>
  );
}
