import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { Asset, AssetStatus, AssetType } from "@/core/domain/entities/Asset";
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
        parentId: asset.parentId,
        assetType: asset.assetType,
        location: asset.location,
        manufacturer: asset.manufacturer,
        modelNumber: asset.modelNumber,
      },
    });
  }

  async update(asset: Asset): Promise<void> {
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        name: asset.name,
        serialNumber: asset.serialNumber,
        status: asset.status,
        parentId: asset.parentId,
        assetType: asset.assetType,
        location: asset.location,
        manufacturer: asset.manufacturer,
        modelNumber: asset.modelNumber,
      },
    });
  }

  async findAll(): Promise<Asset[]> {
    const rawAssets = await prisma.asset.findMany({
      orderBy: { name: 'asc' }
    });
    // On convertit les données brutes de Prisma en Entités du Domaine
    return rawAssets.map((raw) => 
      Asset.restore(
        raw.id,
        raw.name,
        raw.serialNumber,
        raw.status as AssetStatus,
        raw.createdAt,
        raw.parentId ?? undefined,
        raw.assetType as AssetType,
        raw.location ?? undefined,
        raw.manufacturer ?? undefined,
        raw.modelNumber ?? undefined
      )
    );
  }

  async findMany(filters: any = {}, limit: number = 100): Promise<Asset[]> {
    const rawAssets = await prisma.asset.findMany({
      where: filters,
      orderBy: { name: 'asc' },
      take: limit,
    });
    
    return rawAssets.map((raw) => 
      Asset.restore(
        raw.id,
        raw.name,
        raw.serialNumber,
        raw.status as AssetStatus,
        raw.createdAt,
        raw.parentId ?? undefined,
        raw.assetType as AssetType,
        raw.location ?? undefined,
        raw.manufacturer ?? undefined,
        raw.modelNumber ?? undefined
      )
    );
  }

  async count(filters: any = {}): Promise<number> {
    return await prisma.asset.count({
      where: filters,
    });
  }

  async findById(id: string): Promise<Asset | null> {
    const raw = await prisma.asset.findUnique({ where: { id } });
    if (!raw) return null;

    return Asset.restore(
      raw.id, 
      raw.name, 
      raw.serialNumber, 
      raw.status as AssetStatus, 
      raw.createdAt,
      raw.parentId ?? undefined,
      raw.assetType as AssetType | undefined,
      raw.location ?? undefined,
      raw.manufacturer ?? undefined,
      raw.modelNumber ?? undefined
    );
  }

  async findWithChildren(id: string): Promise<Asset | null> {
    const raw = await prisma.asset.findUnique({
      where: { id },
      include: { children: true }
    });
    if (!raw) return null;

    return Asset.restore(
      raw.id,
      raw.name,
      raw.serialNumber,
      raw.status as AssetStatus,
      raw.createdAt,
      raw.parentId ?? undefined,
      raw.assetType as AssetType | undefined,
      raw.location ?? undefined,
      raw.manufacturer ?? undefined,
      raw.modelNumber ?? undefined
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