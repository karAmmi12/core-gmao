/**
 * LocalFileStorageService - Infrastructure Layer
 * Implémentation du stockage de fichiers sur le système local
 * Pour production, migrer vers Vercel Blob ou S3
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  FileStorageService,
  UploadedFile,
} from '@/core/domain/services/FileStorageService';

export class LocalFileStorageService implements FileStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(uploadDir: string = './public/uploads', baseUrl: string = '/uploads') {
    this.uploadDir = uploadDir;
    this.baseUrl = baseUrl;
  }

  async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string, mimetype: string): Promise<UploadedFile> {
    await this.ensureUploadDir();

    const fileId = uuidv4();
    const extension = path.extname(filename);
    const storedFilename = `${fileId}${extension}`;
    const filePath = path.join(this.uploadDir, storedFilename);

    await fs.writeFile(filePath, file);

    return {
      id: fileId,
      filename,
      mimetype,
      size: file.length,
      url: `${this.baseUrl}/${storedFilename}`,
      createdAt: new Date(),
    };
  }

  async getFile(fileId: string): Promise<Buffer> {
    // Chercher le fichier avec n'importe quelle extension
    const files = await fs.readdir(this.uploadDir);
    const matchingFile = files.find((f) => f.startsWith(fileId));

    if (!matchingFile) {
      throw new Error(`Fichier ${fileId} introuvable`);
    }

    const filePath = path.join(this.uploadDir, matchingFile);
    return await fs.readFile(filePath);
  }

  async delete(fileId: string): Promise<void> {
    const files = await fs.readdir(this.uploadDir);
    const matchingFile = files.find((f) => f.startsWith(fileId));

    if (matchingFile) {
      const filePath = path.join(this.uploadDir, matchingFile);
      await fs.unlink(filePath);
    }
  }

  getPublicUrl(fileId: string): string {
    return `${this.baseUrl}/${fileId}`;
  }
}
