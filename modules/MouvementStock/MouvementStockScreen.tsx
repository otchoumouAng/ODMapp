import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

import MouvementStockFilter, { MouvementStockFilters } from './components/MouvementStockFilter';
import MouvementStockTable from './components/MouvementStockTable';
import MouvementStockDetailModal from './components/MouvementStockDetailModal';
import { MouvementStock } from './type';
import * as apiService from '../../services/api';

const MouvementStockScreen = () => {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<MouvementStockFilters>({});
  const [selectedItem, setSelectedItem] = useState<MouvementStock | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const fetchMouvements = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.dateDebut) queryParams.append('datedebut', filters.dateDebut);
      if (filters.dateFin) queryParams.append('datefin', filters.dateFin);
      if (filters.magasinID) queryParams.append('magasinID', filters.magasinID);
      if (filters.exportateurID) queryParams.append('exportateurID', filters.exportateurID);
      if (filters.campagneID) queryParams.append('campagneID', filters.campagneID);

      // The new service function expects the params object directly
      const data = await apiService.getMouvements(queryParams);
      setMouvements(data);
    } catch (error) {
      console.error("Failed to fetch stock movements:", error);
      // Here you might want to show an error message to the user
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMouvements();
  }, [fetchMouvements]);

  const handleFilterChange = (newFilters: MouvementStockFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  }

  const handleRowDoubleClick = (item: MouvementStock) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <View style={styles.container}>
      <MouvementStockFilter onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <MouvementStockTable data={mouvements} onRowDoubleClick={handleRowDoubleClick} />
      )}

      <MouvementStockDetailModal
        visible={isModalVisible}
        item={selectedItem}
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MouvementStockScreen;
