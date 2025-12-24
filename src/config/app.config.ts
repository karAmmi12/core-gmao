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
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  validation: {
    asset: {
      nameMinLength: 3,
      nameMaxLength: 50,
      serialNumberMinLength: 2,
    },
    workOrder: {
      titleMinLength: 5,
      titleMaxLength: 100,
    },
  },
  features: {
    enableNotifications: true,
    enableExport: true,
    enableAdvancedFilters: false, // Feature flag pour fonctionnalités futures
  },
} as const;

export type AppConfig = typeof appConfig;
