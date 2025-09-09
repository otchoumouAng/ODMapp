// Re-exporting the Lot type from the Entre module to avoid duplication.
export type { Lot } from '../Entre/type';

export interface Magasin {
    id: number;
    designation: string;
    stockTypeID: number;
    stockTypeDesignation: string;
    magasinLocalisation: string;
    estExterne: boolean;
    estTransit: boolean;
    desactive: boolean;
    creationUtilisateur: string;
    creationDate: string;
    modificationUtilisateur: string;
    modificationDate: string | null;
    rowVersionKey: string;
    siteID: number;
    siteNom: string;
    estMagasinParDefaut: boolean | null;
    visibleInStockDashboard: boolean | null;
    visible: boolean | null;
    pontBascule: boolean;
}
