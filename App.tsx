import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
// Note: Please run "npm install @react-navigation/native" to install the required package
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
// Note: Please run "npm install react-native-toast-message" to install the required package
import Toast from 'react-native-toast-message';
import React, { useContext } from 'react';

const AppContent: React.FC = () => {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
