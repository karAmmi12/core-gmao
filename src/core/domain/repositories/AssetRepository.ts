import { Asset } from "../entities/Asset";

export interface AssetRepository {
  save(asset: Asset): Promise<void>;
  update(asset: Asset): Promise<void>;
  findAll(): Promise<Asset[]>;
  findMany(filters: any, limit?: number): Promise<Asset[]>;
  count(filters: any): Promise<number>; // Nouvelle méthode pour compter
  findById(id: string): Promise<Asset | null>;
  getStats(): Promise<{ total: number; running: number; stopped: number; broken: number }>;
}