import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { authService } from '../modules/Auth/routes';
import { AuthContextType, User, LoginCredentials } from '../modules/Auth/types';

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifie si un utilisateur est déjà stocké au lancement de l'app
    const checkAuthState = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        const storedUser = await SecureStore.getItemAsync('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthState();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // ## MODIFICATION : Appel à l'API réelle au lieu de la simulation ##
      const userData = await authService.login(credentials);
      
      // On utilise l'ID de l'utilisateur comme un token simple et unique
      const userToken = userData.id;
      
      setToken(userToken);
      setUser(userData);
      
      // Stockage sécurisé des informations de session
      await SecureStore.setItemAsync('authToken', userToken);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));

      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: `Bienvenue, ${userData.name} !`,
      });
      
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Échec de la connexion',
        // Affiche le message d'erreur renvoyé par l'API C#
        text2: error.response?.data || 'Identifiants incorrects ou erreur serveur.',
      });
      throw error; // Important pour que le composant LoginForm puisse aussi savoir qu'il y a eu une erreur
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Ici, vous pourriez appeler une route API pour invalider le token côté serveur si nécessaire
      // await authService.logout(); 
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyage de l'état et du stockage sécurisé
      setToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}