import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message'; 
import { useNavigation } from '@react-navigation/native';
import { Colors, Styles } from '../../styles/style';
import LotCard from '../Shared/components/LotCard';
import { Lot } from './type';

const createMockLots = (): Lot[] => {
return [
  { id: 'cff5a9c2-c484-4186-8dec-c82a1059d527', campagneID: '2023/2024', exportateurID: 1, exportateurNom: 'TOUTON', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150b9', numeroProduction: '23PA0001', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 3, certificationDesignation: 'FAIRTRADE', dateLot: '2024-04-12T07:28:17', dateProduction: null, numeroLot: '23TEA0008', nombreSacs: 380, poidsBrut: 25460.0, tareSacs: 380.0, tarePalettes: 0.0, poidsNet: 25080.0, estQueue: false, estManuel: true, estReusine: false, statut: 'NA', desactive: false, creationUtilisateur: 'admin', creationDate: '2024-04-12T07:28:17.907', modificationUtilisateur: 'admin', modificationDate: '2024-04-12T07:32:27.993', rowVersionKey: 'AAAAAAAApK4=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: true, siteNom: 'Site A', magasinReceptionNom: 'Magasin Central', dateExpedition: '2024-04-11T10:00:00', magasinExpeditionNom: 'Magasin Export', numeroTransfert: 'TR-00123', nombrePalettes: 16 },
  { id: 'a2b1c3d4-e5f6-4186-8dec-c82a1059d528', campagneID: '2023/2024', exportateurID: 17, exportateurNom: 'AFRICA SOURCING', productionID: '94c0447a-1c3a-4427-9ec5-a82fa1b150c0', numeroProduction: '23PA0002', typeLotID: 1, typeLotDesignation: 'Lot Standard', certificationID: 1, certificationDesignation: 'RA', dateLot: '2024-04-13T09:00:00', dateProduction: null, numeroLot: '23TEA0009', nombreSacs: 400, poidsBrut: 26000.0, tareSacs: 400.0, tarePalettes: 0.0, poidsNet: 25600.0, estQueue: false, estManuel: true, estReusine: false, statut: 'NA', desactive: false, creationUtilisateur: 'admin', creationDate: '2024-04-13T09:00:00.000', modificationUtilisateur: null, modificationDate: null, rowVersionKey: 'AAAAAAAApL8=', estQueueText: 'No', estManuelText: 'Yes', estReusineText: 'No', estFictif: false, siteNom: 'Site B', magasinReceptionNom: 'Magasin Principal', dateExpedition: '2024-04-12T14:30:00', magasinExpeditionNom: 'Magasin Sud', numeroTransfert: 'TR-00124', nombrePalettes: 18 },
 ];
};


const EntreScreen = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
        setLots(createMockLots());
        setLoading(false);
    }, 1000);
  }, []);

  // Fonction pour retirer un lot de la liste par son ID
  const handleRemoveLot = (idToRemove: string) => {
    setLots(prevLots => prevLots.filter(lot => lot.id !== idToRemove));
    Toast.show({
      type: 'success',
      text1: 'Opération réussie',
      text2: 'Le lot a bien été enregistré en stock.',
    });
  };

  const handleCardPress = (item: Lot) => {
    navigation.navigate('EntreDetailScreen', {
        item: item,
        onValider: handleRemoveLot 
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
  }

  return (
    <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
      <FlatList
        data={lots}
        renderItem={({ item }) => <LotCard item={item} onPress={() => handleCardPress(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={Styles.list}
      />
    </View>
  );
};

export default EntreScreen;