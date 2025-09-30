// MouvementStock/type.ts

export interface MouvementStock {
  // ## CORRECTION : Passage de toutes les propriétés en camelCase ##
  id: string;
  magasinId: number;
  campagneID: string;
  exportateurId?: number;
  certificationId?: number;
  dateMouvement: string; // Nom de propriété corrigé
  sens: number;
  mouvementTypeId: number;
  objectEnStockID?: string;
  objectEnStockType?: number;
  quantite: number;
  statut: string;
  reference1?: string;
  reference2?: string;
  poidsBrut: number;       // Nom de propriété corrigé
  tareSacs: number;        // Nom de propriété corrigé
  tarePalettes: number;    // Nom de propriété corrigé
  poidsNetLivre: number;   // Nom de propriété corrigé
  retentionPoids: number;  // Nom de propriété corrigé
  poidsNetAccepte: number; // Nom de propriété corrigé
  creationUtilisateur: string; // Nom de propriété corrigé
  emplacementID?: number;
  sacTypeId?: number;      // Nom de propriété corrigé
  commentaire?: string;
  siteID: number;
  produitID?: number;
  lotID?: string;
  rowVersion: any;

  // Champs joints (déjà en camelCase ou PascalCase selon le backend, on harmonise)
  magasinNom?: string;
  exportateurNom?: string;
  mouvementTypeDesignation?: string;
  certificationDesignation?: string;
  sacTypeDesignation?: string;
  emplacementDesignation?: string;
  siteNom?: string;
  reference3?: string;
  desactive?: boolean;
  approbationUtilisateur?: string;
  approbationDate?: string;
  creationDate?: string;
  modificationUtilisateur?: string;
  modificationDate?: string;
}