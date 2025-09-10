import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';

import MouvementStockFilter, { MouvementStockFilters } from './components/MouvementStockFilter';
import MouvementStockTable from './components/MouvementStockTable';
import MouvementStockDetailModal from './components/MouvementStockDetailModal';
import { MouvementStock } from './type';
import * as apiService from '../Shared/route';
import { Styles, Colors } from '../../styles/style';

const MouvementStockScreen = () => {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<MouvementStockFilters>({});
  const [selectedItem, setSelectedItem] = useState<MouvementStock | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const fetchMouvements = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.dateDebut) queryParams.append('datedebut', filters.dateDebut);
      if (filters.dateFin) queryParams.append('datefin', filters.dateFin);
      if (filters.magasinID) queryParams.append('magasinID', filters.magasinID);
      if (filters.exportateurID) queryParams.append('exportateurID', filters.exportateurID);
      if (filters.campagneID) queryPams.append('campagneID', filters.campagneID);

      const data = await apiService.getMouvements(queryParams);
      setMouvements(data);
    } catch (error) {
      console.error("Failed to fetch stock movements:", error);
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

  const handleRowPress = (item: MouvementStock) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <View style={[Styles.container, { marginTop: 40 }]}>
      <MouvementStockFilter onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />
      ) : (
        <MouvementStockTable data={mouvements} onRowPress={handleRowPress} />
      )}

      <MouvementStockDetailModal
        visible={isModalVisible}
        item={selectedItem}
        onClose={handleCloseModal}
      />
    </View>
  );
};

export default MouvementStockScreen;