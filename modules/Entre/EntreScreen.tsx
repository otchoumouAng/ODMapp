import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import LotCard from './components/LotCard';
import EntreDetailModal from './components/EntreDetailModal';
import { Lot } from './type';

// Mock data generation for lots
const createMockLots = (): Lot[] => {
    return [
        { id: 'cff5a9c2-c484-4186-8dec-c82a1059d527', campagneID: '2023/2024', exportateurID: 1, exportateurNom: 'TOUTON', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150b9', numeroProduction: '23PA0001', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 3, certificationDesignation: 'FAIRTRADE', dateLot: '2024-04-12T07:28:17', dateProduction: null, numeroLot: '23TEA0008', nombreSacs: 380, poidsBrut: 25460.0, tareSacs: 380.0, tarePalettes: 0.0, poidsNet: 25080.0, estQueue: false, estManuel: true, estReusine: false, statut: 'NA', desactive: false, creationUtilisateur: 'admin', creationDate: '2024-04-12T07:28:17.907', modificationUtilisateur: 'admin', modificationDate: '2024-04-12T07:32:27.993', rowVersionKey: 'AAAAAAAApK4=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: true },
        { id: 'a2b1c3d4-e5f6-4186-8dec-c82a1059d528', campagneID: '2023/2024', exportateurID: 17, exportateurNom: 'AFRICA SOURCING', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150c0', numeroProduction: '23PA0002', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 1, certificationDesignation: 'RA', dateLot: '2024-04-13T09:00:00', dateProduction: null, numeroLot: '23TEA0009', nombreSacs: 400, poidsBrut: 26000.0, tareSacs: 400.0, tarePalettes: 0.0, poidsNet: 25600.0, estQueue: false, estManuel: true, estReusine: false, statut: 'NA', desactive: false, creationUtilisateur: 'admin', creationDate: '2024-04-13T09:00:00.000', modificationUtilisateur: null, modificationDate: null, rowVersionKey: 'AAAAAAAApL8=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: false },
    ];
};

const EntreScreen = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
        setLots(createMockLots());
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

  const handleEntre = (item: Lot) => {
    console.log(`Entre action triggered for lot: ${item.numeroLot}`);
    // Here you would call the real API

    // To simulate the item disappearing from the list after reception
    setLots(prevLots => prevLots.filter(lot => lot.id !== item.id));

    handleCloseModal();
    Alert.alert("Succès", `Le lot ${item.numeroLot} a été entré.`);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lots}
        renderItem={({ item }) => <LotCard item={item} onPress={handleCardPress} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <EntreDetailModal
        visible={isModalVisible}
        item={selectedLot}
        onClose={handleCloseModal}
        onEntre={handleEntre}
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
});

export default EntreScreen;
