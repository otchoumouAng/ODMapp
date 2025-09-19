import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { ArrowCircleUp, ArrowCircleDown, Archive } from 'phosphor-react-native';

import MouvementStockFilter, { MouvementStockFilters } from './components/MouvementStockFilter';
import MouvementStockTable from './components/MouvementStockTable';
import MouvementStockDetailModal from './components/MouvementStockDetailModal';
import { MouvementStock } from './type';

// Imports pour les services API partagés et spécifiques
import * as sharedApiService from '../../Shared/routes';
import * as mouvementApiService from './routes';

import { Styles, Colors } from '../../styles/style';

const MouvementStockScreen = () => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<MouvementStockFilters>({
    dateDebut: getTodayDateString(),
    dateFin: getTodayDateString(),
  });
  const [selectedItem, setSelectedItem] = useState<MouvementStock | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const summary = useMemo(() => {
    return mouvements.reduce((acc, mouvement) => {
        if (mouvement.sens > 0) { // Entrée
            acc.totalEntreeLots += 1;
            acc.totalEntreePoidsNet += mouvement.poidsNetLivre ?? 0;
        } else { // Sortie
            acc.totalSortiePoidsNet += mouvement.poidsNetLivre ?? 0;
        }
        return acc;
    }, { totalEntreeLots: 0, totalEntreePoidsNet: 0, totalSortiePoidsNet: 0 });
  }, [mouvements]);

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
      if (filters.sens) queryParams.append('sens', filters.sens);
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

  const handleFilterChange = (newFilters: MouvementStockFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      dateDebut: getTodayDateString(),
      dateFin: getTodayDateString(),
    });
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

      <View style={localStyles.card}>
        <Text style={localStyles.cardTitle}>Résumé des Mouvements</Text>
        <View style={localStyles.summaryContainer}>
            <View style={localStyles.summaryItem}>
                <ArrowCircleUp size={28} color={Colors.success} />
                <Text style={localStyles.summaryValue}>{summary.totalEntreeLots}</Text>
                <Text style={localStyles.summaryLabel}>Lots Entrés</Text>
            </View>
            <View style={localStyles.summaryItem}>
                <Archive size={28} color={Colors.primary} />
                <Text style={localStyles.summaryValue}>{summary.totalEntreePoidsNet.toFixed(0)} kg</Text>
                <Text style={localStyles.summaryLabel}>Poids Net Entré</Text>
            </View>
            <View style={localStyles.summaryItem}>
                <ArrowCircleDown size={28} color={Colors.danger} />
                <Text style={localStyles.summaryValue}>{summary.totalSortiePoidsNet.toFixed(0)} kg</Text>
                <Text style={localStyles.summaryLabel}>Poids Net Sorti</Text>
            </View>
        </View>
      </View>

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

const localStyles = StyleSheet.create({
    card: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 12, marginBottom: 16, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.dark, marginBottom: 12, },
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', },
    summaryItem: { alignItems: 'center', paddingHorizontal: 10, },
    summaryValue: { fontSize: 18, fontWeight: 'bold', color: Colors.dark, marginTop: 4, },
    summaryLabel: { fontSize: 12, color: Colors.darkGray, marginTop: 2, },
});