export interface MouvementStock {
  ID: string; // GUID is a string in TS/JSON
  MagasinID: number;
  MagasinNom: string;
  CampagneID: string;
  ExportateurID?: number | null;
  ExportateurNom?: string | null;
  MouvementTypeID: number;
  MouvementTypeDesignation: string;
  CertificationID?: number | null;
  CertificationDesignation?: string | null;
  SacTypeID?: number | null;
  SacTypeDesignation?: string | null;
  ObjetEnStockID?: string | null; // GUID
  ObjetEnStockType?: number | null;
  EmplacementID?: number | null;
  EmplacementDesignation?: string | null;
  SiteID: number;
  SiteNom: string;
  Reference1?: string | null;
  Reference2?: string | null;
  Reference3?: string | null;
  DateMouvement: string; // DateTime is a string in JSON
  Sens: number; // short is a number
  Quantite: number;
  PoidsBrut: number; // decimal is a number
  TareSacs: number;
  TarePalettes: number;
  PoidsNetLivre: number;
  RetentionPoids: number;
  PoidsNetAccepte: number;
  Statut?: string | null;
  Commentaire?: string | null;
  Desactive?: boolean | null;
  ApprobationUtilisateur?: string | null;
  ApprobationDate?: string | null; // DateTime
  CreationUtilisateur: string;
  CreationDate: string; // DateTime
  ModificationUtilisateur?: string | null;
  ModificationDate?: string | null; // DateTime
  RowVersionKey?: any | null; // byte[] can be complex, using 'any' for now
  ProduitID?: number | null;
}
