import axios from 'axios';
import { baseUrl } from '../../config';
import { LoginCredentials, User } from './types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    const response = await axios.post(`${baseUrl}/auth/login`, credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Implémentation optionnelle pour invalider le token côté serveur
  },
};