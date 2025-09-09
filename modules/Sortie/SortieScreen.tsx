import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { Colors, Styles } from '../../styles/style';
import LotCard from '../Entre/components/LotCard'; // Reusing the LotCard
import { Lot } from './type';
import { useNavigation } from '@react-navigation/native';

// Mock data generation for lots owned by the user
const createMockUserLots = (): Lot[] => {
    return [
        { id: 'd1e2f3a4-b5c6-4186-8dec-c82a1059d999', campagneID: '2023/2024', sortieID: 1, sortieNom: 'TOUTON', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150c1', numeroProduction: '23PA0003', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 3, certificationDesignation: 'FAIRTRADE', dateLot: '2024-05-01T10:00:00', dateProduction: null, numeroLot: '23TEA0010', nombreSacs: 200, poidsBrut: 13000.0, tareSacs: 200.0, tarePalettes: 0.0, poidsNet: 12800.0, estQueue: false, estManuel: true, estReusine: false, statut: 'REC', desactive: false, creationUtilisateur: 'currentUser', creationDate: '2024-05-01T10:00:00.000', modificationUtilisateur: null, modificationDate: null, rowVersionKey: 'AAAAAAAApM8=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: false },
        { id: 'b8c7d6e5-f4a3-4186-8dec-c82a1059d888', campagneID: '2022/2023', sortieID: 1, sortieNom: 'TOUTON', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150c2', numeroProduction: '22PA0015', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 2, certificationDesignation: 'UTZ', dateLot: '2023-11-20T11:30:00', dateProduction: null, numeroLot: '22TEA0150', nombreSacs: 500, poidsBrut: 32500.0, tareSacs: 500.0, tarePalettes: 0.0, poidsNet: 32000.0, estQueue: false, estManuel: true, estReusine: false, statut: 'REC', desactive: false, creationUtilisateur: 'currentUser', creationDate: '2023-11-20T11:30:00.000', modificationUtilisateur: null, modificationDate: null, rowVersionKey: 'AAAAAAAApN0=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: false },
    ];
};

const SortieScreen = () => {
  const [userLots, setUserLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
        setUserLots(createMockUserLots());
        setLoading(false);
    }, 1000);
  }, []);

  const handleCardPress = (item: Lot) => {
    navigation.navigate('Transfert', { item });
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
  }

  return (
    <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
      <FlatList
        data={userLots}
        renderItem={({ item }) => <LotCard item={item} onPress={handleCardPress} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={Styles.list}
        ListEmptyComponent={<Text style={Styles.emptyText}>Aucun lot à expédier.</Text>}
      />
    </View>
  );
};

export default SortieScreen;
