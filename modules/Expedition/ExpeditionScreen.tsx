import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, Text } from 'react-native';
import LotCard from '../Reception/components/LotCard'; // Reusing the LotCard
import TransfertModal from './components/TransfertModal';
import { Lot } from './type';

// Mock data generation for lots owned by the user
const createMockUserLots = (): Lot[] => {
    return [
        { id: 'd1e2f3a4-b5c6-4186-8dec-c82a1059d999', campagneID: '2023/2024', exportateurID: 1, exportateurNom: 'TOUTON', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150c1', numeroProduction: '23PA0003', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 3, certificationDesignation: 'FAIRTRADE', dateLot: '2024-05-01T10:00:00', dateProduction: null, numeroLot: '23TEA0010', nombreSacs: 200, poidsBrut: 13000.0, tareSacs: 200.0, tarePalettes: 0.0, poidsNet: 12800.0, estQueue: false, estManuel: true, estReusine: false, statut: 'REC', desactive: false, creationUtilisateur: 'currentUser', creationDate: '2024-05-01T10:00:00.000', modificationUtilisateur: null, modificationDate: null, rowVersionKey: 'AAAAAAAApM8=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: false },
        { id: 'b8c7d6e5-f4a3-4186-8dec-c82a1059d888', campagneID: '2022/2023', exportateurID: 1, exportateurNom: 'TOUTON', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150c2', numeroProduction: '22PA0015', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 2, certificationDesignation: 'UTZ', dateLot: '2023-11-20T11:30:00', dateProduction: null, numeroLot: '22TEA0150', nombreSacs: 500, poidsBrut: 32500.0, tareSacs: 500.0, tarePalettes: 0.0, poidsNet: 32000.0, estQueue: false, estManuel: true, estReusine: false, statut: 'REC', desactive: false, creationUtilisateur: 'currentUser', creationDate: '2023-11-20T11:30:00.000', modificationUtilisateur: null, modificationDate: null, rowVersionKey: 'AAAAAAAApN0=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: false },
    ];
};

const ExpeditionScreen = () => {
  const [userLots, setUserLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
        setUserLots(createMockUserLots());
        setLoading(false);
    }, 1000);
  }, []);

  const handleCardPress = (item: Lot) => {
    setSelectedLot(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedLot(null);
  };

  const handleTransfert = (item: Lot, destinationMagasinId: string) => {
    console.log(`Transfert action for lot: ${item.numeroLot} to magasin ID: ${destinationMagasinId}`);
    // Here you would call the real API

    // To simulate the item disappearing from the list after transfer
    setUserLots(prevLots => prevLots.filter(lot => lot.id !== item.id));

    handleCloseModal();
    Alert.alert("Succès", `Le lot ${item.numeroLot} a été transféré.`);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={userLots}
        renderItem={({ item }) => <LotCard item={item} onPress={handleCardPress} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun lot à expédier.</Text>}
      />
      <TransfertModal
        visible={isModalVisible}
        item={selectedLot}
        onClose={handleCloseModal}
        onTransfert={handleTransfert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  list: {
    paddingVertical: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: 'gray',
  }
});

export default ExpeditionScreen;
