import { Asset } from "../entities/Asset";

export interface AssetRepository {
  save(asset: Asset): Promise<void>;
  findAll(): Promise<Asset[]>;
  findById(id: string): Promise<Asset | null>;
  getStats(): Promise<{ total: number; running: number; stopped: number; broken: number }>;
}