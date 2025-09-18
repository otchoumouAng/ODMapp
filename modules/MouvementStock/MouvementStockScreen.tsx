import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';

import MouvementStockFilter, { LotFilters } from './components/MouvementStockFilter';
import MouvementStockTable from './components/MouvementStockTable';
import MouvementStockDetailModal from './components/MouvementStockDetailModal';
import { MouvementStock } from './type';

// Imports pour les services API partagés et spécifiques
import * as sharedApiService from '../../Shared/routes';
import * as mouvementApiService from './routes';

import { Styles, Colors } from '../../styles/style';

const MouvementStockScreen = () => {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<LotFilters>({});
  const [selectedItem, setSelectedItem] = useState<MouvementStock | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const fetchMouvements = useCallback(async () => {
    setLoading(true);
    try {
      // Construction dynamique des paramètres de la requête
      const queryParams = new URLSearchParams();
      
      // On vérifie chaque filtre avant de l'ajouter aux paramètres
      if (filters.dateDebut) queryParams.append('datedebut', filters.dateDebut);
      if (filters.dateFin) queryParams.append('datefin', filters.dateFin);
      if (filters.siteID) queryParams.append('siteID', filters.siteID);
      if (filters.exportateurID) queryParams.append('exportateurID', filters.exportateurID);
      if (filters.campagneID) queryParams.append('campagneID', filters.campagneID);
      if (filters.typeLotID) queryParams.append('typeLotID', filters.typeLotID);
      // Ajoutez ici d'autres filtres si nécessaire

      // Appel à la fonction API spécifique à ce module
      const data = await mouvementApiService.getMouvements(queryParams);
      setMouvements(data);
    } catch (error) {
      console.error("Failed to fetch stock movements:", error);
      // Idéalement, afficher un Toast ou une alerte à l'utilisateur ici
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMouvements();
  }, [fetchMouvements]);

  const handleFilterChange = (newFilters: LotFilters) => {
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
    <View style={Styles.container}>
      {/* Le composant Filtre est rendu ici. Il est configurable
        pour afficher/masquer les champs selon le module.
      */}
      <MouvementStockFilter 
        onFilterChange={handleFilterChange} 
        onReset={handleResetFilters}
        // Exemple de configuration pour ce module :
        showSiteFilter={true}
        showDateFilters={true}
      />

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