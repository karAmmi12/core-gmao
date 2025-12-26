import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Structure hiérarchique : Site > Bâtiment > Ligne > Machines > Composants
async function main() {
  console.log('🌱 Début du seed de la base de données avec hiérarchie...\n');

  // Nettoyer les données existantes
  console.log('🗑️  Suppression des données existantes...');
  // Désactiver temporairement les contraintes FK pour SQLite
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  await prisma.stockMovement.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.part.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  console.log('✅ Données existantes supprimées\n');

  // 0. CRÉER LES TECHNICIENS
  console.log('👷 Création des techniciens...\n');
  
  const techniciens = [];
  
  const tech1 = await prisma.technician.create({
    data: {
      id: uuidv4(),
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '+33 6 12 34 56 78',
      skills: JSON.stringify(['Mécanique', 'Hydraulique', 'Pneumatique']),
      isActive: true,
      createdAt: new Date(),
    },
  });
  techniciens.push(tech1);
  console.log(`  ✓ ${tech1.name} - Mécanique, Hydraulique, Pneumatique`);

  const tech2 = await prisma.technician.create({
    data: {
      id: uuidv4(),
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      phone: '+33 6 23 45 67 89',
      skills: JSON.stringify(['Électricité', 'Automatisme', 'Informatique industrielle']),
      isActive: true,
      createdAt: new Date(),
    },
  });
  techniciens.push(tech2);
  console.log(`  ✓ ${tech2.name} - Électricité, Automatisme`);

  const tech3 = await prisma.technician.create({
    data: {
      id: uuidv4(),
      name: 'Pierre Bernard',
      email: 'pierre.bernard@example.com',
      phone: '+33 6 34 56 78 90',
      skills: JSON.stringify(['Soudure', 'Usinage', 'Mécanique']),
      isActive: true,
      createdAt: new Date(),
    },
  });
  techniciens.push(tech3);
  console.log(`  ✓ ${tech3.name} - Soudure, Usinage`);

  const tech4 = await prisma.technician.create({
    data: {
      id: uuidv4(),
      name: 'Sophie Leroy',
      email: 'sophie.leroy@example.com',
      phone: '+33 6 45 67 89 01',
      skills: JSON.stringify(['Électricité', 'Hydraulique', 'Pneumatique']),
      isActive: true,
      createdAt: new Date(),
    },
  });
  techniciens.push(tech4);
  console.log(`  ✓ ${tech4.name} - Électricité, Hydraulique`);

  console.log(`\n✅ ${techniciens.length} techniciens créés\n`);

  // 1. CRÉER LE SITE (racine)
  console.log('🏭 Création de la structure hiérarchique...\n');
  
  const site = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Site de Production Principal',
      serialNumber: 'SITE-001',
      status: 'RUNNING',
      assetType: 'SITE',
      location: 'Zone Industrielle Nord',
      createdAt: new Date(),
    },
  });
  console.log(`✓ Site: ${site.name}`);

  // 2. CRÉER LES BÂTIMENTS
  const batimentA = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Bâtiment A - Usinage',
      serialNumber: 'BAT-A-001',
      status: 'RUNNING',
      assetType: 'BUILDING',
      location: 'Entrée Nord',
      parentId: site.id,
      createdAt: new Date(),
    },
  });
  console.log(`  ✓ Bâtiment: ${batimentA.name}`);

  const batimentB = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Bâtiment B - Assemblage',
      serialNumber: 'BAT-B-001',
      status: 'RUNNING',
      assetType: 'BUILDING',
      location: 'Entrée Sud',
      parentId: site.id,
      createdAt: new Date(),
    },
  });
  console.log(`  ✓ Bâtiment: ${batimentB.name}`);

  // 3. CRÉER LES LIGNES DE PRODUCTION
  const ligne1 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Ligne de Production 1 - CNC',
      serialNumber: 'LINE-001',
      status: 'RUNNING',
      assetType: 'LINE',
      location: 'Atelier A1',
      parentId: batimentA.id,
      createdAt: new Date(),
    },
  });
  console.log(`    ✓ Ligne: ${ligne1.name}`);

  const ligne2 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Ligne de Production 2 - Presses',
      serialNumber: 'LINE-002',
      status: 'RUNNING',
      assetType: 'LINE',
      location: 'Atelier A2',
      parentId: batimentA.id,
      createdAt: new Date(),
    },
  });
  console.log(`    ✓ Ligne: ${ligne2.name}`);

  const ligne3 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Ligne d\'Assemblage Robotisée',
      serialNumber: 'LINE-003',
      status: 'RUNNING',
      assetType: 'LINE',
      location: 'Atelier B1',
      parentId: batimentB.id,
      createdAt: new Date(),
    },
  });
  console.log(`    ✓ Ligne: ${ligne3.name}`);

  // 4. CRÉER LES MACHINES (sous les lignes)
  const machines = [];
  
  // Machines Ligne 1 (CNC)
  const machine1 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Tour CNC Mazak Integrex',
      serialNumber: 'CNC-2023-045',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Poste 1-A',
      manufacturer: 'Mazak',
      modelNumber: 'Integrex i-400',
      parentId: ligne1.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine1);

  const machine2 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Fraiseuse Fanuc Robodrill',
      serialNumber: 'FR-2022-012',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Poste 1-B',
      manufacturer: 'Fanuc',
      modelNumber: 'Robodrill α-D21MiA5',
      parentId: ligne1.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine2);

  const machine3 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Machine de découpe laser Trumpf',
      serialNumber: 'LD-2023-078',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Poste 1-C',
      manufacturer: 'Trumpf',
      modelNumber: 'TruLaser 3030',
      parentId: ligne1.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine3);

  // Machines Ligne 2 (Presses)
  const machine4 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Presse Hydraulique HPP-500',
      serialNumber: 'PH-2024-001',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Poste 2-A',
      manufacturer: 'Schuler',
      modelNumber: 'HPP-500',
      parentId: ligne2.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine4);

  const machine5 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Presse plieuse hydraulique Amada',
      serialNumber: 'PP-2022-045',
      status: 'STOPPED',
      assetType: 'MACHINE',
      location: 'Poste 2-B',
      manufacturer: 'Amada',
      modelNumber: 'HFE M2 1003',
      parentId: ligne2.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine5);

  const machine6 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Presse à injection Arburg',
      serialNumber: 'PI-2024-008',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Poste 2-C',
      manufacturer: 'Arburg',
      modelNumber: '420C 1000-350',
      parentId: ligne2.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine6);

  // Machines Ligne 3 (Assemblage)
  const machine7 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Robot de soudure Kuka KR 16',
      serialNumber: 'RB-2023-067',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Cellule 3-1',
      manufacturer: 'Kuka',
      modelNumber: 'KR 16 R2010',
      parentId: ligne3.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine7);

  const machine8 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Convoyeur à bande modulaire',
      serialNumber: 'CV-2024-003',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Transport principal',
      manufacturer: 'Interroll',
      modelNumber: 'RollerDrive EC5000',
      parentId: ligne3.id,
      createdAt: new Date(),
    },
  });
  machines.push(machine8);

  console.log(`\n✅ ${machines.length} machines créées`);

  // 5. CRÉER DES COMPOSANTS (enfants de machines)
  console.log('\n🔩 Création des composants...');
  
  const composant1 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Moteur principal Siemens',
      serialNumber: 'MOTOR-CNC-001',
      status: 'RUNNING',
      assetType: 'COMPONENT',
      manufacturer: 'Siemens',
      modelNumber: '1LA7 133-4AA',
      parentId: machine1.id,
      createdAt: new Date(),
    },
  });
  console.log(`      ✓ Composant: ${composant1.name}`);

  const composant2 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Broche de fraisage NSK',
      serialNumber: 'SPINDLE-FR-001',
      status: 'RUNNING',
      assetType: 'COMPONENT',
      manufacturer: 'NSK',
      modelNumber: 'HMS100',
      parentId: machine2.id,
      createdAt: new Date(),
    },
  });
  console.log(`      ✓ Composant: ${composant2.name}`);

  const composant3 = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Vérin hydraulique principal',
      serialNumber: 'CYLINDER-PH-001',
      status: 'BROKEN',
      assetType: 'COMPONENT',
      manufacturer: 'Bosch Rexroth',
      modelNumber: 'CDT3',
      parentId: machine4.id,
      createdAt: new Date(),
    },
  });
  console.log(`      ✓ Composant: ${composant3.name}`);

  // 6. CRÉER DES ÉQUIPEMENTS UTILITAIRES (sous bâtiments)
  const compresseur = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Compresseur Atlas Copco GA75',
      serialNumber: 'AC-2021-089',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Salle des machines',
      manufacturer: 'Atlas Copco',
      modelNumber: 'GA 75 VSD+',
      parentId: batimentA.id,
      createdAt: new Date(),
    },
  });
  machines.push(compresseur);

  const cta = await prisma.asset.create({
    data: {
      id: uuidv4(),
      name: 'Centrale de traitement d\'air',
      serialNumber: 'CTA-2022-112',
      status: 'RUNNING',
      assetType: 'MACHINE',
      location: 'Toiture bâtiment B',
      manufacturer: 'France Air',
      modelNumber: 'CTA-450',
      parentId: batimentB.id,
      createdAt: new Date(),
    },
  });
  machines.push(cta);

  console.log('\n✅ Structure hiérarchique complète créée\n');

  // 7. CRÉER DES INTERVENTIONS
  console.log('🔧 Création des interventions...');
  
  const interventionTitles = [
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
  ];

  let workOrderCount = 0;
  const allAssets = [...machines, composant1, composant2, composant3];

  for (const asset of allAssets) {
    const numInterventions = Math.floor(Math.random() * 4) + 1; // 1 à 4 interventions

    for (let i = 0; i < numInterventions; i++) {
      const randomTitle = interventionTitles[Math.floor(Math.random() * interventionTitles.length)];
      
      // Mix de statuts avec planification
      const statusOptions: Array<'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'> = [
        'DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'
      ];
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const randomPriority = Math.random() > 0.6 ? 'HIGH' : 'LOW';
      
      // Assigner un technicien aléatoirement (70% assignés)
      const assignTech = Math.random() > 0.3;
      const randomTech = techniciens[Math.floor(Math.random() * techniciens.length)];
      
      // Pour les ordres planifiés/en cours/complétés, créer une date de planification
      let scheduledDate: Date | undefined;
      let startedDate: Date | undefined;
      let completedDate: Date | undefined;
      const estimatedDuration = 60 + Math.floor(Math.random() * 180); // 60-240 minutes
      
      if (randomStatus !== 'DRAFT') {
        // Date dans les 30 prochains jours
        scheduledDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      }
      
      if (randomStatus === 'IN_PROGRESS' || randomStatus === 'COMPLETED') {
        startedDate = new Date(scheduledDate!.getTime() + Math.random() * 60 * 60 * 1000);
      }
      
      if (randomStatus === 'COMPLETED') {
        completedDate = new Date(startedDate!.getTime() + estimatedDuration * 60 * 1000 + Math.random() * 60 * 60 * 1000);
      }

      await prisma.workOrder.create({
        data: {
          id: uuidv4(),
          title: randomTitle,
          description: `Intervention ${randomTitle.toLowerCase()} sur ${asset.name}`,
          status: randomStatus,
          priority: randomPriority,
          assetId: asset.id,
          assignedToId: assignTech ? randomTech.id : null,
          scheduledAt: scheduledDate,
          startedAt: startedDate,
          completedAt: completedDate,
          estimatedDuration: scheduledDate ? estimatedDuration : null,
          actualDuration: completedDate ? estimatedDuration + Math.floor(Math.random() * 60) : null,
          laborCost: completedDate ? 50 + Math.random() * 200 : 0,
          materialCost: completedDate ? Math.random() * 150 : 0,
          totalCost: 0, // Will be calculated
          createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        },
      });
      workOrderCount++;
    }
  }

  console.log(`✅ ${workOrderCount} interventions créées\n`);

  // RÉSUMÉ
  console.log('📊 Résumé de la hiérarchie:');
  console.log(`  • 1 Site`);
  console.log(`  • 2 Bâtiments`);
  console.log(`  • 3 Lignes de production`);
  console.log(`  • ${machines.length} Machines`);
  console.log(`  • 3 Composants`);
  console.log(`  • ${techniciens.length} Techniciens`);
  console.log(`  • ${workOrderCount} Interventions`);

  // 5. CRÉER LES PIÈCES DÉTACHÉES
  console.log('\n📦 Création des pièces détachées...\n');

  const parts = [];

  const partFiltre = await prisma.part.create({
    data: {
      id: uuidv4(),
      reference: 'FLT-001',
      name: 'Filtre à huile hydraulique',
      description: 'Filtre haute pression 10 microns',
      category: 'FILTRES',
      unitPrice: 45.50,
      quantityInStock: 12,
      minStockLevel: 5,
      supplier: 'Hydro Parts SA',
      supplierRef: 'HP-FLT-10M',
      location: 'A-12-03',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  parts.push(partFiltre);
  console.log(`  ✓ ${partFiltre.reference} - ${partFiltre.name} (Stock: ${partFiltre.quantityInStock})`);

  const partJoint = await prisma.part.create({
    data: {
      id: uuidv4(),
      reference: 'JNT-002',
      name: 'Joint torique NBR 50x3',
      description: 'Joint torique en caoutchouc nitrile',
      category: 'JOINTS',
      unitPrice: 3.20,
      quantityInStock: 45,
      minStockLevel: 20,
      supplier: 'Seals Direct',
      supplierRef: 'SD-NBR-50-3',
      location: 'B-05-12',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  parts.push(partJoint);
  console.log(`  ✓ ${partJoint.reference} - ${partJoint.name} (Stock: ${partJoint.quantityInStock})`);

  const partRoulement = await prisma.part.create({
    data: {
      id: uuidv4(),
      reference: 'RLT-003',
      name: 'Roulement à billes SKF 6205',
      description: 'Roulement rigide à billes, diamètre 25mm',
      category: 'ROULEMENTS',
      unitPrice: 28.90,
      quantityInStock: 3,
      minStockLevel: 8,
      supplier: 'SKF France',
      supplierRef: 'SKF-6205-2RS',
      location: 'A-08-15',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  parts.push(partRoulement);
  console.log(`  ✓ ${partRoulement.reference} - ${partRoulement.name} (Stock: ${partRoulement.quantityInStock}) ⚠️ STOCK BAS`);

  const partCourroie = await prisma.part.create({
    data: {
      id: uuidv4(),
      reference: 'CRR-004',
      name: 'Courroie trapézoïdale SPZ 1250',
      description: 'Courroie section SPZ, longueur 1250mm',
      category: 'COURROIES',
      unitPrice: 18.75,
      quantityInStock: 8,
      minStockLevel: 5,
      supplier: 'Gates Europe',
      supplierRef: 'GT-SPZ1250',
      location: 'C-02-08',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  parts.push(partCourroie);
  console.log(`  ✓ ${partCourroie.reference} - ${partCourroie.name} (Stock: ${partCourroie.quantityInStock})`);

  const partHuile = await prisma.part.create({
    data: {
      id: uuidv4(),
      reference: 'LUB-005',
      name: 'Huile hydraulique HV 46',
      description: 'Bidon 5L, huile haute viscosité',
      category: 'LUBRIFIANTS',
      unitPrice: 42.00,
      quantityInStock: 15,
      minStockLevel: 10,
      supplier: 'Total Lubrifiants',
      supplierRef: 'TL-HV46-5L',
      location: 'D-01-02',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  parts.push(partHuile);
  console.log(`  ✓ ${partHuile.reference} - ${partHuile.name} (Stock: ${partHuile.quantityInStock})`);

  const partContacteur = await prisma.part.create({
    data: {
      id: uuidv4(),
      reference: 'ELC-006',
      name: 'Contacteur tripolaire 18A',
      description: 'Contacteur Schneider LC1D18',
      category: 'ELECTRICITE',
      unitPrice: 65.50,
      quantityInStock: 0,
      minStockLevel: 3,
      supplier: 'Schneider Electric',
      supplierRef: 'LC1D18BD',
      location: 'E-03-05',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  parts.push(partContacteur);
  console.log(`  ✓ ${partContacteur.reference} - ${partContacteur.name} (Stock: ${partContacteur.quantityInStock}) ❌ RUPTURE`);

  // Créer quelques mouvements de stock
  console.log('\n📝 Création des mouvements de stock...\n');

  await prisma.stockMovement.create({
    data: {
      id: uuidv4(),
      partId: partFiltre.id,
      type: 'IN',
      quantity: 20,
      reason: 'Réception commande',
      reference: 'BC-2024-0012',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Il y a 15 jours
    },
  });

  await prisma.stockMovement.create({
    data: {
      id: uuidv4(),
      partId: partFiltre.id,
      type: 'OUT',
      quantity: 8,
      reason: 'Utilisation intervention',
      reference: 'Maintenances diverses',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
    },
  });

  await prisma.stockMovement.create({
    data: {
      id: uuidv4(),
      partId: partRoulement.id,
      type: 'OUT',
      quantity: 5,
      reason: 'Utilisation intervention',
      reference: 'Maintenance machine',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
    },
  });

  console.log(`  ✓ 3 mouvements de stock enregistrés`);

  console.log(`\n📦 ${parts.length} pièces créées`);
  
  console.log('\n🎉 Seed avec hiérarchie terminé avec succès!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
