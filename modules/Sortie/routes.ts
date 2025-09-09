import axios from 'axios';
import { Magasin } from './type';
import { baseUrl } from '../../config';

// Route definitions for the Sortie module.
export const SORTIE_ROUTES = {
  LIST: 'Sortie',
  TRANSFERT: 'Transfert',
};

const API_URL = `${baseUrl}/magasin`;

const handleNetworkError = (error: any) => {
  if (error.response) {
    // Erreur serveur (4xx, 5xx)
    return new Error(`Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Pas de détails'}`);
  } else if (error.request) {
    // Pas de réponse du serveur
    return new Error('Pas de réponse du serveur. Vérifiez votre connexion réseau.');
  } else {
    // Erreur de configuration
    return new Error('Erreur de configuration de la requête: ' + error.message);
  }
};

export const getMagasins = async (): Promise<Magasin[]> => {
  try {
    const response = await axios.get<Magasin[]>(API_URL);
    return response.data;
  } catch (error) {
	throw handleNetworkError(error);
  }
};
