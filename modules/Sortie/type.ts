export interface Lot {
  id: string; // GUID
  campagneID: string;
  exportateurID: number;
  exportateurNom: string;
  productionID: string; // GUID
  numeroProduction: string;
  typeLotID: number;
  typeLotDesignation: string;
  certificationID: number;
  certificationDesignation: string;
  dateLot: string; // DateTime
  dateProduction?: string | null; // DateTime
  numeroLot: string;
  nombreSacs: number;
  poidsBrut: number; // decimal
  tareSacs: number;
  tarePalettes: number;
  poidsNet: number;
  estQueue: boolean;
  estManuel: boolean;
  estReusine: boolean;
  statut: string;
  desactive: boolean;
  creationUtilisateur: string;
  creationDate: string; // DateTime
  modificationUtilisateur?: string | null;
  modificationDate?: string | null; // DateTime
  rowVersionKey: any; // byte[]
  estQueueText: string;
  estManuelText: string;
  estReusineText: string;
  estFictif: boolean;

  // Fields for detail view, may not be in all responses
  siteNom?: string;
  magasinReceptionNom?: string;
  dateExpedition?: string;
  magasinExpeditionNom?: string;
  numeroTransfert?: string;
  nombrePalettes?: number;

  uniqueKey?: string; 
}