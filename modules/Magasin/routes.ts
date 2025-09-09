import { api } from '../../services/api';
import { Magasin } from './type';

const API_URL = `/magasin`;

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
    const response = await api.get<Magasin[]>(API_URL);
    return response.data;
  } catch (error) {
	throw handleNetworkError(error);
  }
};
