/**
 * Configuration centralisée de l'application
 * Facilite la modification des paramètres sans toucher au code métier
 */
export const appConfig = {
  app: {
    name: 'CORE GMAO',
    description: 'Gestion de Maintenance Assistée par Ordinateur',
    version: '1.0.0',
  },
  api: {
    timeout: 30000, // 30 secondes
  },
  features: {
    enableNotifications: true,
    enableExport: true,
    enableAdvancedFilters: false,
  },
} as const;

export type AppConfig = typeof appConfig;

// Export pour compatibilité
export const APP_CONFIG = {
  name: appConfig.app.name,
  description: appConfig.app.description,
  version: appConfig.app.version,
};
