// prisma/seed-configurations.ts
/**
 * Script de seed pour initialiser les configurations par défaut
 * Exécuter avec: npx tsx prisma/seed-configurations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedConfigurations() {
  console.log('🌱 Seeding configurations...');

  // 1. Compétences Techniciens
  const techSkillCategory = await prisma.configurationCategory.upsert({
    where: { code: 'TECHNICIAN_SKILL' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: 'TECHNICIAN_SKILL',
      name: 'Compétences Technicien',
      description: 'Domaines de compétence des techniciens de maintenance',
      isSystem: true,
      isActive: true,
      sortOrder: 1,
    },
  });

  const techSkills = [
    { code: 'ELECTRICAL', label: 'Électricité', color: '#f59e0b', icon: 'zap', sortOrder: 1 },
    { code: 'MECHANICAL', label: 'Mécanique', color: '#3b82f6', icon: 'wrench', sortOrder: 2 },
    { code: 'HYDRAULIC', label: 'Hydraulique', color: '#0ea5e9', icon: 'droplet', sortOrder: 3 },
    { code: 'PNEUMATIC', label: 'Pneumatique', color: '#06b6d4', icon: 'wind', sortOrder: 4 },
    { code: 'AUTOMATION', label: 'Automatisme', color: '#8b5cf6', icon: 'cpu', sortOrder: 5 },
    { code: 'HVAC', label: 'Climatisation', color: '#10b981', icon: 'thermometer', sortOrder: 6 },
  ];

  for (const skill of techSkills) {
    await prisma.configurationItem.upsert({
      where: {
        categoryId_code: {
          categoryId: techSkillCategory.id,
          code: skill.code,
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        categoryId: techSkillCategory.id,
        code: skill.code,
        label: skill.label,
        color: skill.color,
        icon: skill.icon,
        isDefault: skill.sortOrder === 1,
        isActive: true,
        sortOrder: skill.sortOrder,
      },
    });
  }

  console.log(`  ✓ ${techSkills.length} compétences technicien`);

  // 2. Types d'équipements
  const assetTypeCategory = await prisma.configurationCategory.upsert({
    where: { code: 'ASSET_TYPE' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: 'ASSET_TYPE',
      name: "Types d'Équipements",
      description: 'Catégories hiérarchiques des équipements',
      isSystem: true,
      isActive: true,
      sortOrder: 2,
    },
  });

  const assetTypes = [
    { code: 'SITE', label: 'Site', color: '#64748b', icon: 'building', sortOrder: 1 },
    { code: 'BUILDING', label: 'Bâtiment', color: '#475569', icon: 'home', sortOrder: 2 },
    { code: 'LINE', label: 'Ligne de Production', color: '#334155', icon: 'layout-grid', sortOrder: 3 },
    { code: 'MACHINE', label: 'Machine', color: '#3b82f6', icon: 'settings', sortOrder: 4 },
    { code: 'COMPONENT', label: 'Composant', color: '#6366f1', icon: 'component', sortOrder: 5 },
  ];

  for (const type of assetTypes) {
    await prisma.configurationItem.upsert({
      where: {
        categoryId_code: {
          categoryId: assetTypeCategory.id,
          code: type.code,
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        categoryId: assetTypeCategory.id,
        code: type.code,
        label: type.label,
        color: type.color,
        icon: type.icon,
        isDefault: type.code === 'MACHINE',
        isActive: true,
        sortOrder: type.sortOrder,
      },
    });
  }

  console.log(`  ✓ ${assetTypes.length} types d'équipements`);

  // 3. Types de maintenance
  const maintenanceTypeCategory = await prisma.configurationCategory.upsert({
    where: { code: 'MAINTENANCE_TYPE' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: 'MAINTENANCE_TYPE',
      name: 'Types de Maintenance',
      description: 'Classification des interventions de maintenance',
      isSystem: true,
      isActive: true,
      sortOrder: 3,
    },
  });

  const maintenanceTypes = [
    { code: 'PREVENTIVE', label: 'Préventive', color: '#10b981', icon: 'shield-check', sortOrder: 1 },
    { code: 'CORRECTIVE', label: 'Corrective', color: '#ef4444', icon: 'alert-circle', sortOrder: 2 },
    { code: 'PREDICTIVE', label: 'Prédictive', color: '#8b5cf6', icon: 'trending-up', sortOrder: 3 },
    { code: 'CONDITIONAL', label: 'Conditionnelle', color: '#f59e0b', icon: 'activity', sortOrder: 4 },
  ];

  for (const type of maintenanceTypes) {
    await prisma.configurationItem.upsert({
      where: {
        categoryId_code: {
          categoryId: maintenanceTypeCategory.id,
          code: type.code,
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        categoryId: maintenanceTypeCategory.id,
        code: type.code,
        label: type.label,
        color: type.color,
        icon: type.icon,
        isDefault: type.code === 'CORRECTIVE',
        isActive: true,
        sortOrder: type.sortOrder,
      },
    });
  }

  console.log(`  ✓ ${maintenanceTypes.length} types de maintenance`);

  // 4. Priorités
  const priorityCategory = await prisma.configurationCategory.upsert({
    where: { code: 'WORK_ORDER_PRIORITY' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: 'WORK_ORDER_PRIORITY',
      name: 'Priorités',
      description: "Niveaux de priorité pour les ordres de travail",
      isSystem: true,
      isActive: true,
      sortOrder: 4,
    },
  });

  const priorities = [
    { code: 'CRITICAL', label: 'Critique', color: '#dc2626', icon: 'alert-octagon', sortOrder: 1 },
    { code: 'HIGH', label: 'Haute', color: '#f59e0b', icon: 'alert-triangle', sortOrder: 2 },
    { code: 'MEDIUM', label: 'Moyenne', color: '#3b82f6', icon: 'info', sortOrder: 3 },
    { code: 'LOW', label: 'Basse', color: '#10b981', icon: 'check-circle', sortOrder: 4 },
  ];

  for (const priority of priorities) {
    await prisma.configurationItem.upsert({
      where: {
        categoryId_code: {
          categoryId: priorityCategory.id,
          code: priority.code,
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        categoryId: priorityCategory.id,
        code: priority.code,
        label: priority.label,
        color: priority.color,
        icon: priority.icon,
        isDefault: priority.code === 'MEDIUM',
        isActive: true,
        sortOrder: priority.sortOrder,
      },
    });
  }

  console.log(`  ✓ ${priorities.length} niveaux de priorité`);

  // 5. Catégories de pièces
  const partCategoryConfig = await prisma.configurationCategory.upsert({
    where: { code: 'PART_CATEGORY' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      code: 'PART_CATEGORY',
      name: 'Catégories de Pièces',
      description: 'Classification des pièces de rechange',
      isSystem: false,
      isActive: true,
      sortOrder: 5,
    },
  });

  const partCategories = [
    { code: 'FILTER', label: 'Filtres', color: '#06b6d4', icon: 'filter', sortOrder: 1 },
    { code: 'BEARING', label: 'Roulements', color: '#64748b', icon: 'circle', sortOrder: 2 },
    { code: 'SEAL', label: 'Joints', color: '#f59e0b', icon: 'hexagon', sortOrder: 3 },
    { code: 'BELT', label: 'Courroies', color: '#8b5cf6', icon: 'minus', sortOrder: 4 },
    { code: 'VALVE', label: 'Vannes', color: '#3b82f6', icon: 'toggle-right', sortOrder: 5 },
    { code: 'SENSOR', label: 'Capteurs', color: '#10b981', icon: 'radio', sortOrder: 6 },
    { code: 'CONSUMABLE', label: 'Consommables', color: '#ec4899', icon: 'droplets', sortOrder: 7 },
  ];

  for (const category of partCategories) {
    await prisma.configurationItem.upsert({
      where: {
        categoryId_code: {
          categoryId: partCategoryConfig.id,
          code: category.code,
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        categoryId: partCategoryConfig.id,
        code: category.code,
        label: category.label,
        color: category.color,
        icon: category.icon,
        isDefault: false,
        isActive: true,
        sortOrder: category.sortOrder,
      },
    });
  }

  console.log(`  ✓ ${partCategories.length} catégories de pièces`);

  console.log('✅ Configuration seed completed!');
}

seedConfigurations()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
