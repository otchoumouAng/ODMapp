/**
 * Interfaces pour le module de Sortie (Transfert)
 */

/**
 * Représente l'objet retourné par l'API /api/stock/lots
 * C'est l'objet "item" utilisé dans SortieScreen et TransfertScreen.
 */
export interface StockLot {
  lotID: string; // GUID
  reference: string;
  magasinID: number;
  magasinNom: string;
  exportateurID: number;
  exportateurNom: string;
  quantite: number; // Stock dispo
  poidsBrut: number; // Poids brut du stock dispo
  poidsNetAccepte: number; // Poids net du stock dispo
  produitID: number;
  libelleProduit: string;
  certificationID: number;
  nomCertification: string;
  gradeLotID: number;
  libelleGradeLot: string;
  typeLotID: number;
  libelleTypeLot: string;
  campagneID: string; // Campagne d'origine du lot
}

/**
 * Représente l'objet DTO (Data Transfer Object) attendu par l'API
 * POST /api/transfertlot
 * Basé sur l'exemple Postman réussi.
 */
export interface TransfertDto {
  campagneID: string;
  siteID: number;
  lotID: string; // GUID
  numeroLot: string;
  numBordereauExpedition: string;
  magasinExpeditionID: number;
  nombreSacsExpedition: number;
  nombrePaletteExpedition: number;
  tareSacsExpedition: number;
  tarePaletteExpedition: number;
  poidsBrutExpedition: number;
  poidsNetExpedition: number;
  immTracteurExpedition: string;
  immRemorqueExpedition: string;
  dateExpedition: string; // ISO Date String
  commentaireExpedition: string;
  statut: string;
  magReceptionTheoID: number;
  produitID: number;
  exportateurID: number;
  modeTransfertID: number;
  typeOperationID: number;
  mouvementTypeID: number;
  creationUtilisateur: string;
  certificationID: number;
  sacTypeID: number;
}

/**
 * Représente l'objet détaillé retourné par l'API /api/lot/{id}
 * Contient les données de base du lot, notamment les tares.
 */
export interface LotDetail {
  id: string; // GUID
  campagneID: string;
  exportateurID: number;
  exportateurNom: string;
  productionID: string | null;
  numeroProduction: string;
  typeLotID: number;
  typeLotDesignation: string;
  certificationID: number | null; // !! Peut être null
  certificationDesignation: string;
  dateLot: string;
  dateProduction: string | null;
  numeroLot: string;
  nombreSacs: number; // Le nombre de sacs TOTAL du lot
  poidsBrut: number;
  tareSacs: number; // !! La tare que nous cherchons
  tarePalettes: number; // !! La tare que nous cherchons
  poidsNet: number;
  estQueue: boolean;
  estManuel: boolean;
  estReusine: boolean;
  statut: string;
  desactive: boolean;
  creationUtilisateur: string;
  creationDate: string;
  modificationUtilisateur: string | null;
  modificationDate: string | null;
  rowVersionKey: any;
  estFictif: boolean;
}

/**
 * Type générique pour les listes des sélecteurs (Picker)
 */
export interface DropdownItem {
  id: number;
  designation: string;
  nom?: string; // Pour Exportateur
}

/**
 * Type pour /api/magasin
 */
export interface Magasin {
  id: number;
  designation: string;
}

/**
 * Représente la réponse de l'API /api/parametre
 */
export interface Parametres {
  sites: any | null;
  campagne: string; // Le champ qui nous intéresse
  exportateur: number;
  exportateurNom: string;
  nomSociete: string;
  adresseSociete: string;
  telSociete: string;
}

