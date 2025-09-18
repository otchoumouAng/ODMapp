import axios from 'axios';
import { MouvementStock } from '../modules/MouvementStock/type';
import { baseUrl } from '../../config';
import { Magasin } from './type';
import { Lot } from './type';

// Create an axios instance with a base URL
export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

// --- API Service Functions ---
const handleNetworkError = (error: any) => {
  if (error.response) {
    return new Error(`Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Pas de détails'}`);
  } else if (error.request) {
    return new Error('Pas de réponse du serveur. Vérifiez votre connexion réseau.' + error.response);
  } else {
    return new Error('Erreur de configuration de la requête: ' + error.message);
  }
};

/**
 * Fetches a list of items for a dropdown.
 * @param endpoint - The API endpoint to fetch from (e.g., 'magasin', 'exportateur').
 */
const getDropdownData = async (endpoint: string): Promise<any[]> => {
    try {
        const response = await api.get(`/${endpoint}`);
        return response.data;
    } catch (error) {
        throw handleNetworkError(error);
    }
};

/**
 * Fetches the list of stock movements with optional filters.
 * @param params - The query parameters for filtering.
 */
export const getMouvements = async (params: URLSearchParams): Promise<MouvementStock[]> => {
  try {
    const response = await api.get('/mouvementstock', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    throw error;
  }
};

/**
 * Fetches the list of stock lots for a given magasin.
 * @param magasinId - The ID of the magasin.
 */
export const getStockLots = async (magasinId: string): Promise<Lot[]> => {
    try {
        const response = await api.get('/stock/lots', {
            params: { magasinId }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch lots in stock:', error);
        throw error;
    }
};

export const getExportateurs = () => getDropdownData('exportateur');
export const getSites = () => getDropdownData('site');
export const getMouvementStockTypes = () => getDropdownData('mouvementstocktype');
export const getMagasins = () => getDropdownData('magasin');
export const getCertifications = () => getDropdownData('certification'); // Assurez-vous que cette route existe si vous en avez besoin ailleurs

// ## NOUVELLE FONCTION AJOUTÉE ##
export const getLotTypes = () => getDropdownData('lottype');


/**
 * Fetches the list of campaigns, derived from lots.
 */
export const getCampagnes = async (): Promise<string[]> => {
    try {
        const lots = await getDropdownData('lot');
        const campagnes = [...new Set(lots.map(lot => lot.campagneID).filter(Boolean))];
        return campagnes;
    } catch (error) {
        console.error('Error fetching campaigns from lots:', error);
        throw error;
    }
}