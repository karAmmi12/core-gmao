import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Données de référence pour la génération
const machineTypes = [
  { prefix: 'CNC', names: ['Tour CNC Mazak', 'Fraiseuse Fanuc', 'Centre d\'usinage DMG', 'Tour vertical Mori Seiki'], manufacturers: ['Mazak', 'Fanuc', 'DMG Mori', 'Okuma'] },
  { prefix: 'PRS', names: ['Presse hydraulique', 'Presse plieuse', 'Presse à injection', 'Presse mécanique'], manufacturers: ['Schuler', 'Amada', 'Arburg', 'Bystronic'] },
  { prefix: 'RBT', names: ['Robot de soudure', 'Robot d\'assemblage', 'Robot de peinture', 'Robot de manutention'], manufacturers: ['Kuka', 'ABB', 'Fanuc', 'Yaskawa'] },
  { prefix: 'CNV', names: ['Convoyeur à bande', 'Convoyeur à rouleaux', 'Convoyeur modulaire', 'Table tournante'], manufacturers: ['Interroll', 'Siemens', 'FlexLink', 'Bosch Rexroth'] },
  { prefix: 'LAS', names: ['Découpe laser', 'Soudure laser', 'Gravure laser', 'Marquage laser'], manufacturers: ['Trumpf', 'Prima Power', 'Bystronic', 'Amada'] },
  { prefix: 'PMP', names: ['Pompe hydraulique', 'Pompe doseuse', 'Pompe centrifuge', 'Groupe hydraulique'], manufacturers: ['Bosch Rexroth', 'Parker', 'Eaton', 'Danfoss'] },
];

const partCategories = {
  FILTRES: ['Filtre à huile hydraulique', 'Filtre à air comprimé', 'Filtre hydraulique haute pression', 'Filtre à carburant', 'Cartouche filtrante'],
  JOINTS: ['Joint torique NBR', 'Joint SPI', 'Joint plat', 'Joint de culasse', 'Kit joints hydrauliques'],
  ROULEMENTS: ['Roulement à billes', 'Roulement à rouleaux', 'Roulement à aiguilles', 'Palier auto-aligneur', 'Butée à billes'],
  COURROIES: ['Courroie trapézoïdale', 'Courroie crantée', 'Courroie plate', 'Courroie striée', 'Kit courroie distribution'],
  LUBRIFIANTS: ['Huile hydraulique', 'Graisse lithium', 'Huile moteur', 'Lubrifiant chaîne', 'Graisse haute température'],
  ELECTRICITE: ['Contacteur tripolaire', 'Relais thermique', 'Disjoncteur moteur', 'Variateur de fréquence', 'Automate programmable'],
  PNEUMATIQUE: ['Vérin pneumatique', 'Électrovanne', 'Manomètre', 'Filtre régulateur', 'Raccord rapide'],
  HYDRAULIQUE: ['Vérin hydraulique', 'Distributeur hydraulique', 'Flexible haute pression', 'Raccord hydraulique', 'Clapet anti-retour'],
  CAPTEURS: ['Capteur de proximité', 'Capteur de pression', 'Capteur de température', 'Encodeur rotatif', 'Cellule photoélectrique'],
  CONSOMMABLES: ['Electrode de soudure', 'Buse de découpe', 'Lame de scie', 'Meule abrasive', 'Foret HSS'],
};

const interventionTypes = [
  'Remplacement courroie de transmission',
  'Changement huile hydraulique',
  'Réparation capteur de position',
  'Calibration automate programmable',
  'Nettoyage circuit de refroidissement',
  'Remplacement roulement à billes',
  'Vérification paramètres de sécurité',
  'Réparation fuite pneumatique',
  'Changement filtre à air',
  'Mise à jour logiciel contrôle',
  'Graissage paliers et axes',
  'Contrôle tension courroies',
  'Changement vérin hydraulique',
  'Réparation système électrique',
  'Alignement laser des axes',
  'Remplacement joint d\'étanchéité',
  'Contrôle niveau huile',
  'Test fonctionnel complet',
  'Remplacement variateur de fréquence',
  'Nettoyage filtres hydrauliques',
];

// Structure hiérarchique : Site > Bâtiment > Ligne > Machines > Composants
async function main() {
  console.log('🌱 Début du seed de la base de données GMAO complète...\n');

  // Nettoyer les données existantes
  console.log('🗑️  Suppression des données existantes...');
  // PostgreSQL gère automatiquement les foreign keys, pas besoin de PRAGMA
  await prisma.maintenanceSchedule.deleteMany();
  await prisma.partRequest.deleteMany();
  await prisma.workOrderPart.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.part.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.configurationItem.deleteMany();
  await prisma.configurationCategory.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Données existantes supprimées\n');

  // 0. CRÉER LES CATÉGORIES DE CONFIGURATION
  console.log('⚙️  Création des catégories de configuration...\n');

  const assetTypeCategory = await prisma.configurationCategory.create({
    data: {
      id: uuidv4(),
      code: 'ASSET_TYPE',
      name: 'Types d\'équipements',
      description: 'Catégories de machines et équipements',
      isActive: true,
    },
  });

  const assetTypes = [
    { code: 'CNC', label: 'Machine CNC', color: '#3B82F6', icon: '🔧' },
    { code: 'PRESS', label: 'Presse', color: '#EF4444', icon: '⚡' },
    { code: 'ROBOT', label: 'Robot', color: '#8B5CF6', icon: '🤖' },
    { code: 'CONVEYOR', label: 'Convoyeur', color: '#10B981', icon: '📦' },
    { code: 'LASER', label: 'Laser', color: '#F59E0B', icon: '🔥' },
    { code: 'PUMP', label: 'Pompe', color: '#06B6D4', icon: '💧' },
  ];

  for (const type of assetTypes) {
    await prisma.configurationItem.create({
      data: {
        id: uuidv4(),
        categoryId: assetTypeCategory.id,
        code: type.code,
        label: type.label,
        color: type.color,
        icon: type.icon,
        isActive: true,
        sortOrder: 0,
      },
    });
  }
  console.log(`  ✓ Catégorie ${assetTypeCategory.name} avec ${assetTypes.length} items`);

  const partCategoryConfig = await prisma.configurationCategory.create({
    data: {
      id: uuidv4(),
      code: 'PART_CATEGORY',
      name: 'Catégories de pièces',
      description: 'Classification des pièces détachées',
      isActive: true,
    },
  });

  const partCats = [
    { code: 'FILTERS', label: 'Filtres', color: '#3B82F6' },
    { code: 'SEALS', label: 'Joints', color: '#EF4444' },
    { code: 'BEARINGS', label: 'Roulements', color: '#8B5CF6' },
    { code: 'BELTS', label: 'Courroies', color: '#10B981' },
    { code: 'LUBRICANTS', label: 'Lubrifiants', color: '#F59E0B' },
    { code: 'ELECTRICAL', label: 'Électricité', color: '#06B6D4' },
    { code: 'PNEUMATIC', label: 'Pneumatique', color: '#EC4899' },
    { code: 'HYDRAULIC', label: 'Hydraulique', color: '#F97316' },
    { code: 'SENSORS', label: 'Capteurs', color: '#14B8A6' },
    { code: 'CONSUMABLES', label: 'Consommables', color: '#6366F1' },
  ];

  for (const cat of partCats) {
    await prisma.configurationItem.create({
      data: {
        id: uuidv4(),
        categoryId: partCategoryConfig.id,
        code: cat.code,
        label: cat.label,
        color: cat.color,
        isActive: true,
        sortOrder: 0,
      },
    });
  }
  console.log(`  ✓ Catégorie ${partCategoryConfig.name} avec ${partCats.length} items`);

  const skillCategory = await prisma.configurationCategory.create({
    data: {
      id: uuidv4(),
      code: 'TECHNICIAN_SKILL',
      name: 'Compétences techniciens',
      description: 'Compétences et spécialités des techniciens',
      isActive: true,
    },
  });

  const skills = [
    { code: 'MECHANICS', label: 'Mécanique', color: '#3B82F6' },
    { code: 'ELECTRONICS', label: 'Électronique', color: '#EF4444' },
    { code: 'HYDRAULICS', label: 'Hydraulique', color: '#06B6D4' },
    { code: 'PNEUMATICS', label: 'Pneumatique', color: '#8B5CF6' },
    { code: 'AUTOMATION', label: 'Automatisme', color: '#10B981' },
    { code: 'ROBOTICS', label: 'Robotique', color: '#F59E0B' },
  ];

  for (const skill of skills) {
    await prisma.configurationItem.create({
      data: {
        id: uuidv4(),
        categoryId: skillCategory.id,
        code: skill.code,
        label: skill.label,
        color: skill.color,
        isActive: true,
        sortOrder: 0,
      },
    });
  }
  console.log(`  ✓ Catégorie ${skillCategory.name} avec ${skills.length} items`);

  console.log(`\n✅ ${assetTypes.length + partCats.length + skills.length} items de configuration créés\n`);

  // 1. CRÉER LES UTILISATEURS
  console.log('👥 Création des utilisateurs...\n');

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const managerPassword = await bcrypt.hash('Manager123!', 12);
  const techPassword = await bcrypt.hash('Tech123!', 12);
  const stockPassword = await bcrypt.hash('Stock123!', 12);

  const userAdmin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@gmao.local',
      name: 'Admin Système',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log(`  ✓ ${userAdmin.name} (${userAdmin.role})`);

  const userManager = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'manager@gmao.local',
      name: 'Pierre Durand',
      password: managerPassword,
      role: 'MANAGER',
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log(`  ✓ ${userManager.name} (${userManager.role})`);

  // Créer plusieurs utilisateurs techniciens
  const userTechniciens = [];
  const techNames = [
    { name: 'Jean Dupont', email: 'tech1@gmao.local' },
    { name: 'Marie Martin', email: 'tech2@gmao.local' },
    { name: 'Luc Bernard', email: 'tech3@gmao.local' },
    { name: 'Sophie Leroy', email: 'tech4@gmao.local' },
    { name: 'Paul Mercier', email: 'tech5@gmao.local' },
    { name: 'Julie Moreau', email: 'tech6@gmao.local' },
  ];

  for (const tech of techNames) {
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: tech.email,
        name: tech.name,
        password: techPassword,
        role: 'TECHNICIAN',
        isActive: true,
        mustChangePassword: false,
      },
    });
    userTechniciens.push(user);
    console.log(`  ✓ ${user.name} (${user.role})`);
  }

  const userStock = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'stock@gmao.local',
      name: 'Claire Dubois',
      password: stockPassword,
      role: 'STOCK_MANAGER',
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log(`  ✓ ${userStock.name} (${userStock.role})`);

  console.log(`\n✅ ${2 + userTechniciens.length + 1} utilisateurs créés\n`);

  // 1. CRÉER LES TECHNICIENS
  console.log('👷 Création des techniciens...\n');
  
  const skillSets = [
    ['Mécanique', 'Hydraulique', 'Pneumatique'],
    ['Électricité', 'Automatisme', 'Informatique industrielle'],
    ['Soudure', 'Usinage', 'Mécanique'],
    ['Électricité', 'Hydraulique', 'Pneumatique'],
    ['CNC', 'Programmation', 'Usinage'],
    ['Robotique', 'Automatisme', 'Vision industrielle'],
    ['Maintenance préventive', 'Diagnostic', 'Mécanique'],
    ['Électronique', 'Automatisme', 'Réseaux industriels'],
  ];

  const techniciens = [];
  for (let i = 0; i < 8; i++) {
    const tech = await prisma.technician.create({
      data: {
        id: uuidv4(),
        name: i < techNames.length ? techNames[i].name : `Technicien ${i + 1}`,
        email: i < techNames.length ? techNames[i].email.replace('@gmao.local', '@example.com') : `tech${i + 1}@example.com`,
        phone: `+33 6 ${10 + i}${20 + i} ${30 + i}${40 + i} ${50 + i}${60 + i}`,
        skills: JSON.stringify(skillSets[i] || ['Maintenance générale']),
        isActive: true,
        createdAt: new Date(),
      },
    });
    techniciens.push(tech);
    console.log(`  ✓ ${tech.name} - ${(skillSets[i] || []).join(', ')}`);
  }

  console.log(`\n✅ ${techniciens.length} techniciens créés\n`);

  // Lier les utilisateurs techniciens avec leurs profils
  console.log('🔗 Liaison des utilisateurs avec les techniciens...\n');
  
  for (let i = 0; i < Math.min(userTechniciens.length, techniciens.length); i++) {
    await prisma.user.update({
      where: { id: userTechniciens[i].id },
      data: { technicianId: techniciens[i].id },
    });
    console.log(`  ✓ ${userTechniciens[i].name} lié au technicien ${techniciens[i].id}`);
  }

  console.log('\n✅ Utilisateurs techniciens liés à leurs profils\n');

  // 2. CRÉER LA STRUCTURE HIÉRARCHIQUE COMPLÈTE
  console.log('🏭 Création de la structure hiérarchique étendue...\n');
  
  // Créer 3 sites
  const sites = [];
  for (let i = 0; i < 3; i++) {
    const site = await prisma.asset.create({
      data: {
        id: uuidv4(),
        name: `Site de Production ${i === 0 ? 'Principal' : i === 1 ? 'Nord' : 'Sud'}`,
        serialNumber: `SITE-00${i + 1}`,
        status: 'RUNNING',
        assetType: 'SITE',
        location: i === 0 ? 'Zone Industrielle Nord' : i === 1 ? 'Parc Technologique' : 'Zone Industrielle Sud',
        createdAt: new Date(),
      },
    });
    sites.push(site);
    console.log(`✓ Site: ${site.name}`);
  }

  // Pour chaque site, créer des bâtiments
  const batiments = [];
  const lignes = [];
  const machines: any[] = [];

  for (let siteIdx = 0; siteIdx < sites.length; siteIdx++) {
    const numBatiments = siteIdx === 0 ? 4 : 2; // Plus de bâtiments sur le site principal
    
    for (let batIdx = 0; batIdx < numBatiments; batIdx++) {
      const batTypes = ['Usinage', 'Assemblage', 'Peinture', 'Logistique', 'Maintenance'];
      const batiment = await prisma.asset.create({
        data: {
          id: uuidv4(),
          name: `Bâtiment ${String.fromCharCode(65 + batIdx)} - ${batTypes[batIdx % batTypes.length]}`,
          serialNumber: `BAT-${String.fromCharCode(65 + siteIdx)}${String.fromCharCode(65 + batIdx)}-001`,
          status: 'RUNNING',
          assetType: 'BUILDING',
          location: `Entrée ${['Nord', 'Sud', 'Est', 'Ouest'][batIdx % 4]}`,
          parentId: sites[siteIdx].id,
          createdAt: new Date(),
        },
      });
      batiments.push(batiment);
      console.log(`  ✓ Bâtiment: ${batiment.name} (Site ${siteIdx + 1})`);

      // Pour chaque bâtiment, créer des lignes
      const numLignes = batIdx < 2 ? 3 : 2; // Plus de lignes dans les premiers bâtiments
      
      for (let ligneIdx = 0; ligneIdx < numLignes; ligneIdx++) {
        const ligneTypes = ['CNC', 'Presses', 'Assemblage Robotisé', 'Soudure', 'Traitement de surface'];
        const ligne = await prisma.asset.create({
          data: {
            id: uuidv4(),
            name: `Ligne de Production ${siteIdx * 10 + batIdx * 3 + ligneIdx + 1} - ${ligneTypes[ligneIdx % ligneTypes.length]}`,
            serialNumber: `LINE-${String.fromCharCode(65 + siteIdx)}${batIdx}${ligneIdx}`,
            status: Math.random() > 0.1 ? 'RUNNING' : 'STOPPED',
            assetType: 'LINE',
            location: `Atelier ${String.fromCharCode(65 + batIdx)}${ligneIdx + 1}`,
            parentId: batiment.id,
            createdAt: new Date(),
          },
        });
        lignes.push(ligne);
        console.log(`    ✓ Ligne: ${ligne.name}`);

        // Pour chaque ligne, créer des machines
        const numMachines = Math.floor(Math.random() * 4) + 4; // 4 à 7 machines par ligne
        
        for (let machIdx = 0; machIdx < numMachines; machIdx++) {
          const machineType = machineTypes[Math.floor(Math.random() * machineTypes.length)];
          const machineName = machineType.names[Math.floor(Math.random() * machineType.names.length)];
          const manufacturer = machineType.manufacturers[Math.floor(Math.random() * machineType.manufacturers.length)];
          
          // Générer un numéro de série unique basé sur l'index global
          const globalMachineIndex = machines.length + 1;
          
          const machine = await prisma.asset.create({
            data: {
              id: uuidv4(),
              name: `${machineName} ${manufacturer}`,
              serialNumber: `${machineType.prefix}-${2020 + Math.floor(Math.random() * 5)}-${String(globalMachineIndex).padStart(4, '0')}`,
              status: Math.random() > 0.15 ? 'RUNNING' : Math.random() > 0.5 ? 'STOPPED' : 'BROKEN',
              assetType: 'MACHINE',
              location: `Poste ${ligneIdx + 1}-${String.fromCharCode(65 + machIdx)}`,
              manufacturer: manufacturer,
              modelNumber: `${manufacturer.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
              parentId: ligne.id,
              createdAt: new Date(),
            },
          });
          machines.push(machine);
        }
      }
    }
  }

  console.log(`\n✅ Structure créée: ${sites.length} sites, ${batiments.length} bâtiments, ${lignes.length} lignes, ${machines.length} machines\n`);

  // 3. CRÉER DES COMPOSANTS pour un échantillon de machines
  console.log('🔩 Création des composants...\n');
  
  const componentTypes = [
    'Moteur électrique', 'Broche', 'Vérin hydraulique', 'Pompe', 'Variateur',
    'Capteur de position', 'Encodeur', 'Servomoteur', 'Réducteur', 'Transformateur'
  ];
  
  let componentCount = 0;
  const sampleMachines = machines.slice(0, Math.min(30, machines.length));
  
  for (const machine of sampleMachines) {
    const numComponents = Math.floor(Math.random() * 3) + 1; // 1 à 3 composants
    
    for (let i = 0; i < numComponents; i++) {
      const componentType = componentTypes[Math.floor(Math.random() * componentTypes.length)];
      await prisma.asset.create({
        data: {
          id: uuidv4(),
          name: `${componentType} ${i + 1}`,
          serialNumber: `CMP-${machine.serialNumber}-${String(i + 1).padStart(2, '0')}`,
          status: Math.random() > 0.1 ? 'RUNNING' : 'BROKEN',
          assetType: 'COMPONENT',
          manufacturer: ['Siemens', 'Bosch', 'ABB', 'Schneider', 'Parker'][Math.floor(Math.random() * 5)],
          modelNumber: `MOD-${Math.floor(Math.random() * 9000) + 1000}`,
          parentId: machine.id,
          createdAt: new Date(),
        },
      });
      componentCount++;
    }
  }
  
  console.log(`✅ ${componentCount} composants créés\n`);

  // 4. CRÉER UN GRAND NOMBRE DE PIÈCES DÉTACHÉES
  console.log('📦 Création d\'un large inventaire de pièces...\n');

  const parts = [];
  let partCounter = 1;
  const suppliers = ['Hydro Parts SA', 'SKF France', 'Gates Europe', 'Schneider Electric', 'Bosch Rexroth', 'Parker Hannifin', 'Festo', 'Siemens Industry', 'Total Lubrifiants', 'Endress+Hauser'];

  for (const [category, partNames] of Object.entries(partCategories)) {
    for (let i = 0; i < partNames.length; i++) {
      const partName = partNames[i];
      const numVariants = Math.floor(Math.random() * 4) + 2; // 2 à 5 variantes par type
      
      for (let v = 0; v < numVariants; v++) {
        const stock = Math.floor(Math.random() * 50);
        const minStock = Math.floor(Math.random() * 15) + 5;
        
        const part = await prisma.part.create({
          data: {
            id: uuidv4(),
            reference: `${category.substring(0, 3)}-${String(partCounter).padStart(4, '0')}`,
            name: `${partName} ${v > 0 ? `variant ${v + 1}` : ''}`,
            description: `${partName} - Spécification ${v + 1}`,
            category: category,
            unitPrice: Math.round((10 + Math.random() * 200) * 100) / 100,
            quantityInStock: stock,
            minStockLevel: minStock,
            supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
            supplierRef: `SUP-${Math.floor(Math.random() * 90000) + 10000}`,
            location: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        parts.push(part);
        partCounter++;
      }
    }
  }

  console.log(`✅ ${parts.length} pièces créées\n`);

  // 5. CRÉER DES MOUVEMENTS DE STOCK
  console.log('📝 Création des mouvements de stock...\n');

  let stockMovementCount = 0;
  const movementTypes: Array<'IN' | 'OUT' | 'ADJUSTMENT'> = ['IN', 'OUT', 'ADJUSTMENT'];
  const movementReasons = {
    IN: ['Réception commande', 'Retour intervention', 'Ajustement inventaire', 'Transfert interne'],
    OUT: ['Utilisation intervention', 'Casse', 'Prêt externe', 'Retour fournisseur'],
    ADJUSTMENT: ['Correction inventaire', 'Recomptage', 'Régularisation'],
  };

  for (const part of parts.slice(0, Math.min(100, parts.length))) {
    const numMovements = Math.floor(Math.random() * 5) + 1; // 1 à 5 mouvements
    
    for (let i = 0; i < numMovements; i++) {
      const movType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      const reasons = movementReasons[movType];
      
      await prisma.stockMovement.create({
        data: {
          id: uuidv4(),
          partId: part.id,
          type: movType,
          quantity: Math.floor(Math.random() * 10) + 1,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          reference: `REF-${Math.floor(Math.random() * 90000) + 10000}`,
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Dans les 90 derniers jours
        },
      });
      stockMovementCount++;
    }
  }

  console.log(`✅ ${stockMovementCount} mouvements de stock créés\n`);

  // 6. CRÉER DES INTERVENTIONS (WORK ORDERS)
  console.log('🔧 Création des interventions...\n');

  let workOrderCount = 0;
  
  for (const machine of machines) {
    const numInterventions = Math.floor(Math.random() * 5) + 2; // 2 à 6 interventions par machine

    for (let i = 0; i < numInterventions; i++) {
      const randomTitle = interventionTypes[Math.floor(Math.random() * interventionTypes.length)];
      
      const statusOptions: Array<'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'> = [
        'DRAFT', 'PLANNED', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED'
      ];
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const randomPriority = Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.3 ? 'MEDIUM' : 'LOW';
      const randomType = Math.random() > 0.3 ? 'CORRECTIVE' : 'PREVENTIVE';
      
      const assignTech = Math.random() > 0.2;
      const randomTech = techniciens[Math.floor(Math.random() * techniciens.length)];
      
      let scheduledDate: Date | undefined;
      let startedDate: Date | undefined;
      let completedDate: Date | undefined;
      const estimatedDuration = 30 + Math.floor(Math.random() * 240); // 30-270 minutes
      
      if (randomStatus !== 'DRAFT') {
        const daysOffset = randomStatus === 'COMPLETED' ? -Math.random() * 60 : Math.random() * 30;
        scheduledDate = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
      }
      
      if (randomStatus === 'IN_PROGRESS' || randomStatus === 'COMPLETED') {
        startedDate = new Date(scheduledDate!.getTime() + Math.random() * 120 * 60 * 1000);
      }
      
      if (randomStatus === 'COMPLETED') {
        completedDate = new Date(startedDate!.getTime() + estimatedDuration * 60 * 1000 + Math.random() * 60 * 60 * 1000);
      }

      await prisma.workOrder.create({
        data: {
          id: uuidv4(),
          title: randomTitle,
          description: `${randomTitle} sur ${machine.name}\n\nDétails de l'intervention à réaliser...`,
          status: randomStatus,
          priority: randomPriority,
          type: randomType,
          assetId: machine.id,
          assignedToId: assignTech ? randomTech.id : null,
          scheduledAt: scheduledDate,
          startedAt: startedDate,
          completedAt: completedDate,
          estimatedDuration: scheduledDate ? estimatedDuration : null,
          actualDuration: completedDate ? estimatedDuration + Math.floor(Math.random() * 120) - 60 : null,
          laborCost: completedDate ? 40 + Math.random() * 300 : 0,
          materialCost: completedDate ? Math.random() * 500 : 0,
          totalCost: 0,
          createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        },
      });
      workOrderCount++;
    }
  }

  console.log(`✅ ${workOrderCount} interventions créées\n`);

  // 7. CRÉER DES MAINTENANCES PRÉVENTIVES
  console.log('🔄 Création des maintenances préventives...\n');

  let maintenanceCount = 0;
  const maintenanceTasks = [
    'Graissage mensuel',
    'Contrôle semestriel général',
    'Vérification trimestrielle sécurité',
    'Remplacement annuel filtres',
    'Inspection mensuelle circuits',
    'Contrôle hebdomadaire niveaux',
    'Révision annuelle complète',
  ];

  for (const machine of machines.slice(0, Math.min(machines.length, 80))) {
    const numSchedules = Math.floor(Math.random() * 3) + 1; // 1 à 3 maintenances préventives
    
    for (let i = 0; i < numSchedules; i++) {
      const task = maintenanceTasks[Math.floor(Math.random() * maintenanceTasks.length)];
      const triggerType = Math.random() > 0.3 ? 'TIME_BASED' : 'USAGE_BASED';
      const frequency = triggerType === 'TIME_BASED' 
        ? `${Math.floor(Math.random() * 180) + 30}d`  // 30-210 jours
        : `${Math.floor(Math.random() * 1000) + 100}h`; // 100-1100 heures
      
      const nextDue = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      
      await prisma.maintenanceSchedule.create({
        data: {
          id: uuidv4(),
          title: task,
          description: `Maintenance préventive: ${task} pour ${machine.name}`,
          assetId: machine.id,
          assignedToId: techniciens[Math.floor(Math.random() * techniciens.length)].id,
          frequency: frequency,
          triggerType: triggerType,
          nextDueDate: nextDue,
          estimatedDuration: 60 + Math.floor(Math.random() * 180),
          isActive: Math.random() > 0.1,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        },
      });
      maintenanceCount++;
    }
  }

  console.log(`✅ ${maintenanceCount} plannings de maintenance créés\n`);

  // 8. CRÉER DES DEMANDES DE PIÈCES
  console.log('📋 Création des demandes de pièces...\n');

  const workOrders = await prisma.workOrder.findMany({ take: 50 });
  const urgencyLevels: Array<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'> = ['LOW', 'NORMAL', 'NORMAL', 'HIGH', 'CRITICAL'];
  const statuses: Array<'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED'> = ['PENDING', 'PENDING', 'APPROVED', 'DELIVERED', 'DELIVERED', 'REJECTED', 'CANCELLED'];
  
  let partRequestCount = 0;

  for (let i = 0; i < Math.min(120, parts.length); i++) {
    const part = parts[Math.floor(Math.random() * parts.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
    const requestedBy = userTechniciens[Math.floor(Math.random() * userTechniciens.length)];
    const workOrder = workOrders[Math.floor(Math.random() * workOrders.length)];
    
    const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    let approvedAt: Date | undefined;
    let deliveredAt: Date | undefined;
    let approvedById: string | undefined;
    let deliveredById: string | undefined;
    let notes: string | undefined;
    let rejectionReason: string | undefined;
    
    if (status !== 'PENDING') {
      approvedAt = new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      approvedById = userManager.id;
    }
    
    if (status === 'DELIVERED') {
      deliveredAt = new Date(approvedAt!.getTime() + Math.random() * 48 * 60 * 60 * 1000);
      deliveredById = userStock.id;
      notes = 'Livré et installé';
    }
    
    if (status === 'REJECTED') {
      rejectionReason = 'Stock insuffisant' + (Math.random() > 0.5 ? ' - commande fournisseur en cours' : ' - pièce obsolète');
    }
    
    await prisma.partRequest.create({
      data: {
        id: uuidv4(),
        partId: part.id,
        quantity: Math.floor(Math.random() * 10) + 1,
        requestedById: requestedBy.id,
        reason: `Demande pour ${workOrder?.title || 'intervention'}`,
        urgency: urgency,
        workOrderId: Math.random() > 0.3 ? workOrder?.id : null,
        assetId: workOrder?.assetId,
        status: status,
        approvedById: approvedById,
        approvedAt: approvedAt,
        deliveredById: deliveredById,
        deliveredAt: deliveredAt,
        notes: notes,
        rejectionReason: rejectionReason,
        createdAt: createdDate,
      },
    });
    partRequestCount++;
  }

  console.log(`✅ ${partRequestCount} demandes de pièces créées\n`);

  // RÉSUMÉ FINAL
  const totalAssets = await prisma.asset.count();
  const totalWorkOrders = await prisma.workOrder.count();
  const totalMaintenanceSchedules = await prisma.maintenanceSchedule.count();
  const totalParts = await prisma.part.count();
  const totalStockMovements = await prisma.stockMovement.count();
  const totalPartRequests = await prisma.partRequest.count();
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RÉSUMÉ COMPLET DU SEED GMAO:');
  console.log('='.repeat(70));
  console.log(`  👥 Utilisateurs: ${2 + userTechniciens.length + 1} (1 Admin, 1 Manager, ${userTechniciens.length} Techniciens, 1 Stock)`);
  console.log(`  👷 Techniciens: ${techniciens.length}`);
  console.log(`  🏭 Assets totaux: ${totalAssets}`);
  console.log(`     • ${sites.length} Sites`);
  console.log(`     • ${batiments.length} Bâtiments`);
  console.log(`     • ${lignes.length} Lignes de production`);
  console.log(`     • ${machines.length} Machines`);
  console.log(`     • ${componentCount} Composants`);
  console.log(`  🔧 Interventions: ${totalWorkOrders}`);
  console.log(`  🔄 Maintenances préventives: ${totalMaintenanceSchedules}`);
  console.log(`  📦 Pièces détachées: ${totalParts}`);
  console.log(`  📝 Mouvements de stock: ${totalStockMovements}`);
  console.log(`  📋 Demandes de pièces: ${totalPartRequests}`);
  console.log('='.repeat(70));
  console.log('\n🔐 COMPTES DE TEST:');
  console.log('  • admin@gmao.local / Admin123!     (Administrateur)');
  console.log('  • manager@gmao.local / Manager123! (Manager)');
  console.log('  • tech1@gmao.local / Tech123!      (Technicien 1 - Jean Dupont)');
  console.log('  • tech2@gmao.local / Tech123!      (Technicien 2 - Marie Martin)');
  console.log('  • tech3@gmao.local / Tech123!      (Technicien 3 - Luc Bernard)');
  console.log('  • tech4@gmao.local / Tech123!      (Technicien 4 - Sophie Leroy)');
  console.log('  • tech5@gmao.local / Tech123!      (Technicien 5 - Paul Mercier)');
  console.log('  • tech6@gmao.local / Tech123!      (Technicien 6 - Julie Moreau)');
  console.log('  • stock@gmao.local / Stock123!     (Gestionnaire Stock)');
  console.log('='.repeat(70));
  
  console.log('\n🎉 Seed GMAO complet terminé avec succès!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
