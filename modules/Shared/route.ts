//SHARED/ROUTE.TS

import axios from 'axios';
import { MouvementStock } from '../modules/MouvementStock/type';
import { baseUrl } from '../../config';
import { Magasin } from './type';

// Create an axios instance with a base URL
export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});


/*export const handleNetworkError = (error: any): Error => {
    // Log de l'erreur complète pour le débogage
    console.error("AXIOS ERROR:", JSON.stringify(error, null, 2));

    // Cas 1 : Le serveur a répondu avec un code d'erreur (4xx, 5xx)
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Cas 1.1 : Erreur de validation (400 Bad Request) d'ASP.NET Core
        // La réponse contient souvent un objet "errors" avec les détails par champ.
        if (status === 400 && data && data.errors) {
            const errorMessages = Object.values(data.errors).flat(); // Récupère tous les messages d'erreur
            const combinedMessage = errorMessages.join('\n');
            return new Error(`Erreur de validation (400):\n${combinedMessage || 'Veuillez vérifier les données saisies.'}`);
        }

        // Cas 1.2 : Autre erreur serveur avec un message personnalisé
        const serverMessage = data?.message || data?.title || 'Pas de détails fournis par le serveur.';
        return new Error(`Erreur serveur ${status}: ${serverMessage}`);
    } 
    // Cas 2 : La requête a été faite mais aucune réponse n'a été reçue
    else if (error.request) {
        return new Error('Pas de réponse du serveur. Vérifiez votre connexion réseau et l\'état du serveur.');
    } 
    // Cas 3 : Erreur lors de la configuration de la requête
    else {
        return new Error('Erreur de configuration de la requête: ' + error.message);
    }
};*/


export const handleNetworkError = (error: any, context: string) => {
  if (error.response) {
    console.error(`Erreur ${error.response.status} dans ${context}:`, error.response.data);
    return new Error(`Erreur serveur ${error.response.status}: ${error.response.data.message || error.response.data}`);
  } else if (error.request) {
    console.error("Pas de réponse du serveur:", error.request);
    return new Error("Pas de réponse du serveur. Vérifiez votre connexion.");
  } else {
    console.error("Erreur de configuration:", error.message);
    return new Error("Erreur de configuration de la requête.");
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

export const getExportateurs = () => getDropdownData('exportateur');
export const getSites = () => getDropdownData('site');
export const getMouvementStockTypes = () => getDropdownData('mouvementstocktype');
export const getMagasins = () => getDropdownData('magasin');
export const getCertifications = () => getDropdownData('certification'); // Assurez-vous que cette route existe si vous en avez besoin ailleurs
export const getGrades = () => getDropdownData('grade');
// ## NOUVELLE FONCTION AJOUTÉE ##
export const getLotTypes = () => getDropdownData('lottype');
export const getProduits = () => getDropdownData('produit');


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

