import axios from 'axios';
import { Client } from './types';
import { baseUrl } from '../../config';

const API_URL = `${baseUrl}/client`;

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

export const getClients = async (): Promise<Client[]> => {
  try {
    const response = await axios.get<Client[]>(API_URL);
    return response.data;
  } catch (error) {
  	throw handleNetworkError(error);
  }
};

export const getClient = async (id: number): Promise<Client> => {
  try {
    const response = await axios.get<Client>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Client not found');
  }
};



export const createClient = async (payload: Omit<Client, 'id'>): Promise<Client> => {
  try {
    // Préparer le payload avec les valeurs par défaut
    const fullPayload = {
      ...payload,
      creationUtilisateur: payload.creationUtilisateur || 'admin', // Valeur par défaut
      rowVersionKey: undefined // Toujours exclure
    };

    const response = await axios.post<Client>(API_URL, fullPayload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Extraire le message d'erreur du backend
      const serverMessage = error.response?.data?.message || error.response?.data;
      
      if (error.response?.status === 409) {
        throw new Error(serverMessage || 'Client existe déjà');
      }
      
      // Log plus détaillé pour le débogage
      console.error('Erreur de création:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      throw new Error(serverMessage || 'Échec de la création du client');
    }
    
    throw new Error('Erreur réseau lors de la création du client');
  }
};

export const updateClient = async (id: number, payload: Partial<Client>): Promise<Client> => {
  try {
    const response = await axios.put<Client>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new Error('Concurrency conflict: Client was modified by another user');
    }
    throw new Error('Failed to update client');
  }
};