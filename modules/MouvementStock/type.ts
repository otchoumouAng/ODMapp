export interface MouvementStock {
  ID: string;
  magasinId: number;
  campagneID: string;
  exportateurId?: number;
  certificationId?: number;
  datemouvement: string;
  sens: number;
  mouvementTypeId: number;
  objectEnStockID?: string;
  objectEnStockType?: number;
  quantite: number;
  statut: string;
  reference1?: string;
  reference2?: string;
  poidsbrut: number;
  tarebags: number;
  tarepalette: number;
  poidsnetlivre: number;
  retention: number;
  poidsnetaccepte: number;
  CreationUser: string;
  EmplacementID?: number;
  sactypeId?: number;
  commentaire?: string;
  SiteID: number;
  produitID?: number;
  lotID?: string;
  RowVersion: any;

  // Fields that might not be part of the creation DTO
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