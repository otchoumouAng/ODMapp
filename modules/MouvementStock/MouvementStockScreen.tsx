import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

import MouvementStockFilter, { MouvementStockFilters } from './components/MouvementStockFilter';
import MouvementStockTable from './components/MouvementStockTable';
import MouvementStockDetailModal from './components/MouvementStockDetailModal';
import { MouvementStock } from './type';

// This is a placeholder for your actual API service.
// You would replace this with your actual fetch/axios implementation.
const api = {
  get: async (url: string): Promise<MouvementStock[]> => {
    console.log(`Fetching from: ${url}`);
    // In a real app, you would fetch from a configured base URL.
    // For now, returning mock data to simulate an API call.
    // In a real scenario, the backend would handle the filtering based on query params.
    const mockData: MouvementStock[] = [
      { ID: '1', MagasinID: 1, MagasinNom: 'Magasin A', CampagneID: '2023', MouvementTypeID: 1, MouvementTypeDesignation: 'Entrée Production', DateMouvement: '2023-10-01T10:00:00Z', PoidsNetAccepte: 1500.50, Statut: 'VAL', CreationUtilisateur: 'user1', CreationDate: '2023-10-01T10:00:00Z', SiteID: 1, SiteNom: "Site 1", Sens: 1, Quantite: 100, PoidsBrut: 1600, TareSacs: 50, TarePalettes: 50, PoidsNetLivre: 1500, RetentionPoids: 0.5 },
      { ID: '2', MagasinID: 2, MagasinNom: 'Magasin B', CampagneID: '2023', MouvementTypeID: 2, MouvementTypeDesignation: 'Sortie Usinage', DateMouvement: '2023-10-02T14:30:00Z', PoidsNetAccepte: 1200.00, Statut: 'CON', CreationUtilisateur: 'user2', CreationDate: '2023-10-02T14:30:00Z', SiteID: 1, SiteNom: "Site 1", Sens: -1, Quantite: 80, PoidsBrut: 1300, TareSacs: 40, TarePalettes: 60, PoidsNetLivre: 1200, RetentionPoids: 0 },
    ];
    return new Promise(resolve => setTimeout(() => resolve(mockData), 1000));
  }
};

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

      const queryString = queryParams.toString();
      const url = `/api/mouvementstock${queryString ? `?${queryString}` : ''}`;

      const data = await api.get(url);
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
