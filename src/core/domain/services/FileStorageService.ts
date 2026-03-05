/**
 * FileStorageService - Domain Layer
 * Interface pour le stockage et gestion des fichiers
 */

export interface UploadedFile {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface FileStorageService {
  /**
   * Upload un fichier et retourne son URL
   */
  upload(file: Buffer, filename: string, mimetype: string): Promise<UploadedFile>;

  /**
   * Récupère un fichier par son ID
   */
  getFile(fileId: string): Promise<Buffer>;

  /**
   * Supprime un fichier
   */
  delete(fileId: string): Promise<void>;

  /**
   * Obtient l'URL publique d'un fichier
   */
  getPublicUrl(fileId: string): string;
}
