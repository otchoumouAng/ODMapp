import { api, handleNetworkError } from '../Shared/route';
import { LotFilters } from '../Shared/components/Filtre';
import { StockLot } from './type';
import { Lot, TransfertDto } from './type';



/**
 * Récupère la liste complète des lots disponibles pour une sortie.
 * L'endpoint /api/lot retourne un objet Lot plus détaillé.
 */
export const getStockLots = async (filters: LotFilters): Promise<StockLot[]> => {
    try {
        const params = new URLSearchParams();
        
        // On vérifie et ajoute chaque filtre s'il est présent.
        if (filters.magasinID) params.append('magasinID', filters.magasinID);
        if (filters.campagneID) params.append('campagneID', filters.campagneID);
        if (filters.exportateurID) params.append('exportateurID', filters.exportateurID);
        if (filters.produitID) params.append('produitID', filters.produitID);
        if (filters.typeLotID) params.append('typeLotID', filters.typeLotID);
        if (filters.certificationID) params.append('certificationID', filters.certificationID);
        if (filters.gradeID) params.append('gradeID', filters.gradeID);
        
        const response = await api.get('/stock/lots', { params });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getStockLots');
    }
};

/**
 * Crée une nouvelle sortie de lot (transfert).
 * @param transfertData L'objet contenant les données du transfert à envoyer.
 */
export const createTransfert = async (transfertData: TransfertDto): Promise<any> => {
    try {
        // L'endpoint pour la création est /api/transfertlot (POST)
        const response = await api.post('/transfertlot', transfertData);
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'createTransfert');
    }
};