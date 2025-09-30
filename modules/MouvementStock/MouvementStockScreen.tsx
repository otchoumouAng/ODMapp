import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
// On importe bien toutes les icônes nécessaires
import { ArrowCircleUp, ArrowCircleDown, Archive, Stack, Barbell } from 'phosphor-react-native';

import MouvementStockFilter, { MouvementStockFilters } from './components/MouvementStockFilter';
import MouvementStockTable from './components/MouvementStockTable';
import MouvementStockDetailModal from './components/MouvementStockDetailModal';
import { MouvementStock } from './type';

import * as mouvementApiService from './routes';

import { Styles, Colors } from '../../styles/style';

const MouvementStockScreen = () => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<MouvementStockFilters>({
    dateDebut: getTodayDateString(),
    dateFin: getTodayDateString(),
    campagneID: '',
  });
  const [selectedItem, setSelectedItem] = useState<MouvementStock | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // La logique de calcul du résumé reste la même et est correcte
  const summary = useMemo(() => {
    const initialSummary = {
        entree: { lots: 0, sacs: 0, poidsNet: 0 },
        sortie: { lots: 0, sacs: 0, poidsNet: 0 },
    };

    return mouvements.reduce((acc, mouvement) => {
        if (mouvement.sens === 1) {
            acc.entree.lots += 1;
            acc.entree.sacs += mouvement.quantite ?? 0;
            acc.entree.poidsNet += mouvement.poidsNetAccepte ?? 0;
        } else if (mouvement.sens === -1) {
            acc.sortie.lots += 1;
            acc.sortie.sacs += mouvement.quantite ?? 0;
            acc.sortie.poidsNet += mouvement.poidsNetAccepte ?? 0;
        }
        return acc;
    }, initialSummary);
  }, [mouvements]);

  const fetchMouvements = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.dateDebut) queryParams.append('DateDebut', filters.dateDebut);
      if (filters.dateFin) queryParams.append('DateFin', filters.dateFin);
      if (filters.exportateurID) queryParams.append('ExportateurID', filters.exportateurID);
      if (filters.campagneID) queryParams.append('CampagneID', filters.campagneID);
      if (filters.mouvementTypeID) queryParams.append('MouvementTypeID', filters.mouvementTypeID);
      if (filters.sens) queryParams.append('Sens', filters.sens);
      if (filters.magasinID) queryParams.append('MagasinID', filters.magasinID);

      const data = await mouvementApiService.getMouvements(queryParams);
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

  const handleFilterValueChange = (name: keyof MouvementStockFilters, value: any) => {
    setFilters(prev => ({...prev, [name]: value}));
  };

  const handleResetFilters = () => {
    setFilters({
      dateDebut: getTodayDateString(),
      dateFin: getTodayDateString(),
      campagneID: ''
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

  const renderSummaryHeader = () => (
    <View style={localStyles.summaryRow}>
      {/* Carte des Entrées */}
      <View style={localStyles.card}>
          <View style={localStyles.cardTitleContainer}>
              {/* ## MODIFICATION ## : Icône descendante (entrée) en vert */}
              <ArrowCircleDown size={22} color={Colors.success} />
              <Text style={localStyles.cardTitle}>Entrées</Text>
          </View>
          <View style={localStyles.summaryContainer}>
              <View style={localStyles.summaryItem}><Stack size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.entree.lots}</Text><Text style={localStyles.summaryLabel}>Lots</Text></View>
              <View style={localStyles.summaryItem}><Archive size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.entree.sacs}</Text><Text style={localStyles.summaryLabel}>Sacs</Text></View>
              <View style={localStyles.summaryItem}><Barbell size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.entree.poidsNet.toFixed(0)} kg</Text><Text style={localStyles.summaryLabel}>Poids Net</Text></View>
          </View>
      </View>

      {/* Carte des Sorties */}
      <View style={localStyles.card}>
          <View style={localStyles.cardTitleContainer}>
              {/* ## MODIFICATION ## : Icône montante (sortie) en rouge */}
              <ArrowCircleUp size={22} color={Colors.danger} />
              <Text style={localStyles.cardTitle}>Sorties</Text>
          </View>
          <View style={localStyles.summaryContainer}>
              <View style={localStyles.summaryItem}><Stack size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.sortie.lots}</Text><Text style={localStyles.summaryLabel}>Lots</Text></View>
              <View style={localStyles.summaryItem}><Archive size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.sortie.sacs}</Text><Text style={localStyles.summaryLabel}>Sacs</Text></View>
              <View style={localStyles.summaryItem}><Barbell size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.sortie.poidsNet.toFixed(0)} kg</Text><Text style={localStyles.summaryLabel}>Poids Net</Text></View>
          </View>
      </View>
    </View>
  );

  return (
    <View style={Styles.container}>
      <MouvementStockFilter 
        filters={filters}
        onValueChange={handleFilterValueChange}
        onReset={handleResetFilters}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />
      ) : (
        <MouvementStockTable 
          data={mouvements} 
          onRowPress={handleRowPress}
          ListHeader={renderSummaryHeader()}
        />
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

// ## MODIFICATION DES STYLES ##
const localStyles = StyleSheet.create({
    // Style de base pour une carte, utilisé par les deux cartes de résumé
    card: { 
        backgroundColor: '#ffffff', 
        borderRadius: 12, 
        marginBottom: 16, // Espace vertical entre les cartes
        padding: 16, 
        elevation: 3, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
    },
    // Conteneur pour les cartes de résumé
    summaryRow: {
        marginHorizontal: 12,
        marginTop: 16,
    },
    // Le style spécifique pour les cartes de résumé n'est plus nécessaire
    // summaryCard: { ... }
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: Colors.dark, 
        marginLeft: 8 
    },
    summaryContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around',
    },
    summaryItem: { 
        alignItems: 'center', 
        flex: 1 
    },
    summaryValue: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: Colors.dark, 
        marginTop: 4, 
    },
    summaryLabel: { 
        fontSize: 12, 
        color: Colors.darkGray, 
        marginTop: 2, 
        textAlign: 'center' 
    },
});