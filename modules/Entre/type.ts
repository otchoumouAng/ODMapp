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
    poidsBrut: number;
    tarePaletteArrive: number;
    rowVersionKey: any; // Le format exact dépend de votre gestion (ex: string base64)
    
    // --- CHAMP CORRIGÉ (requis par le 'Dual-Step' backend) ---
    // Correction: 'mouvementTypeId' (camelCase) pour correspondre au Postman
    mouvementTypeId: number;
}

/**
 * Type générique pour les listes des sélecteurs (Picker)
 */
export interface DropdownItem {
  id: number;
  designation: string;
  nom?: string; // Pour Exportateur
}

