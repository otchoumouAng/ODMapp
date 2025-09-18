import axios from 'axios';
import { MouvementStock } from '../modules/MouvementStock/type';
import { baseUrl } from '../../config';
import { Magasin } from './type';

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

import { mockMouvements } from '../MouvementStock/__mocks__/MouvementStock.mock';

/**
 * Fetches the list of stock movements with optional filters.
 * @param params - The query parameters for filtering.
 */
export const getMouvements = async (params: URLSearchParams): Promise<MouvementStock[]> => {
  console.log('Fetching mock stock movements with params:', params.toString());
  // Simulate API call delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockMouvements);
    }, 500);
  });
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