import { api, handleNetworkError } from '../Shared/route';
import { LotFilters } from '../Shared/components/Filtre';
import { StockLot } from './type';

/*export const getStockLots = async (filters: LotFilters): Promise<StockLot[]> => {
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
};*/


/*export const getStockLots = async (filters: LotFilters): Promise<StockLot[]> => {
  try {
    // Validation obligatoire
    if (!filters.magasinId) {
      throw new Error("Le paramètre magasinId est requis");
    }

    const params = new URLSearchParams();
    params.append('magasinId', filters.magasinId.toString());

    // Ajout conditionnel des autres paramètres
    if (filters.campagneID) params.append('campagneID', filters.campagneID);
    if (filters.exportateurID) params.append('exportateurID', filters.exportateurID.toString());

    console.log("URL params:", params.toString());
    const response = await api.get('/stock/lots', { params });
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, 'getStockLots');
  }
};*/


/*export const getStockLots = async (filters: LotFilters): Promise<StockLot[]> => {
  try {
    // Validation obligatoire
    if (!filters.magasinID) {
      throw new Error("Le paramètre magasinId est requis");
    }

    const params = {
      magasinID: filters.magasinID.toString(), // 🔥 Changez magasinId en magasinID
      ...(filters.campagneID && { campagneID: filters.campagneID }),
      ...(filters.exportateurID && { exportateurID: filters.exportateurID.toString() })
    };

    console.log("Request params:", params);
    const response = await api.get('/stock/lots', { params });
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, 'getStockLots');
  }
};

*/
// Dans Stock/routes.ts

export const getStockLots = async (filters: StockFilters): Promise<StockLot[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.magasinID) params.append('magasinID', filters.magasinID);
    if (filters.campagneID) params.append('campagneID', filters.campagneID);
    if (filters.exportateurID) params.append('exportateurID', filters.exportateurID);
    if (filters.produitID) params.append('produitID', filters.produitID);
    if (filters.certificationID) params.append('certificationID', filters.certificationID);
    if (filters.typeLotID) params.append('typeLotID', filters.typeLotID);
    if (filters.gradeLotID) params.append('gradeLotID', filters.gradeLotID); 
    
    console.log("Requesting /stock/lots with params:", params.toString());
    const response = await api.get('/stock/lots', { params });
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, 'getStockLots');
  }
};


