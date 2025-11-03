import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const startInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      logout();
    }, 900000); // 15 minutes
  };

  const resetInactivityTimer = () => {
    startInactivityTimer();
  };

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        const storedUser = await SecureStore.getItemAsync('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          startInactivityTimer();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthState();

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // ## MODIFICATION : Appel à l'API réelle au lieu de la simulation ##
      const userData = await authService.login(credentials);

      if (userData.isDisabled) {
        Toast.show({
          type: 'error',
          text1: 'Échec de la connexion',
          text2: 'Votre compte est désactivé.',
        });
        throw new Error('User account is disabled.');
      }
      
      // On utilise l'ID de l'utilisateur comme un token simple et unique
      const userToken = userData.id;
      
      setToken(userToken);
      setUser(userData);
      
      // Stockage sécurisé des informations de session
      await SecureStore.setItemAsync('authToken', userToken);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      startInactivityTimer();

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
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      setToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
}