// Interface pour les données du formulaire de réception
export interface ReceptionData {
    dateReception: string;
    destinationID: number;
    modificationUser: string;
    immTracteurRec: string;
    immRemorqueRec: string;
    numBordereauRec: string;
    commentaireRec: string;
    statut: string;
    nombreSac: number;
    nombrePalette: number;
    poidsNetRecu: number;
    tareSacRecu: number;
    poidsbrut: number; // Correction: Assurer la correspondance avec le paramètre de la SP (@poidsbrut)
    tarePaletteArrive: number;
    rowVersionKey: any; // Le format exact dépend de votre gestion (ex: string base64)
}
