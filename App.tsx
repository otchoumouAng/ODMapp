import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
// Note: Please run "npm install @react-navigation/native" to install the required package
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Styles, Colors } from './styles/style';
// Note: Please run "npm install react-native-toast-message" to install the required package
import Toast from 'react-native-toast-message';
import React, { useContext } from 'react';

const AppContent: React.FC = () => {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={[Styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toast />
    </AuthProvider>
  );
}

