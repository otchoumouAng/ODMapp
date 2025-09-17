import { api, handleNetworkError } from '../Shared/route';
import { LotFilters } from '../Shared/components/Filtre';
import { StockLot } from './type';

export const getStockLots = async (filters: LotFilters): Promise<StockLot[]> => {
    try {
        const params = new URLSearchParams();
        
        // Le magasinID est obligatoire et doit toujours être envoyé.
        if (filters.magasinID) {
            params.append('magasinID', filters.magasinID);
        }

        // ## CORRECTION ##
        // Pour les autres filtres, on les ajoute SEULEMENT s'ils ont une valeur.
        // Cela évite d'envoyer des paramètres vides (ex: exportateurID='') que le backend interpréterait mal.
        if (filters.campagneID) {
            params.append('campagneID', filters.campagneID);
        }
        if (filters.exportateurID) {
            params.append('exportateurID', filters.exportateurID);
        }
        
        const response = await api.get('/stock/lots', { params });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getStockLots');
    }
};


