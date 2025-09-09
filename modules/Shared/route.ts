import axios from 'axios';
import { MouvementStock } from '../modules/MouvementStock/type';
import { baseUrl } from '../config';


// Create an axios instance with a base URL
export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

// --- API Service Functions ---

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
 * Fetches a list of items for a dropdown.
 * @param endpoint - The API endpoint to fetch from (e.g., 'magasin', 'exportateur').
 */
const getDropdownData = async (endpoint: string): Promise<any[]> => {
    try {
        const response = await api.get(`/${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for ${endpoint}:`, error);
        throw error;
    }
};

export const getExportateurs = () => getDropdownData('exportateur');
export const getSites = () => getDropdownData('site');
export const getMouvementStockTypes = () => getDropdownData('mouvementstocktype');

/**
 * Fetches the list of campaigns, derived from lots.
 * In a real app, this should ideally be its own endpoint.
 */
export const getCampagnes = async (): Promise<string[]> => {
    try {
        const lots = await getDropdownData('lot');
        // Extract unique, non-null, non-empty campaign IDs
        const campagnes = [...new Set(lots.map(lot => lot.campagneID).filter(Boolean))];
        return campagnes;
    } catch (error) {
        console.error('Error fetching campaigns from lots:', error);
        throw error;
    }
}
