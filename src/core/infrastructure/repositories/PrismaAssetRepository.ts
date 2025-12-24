import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { Asset, AssetStatus } from "@/core/domain/entities/Asset";
import { prisma } from "@/lib/prisma";

export class PrismaAssetRepository implements AssetRepository {
  
  async save(asset: Asset): Promise<void> {
    await prisma.asset.create({
      data: {
        id: asset.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
        status: asset.status,
        createdAt: asset.createdAt,
      },
    });
  }

  async findAll(): Promise<Asset[]> {
    const rawAssets = await prisma.asset.findMany();
    // On convertit les données brutes de Prisma en Entités du Domaine
    return rawAssets.map((raw) => 
      Asset.restore(raw.id, raw.name, raw.serialNumber, raw.status as AssetStatus, raw.createdAt)
    );
  }
  async findById(id: string): Promise<Asset | null> {
    const raw = await prisma.asset.findUnique({ where: { id } });
    if (!raw) return null;

    return Asset.restore(
      raw.id, 
      raw.name, 
      raw.serialNumber, 
      raw.status as AssetStatus, 
      raw.createdAt
    );
  }

  async getStats() {
    // Prisma permet de faire des requêtes groupées pour aller vite
    const [total, running, stopped, broken] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'RUNNING' } }),
      prisma.asset.count({ where: { status: 'STOPPED' } }),
      prisma.asset.count({ where: { status: 'BROKEN' } }), // Assurez-vous d'avoir ce status ou 'MAINTENANCE' selon votre enum
    ]);

    return { total, running, stopped, broken };
  }
}