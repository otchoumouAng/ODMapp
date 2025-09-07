import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../modules/Auth/routes';
import { AuthContextType, User, LoginCredentials } from '../modules/Auth/types';
import Toast from 'react-native-toast-message';

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      const storedUser = await SecureStore.getItemAsync('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Simulation temporaire - accepter n'importe quelle connexion avec données non vides
      // Cette logique sera remplacée plus tard par un appel API réel
      const mockUser = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
      };
      
      const mockToken = 'mock-token-' + Math.random().toString(36).substring(2);
      
      setToken(mockToken);
      setUser(mockUser);
      
      await SecureStore.setItemAsync('authToken', mockToken);
      await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
      
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: error.response?.data?.message || 'Une erreur est survenue',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}