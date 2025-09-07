import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ClientTable from './components/ClientTable';

const ClientScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ClientTable />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Correspond à la couleur de fond de ClientTable
  },
});

export default ClientScreen;