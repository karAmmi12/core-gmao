/**
 * Script pour générer des données de test pour les tests de performance
 * Usage: npx tsx scripts/load-test-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function generateTestData() {
  console.log('📦 Génération de données de test pour les performances...\n');

  // Créer 50 work orders supplémentaires pour tester la pagination
  console.log('🔧 Création de 50 work orders...');
  
  const assets = await prisma.asset.findMany({ take: 10 });
  const technicians = await prisma.technician.findMany({ take: 3 });
  
  if (assets.length === 0 || technicians.length === 0) {
    console.error('❌ Pas assez de données de base. Lancez d\'abord: npm run seed');
    process.exit(1);
  }

  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];
  const types = ['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE'];

  for (let i = 0; i < 50; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const technician = technicians[Math.floor(Math.random() * technicians.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const type = types[Math.floor(Math.random() * types.length)] as any;

    const workOrder = await prisma.workOrder.create({
      data: {
        id: randomUUID(),
        title: `Test Performance WO ${i + 1}`,
        description: `Work order de test pour valider les performances - #${i + 1}`,
        status,
        priority,
        type,
        assetId: asset.id,
        assignedToId: technician.id,
        scheduledAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });

    // Ajouter 3-5 pièces par work order pour tester le N+1
    const parts = await prisma.part.findMany({ take: 5 });
    const numParts = 3 + Math.floor(Math.random() * 3);
    
    for (let j = 0; j < numParts; j++) {
      const part = parts[Math.floor(Math.random() * parts.length)];
      const qty = 1 + Math.floor(Math.random() * 5);
      await prisma.workOrderPart.create({
        data: {
          id: randomUUID(),
          workOrderId: workOrder.id,
          partId: part.id,
          quantityPlanned: qty,
          quantityReserved: 0,
          quantityConsumed: 0,
          unitPrice: part.unitPrice,
          totalPrice: part.unitPrice * qty,
          status: 'REQUESTED',
        },
      });
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ ${i + 1}/50 work orders créés`);
    }
  }

  const totalWorkOrders = await prisma.workOrder.count();
  const totalParts = await prisma.workOrderPart.count();

  console.log('\n✅ Données de test générées:');
  console.log(`  • ${totalWorkOrders} work orders au total`);
  console.log(`  • ${totalParts} pièces associées`);
  console.log(`\n💡 Vous pouvez maintenant lancer les tests de performance:`);
  console.log(`   npx tsx scripts/performance-test.ts`);
}

generateTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
