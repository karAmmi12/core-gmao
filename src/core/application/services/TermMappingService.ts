/**
 * TermMapping - Service de mapping des synonymes
 * Traduit les termes naturels en termes de la base de données
 */

export interface TermMapping {
  canonical: string; // Terme utilisé dans la DB
  synonyms: string[]; // Synonymes en langage naturel
  description: string; // Description pour l'IA
}

export class TermMappingService {
  // Mapping des statuts d'actifs (VALEURS RÉELLES DE LA BD)
  static readonly ASSET_STATUS_MAPPING: TermMapping[] = [
    {
      canonical: 'RUNNING',
      synonyms: ['en marche', 'opérationnel', 'fonctionnel', 'actif', 'en service', 'ok', 'marche', 'allumé'],
      description: 'Équipement en état de marche normal',
    },
    {
      canonical: 'BROKEN',
      synonyms: ['en panne', 'cassé', 'hors service', 'défaillant', 'hs', 'défectueux', 'panne', 'down'],
      description: 'Équipement en panne ou cassé',
    },
    {
      canonical: 'STOPPED',
      synonyms: ['arrêté', 'stoppé', 'à l\'arrêt', 'éteint', 'off', 'inactif'],
      description: 'Équipement arrêté temporairement',
    },
    {
      canonical: 'MAINTENANCE',
      synonyms: ['en maintenance', 'en révision', 'en réparation', 'en entretien', 'maintenance en cours'],
      description: 'Équipement en cours de maintenance',
    },
  ];

  // Mapping des statuts d'ordres de travail (VALEURS RÉELLES DE LA BD)
  static readonly WORK_ORDER_STATUS_MAPPING: TermMapping[] = [
    {
      canonical: 'DRAFT',
      synonyms: ['brouillon', 'en création', 'non finalisé', 'draft'],
      description: 'Ordre de travail en brouillon',
    },
    {
      canonical: 'PLANNED',
      synonyms: ['planifié', 'en attente', 'à faire', 'programmé', 'prévu', 'à traiter', 'nouveau', 'pending'],
      description: 'Ordre de travail planifié',
    },
    {
      canonical: 'IN_PROGRESS',
      synonyms: ['en cours', 'démarré', 'en traitement', 'actif', 'en train', 'en exécution'],
      description: 'Ordre de travail actuellement en cours',
    },
    {
      canonical: 'COMPLETED',
      synonyms: ['terminé', 'fini', 'accompli', 'résolu', 'fait', 'clôturé', 'complété'],
      description: 'Ordre de travail terminé',
    },
    {
      canonical: 'CANCELLED',
      synonyms: ['annulé', 'abandonné', 'supprimé'],
      description: 'Ordre de travail annulé',
    },
  ];

  // Mapping des priorités (VALEURS RÉELLES DE LA BD)
  static readonly PRIORITY_MAPPING: TermMapping[] = [
    {
      canonical: 'LOW',
      synonyms: ['basse', 'faible', 'peu important', 'mineure', 'bas'],
      description: 'Priorité basse',
    },
    {
      canonical: 'MEDIUM',
      synonyms: ['moyenne', 'normale', 'modérée', 'standard', 'moyen'],
      description: 'Priorité moyenne',
    },
    {
      canonical: 'HIGH',
      synonyms: ['haute', 'élevée', 'importante', 'prioritaire', 'haut', 'urgente', 'urgent', 'critique'],
      description: 'Priorité haute',
    },
  ];

  /**
   * Trouve le terme canonique à partir d'un terme naturel
   */
  static findCanonicalTerm(naturalTerm: string, mappings: TermMapping[]): string | null {
    const normalized = naturalTerm.toLowerCase().trim();

    for (const mapping of mappings) {
      // Vérifier si c'est déjà le terme canonique
      if (mapping.canonical.toLowerCase() === normalized) {
        return mapping.canonical;
      }

      // Vérifier les synonymes
      if (mapping.synonyms.some(syn => syn.toLowerCase() === normalized || normalized.includes(syn.toLowerCase()))) {
        return mapping.canonical;
      }
    }

    return null;
  }

  /**
   * Génère une description pour l'IA avec tous les synonymes
   */
  static generateToolDescription(field: string, mappings: TermMapping[]): string {
    const options = mappings.map(m => {
      const synonymsText = m.synonyms.slice(0, 3).join(', '); // Limiter à 3 synonymes
      return `${m.canonical} (${synonymsText})`;
    }).join(' | ');

    return `${field}: ${options}`;
  }

  /**
   * Normalise un paramètre en trouvant le terme canonique
   */
  static normalizeParameter(
    value: string | undefined,
    mappings: TermMapping[]
  ): string | undefined {
    if (!value) return undefined;

    // Rejeter les valeurs invalides comme "ALL", "TOUS", etc.
    const invalidValues = ['all', 'tous', 'tout', 'any', 'n\'importe', 'nimporte'];
    if (invalidValues.includes(value.toLowerCase().trim())) {
      return undefined;
    }

    const canonical = this.findCanonicalTerm(value, mappings);
    return canonical || undefined; // Ne pas retourner la valeur originale si pas de mapping
  }
}
