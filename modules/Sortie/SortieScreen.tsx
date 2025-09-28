import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Styles } from '../../styles/style';
import LotCard from '../Shared/components/LotCard';
import Filtre, { LotFilters } from '../Shared/components/Filtre';
import { StockLot } from '../Stock/type';
import { getStockLots } from './routes';
import { AuthContext } from '../../contexts/AuthContext';

const SortieScreen = () => {
  const { user } = useContext(AuthContext);
  const [lots, setLots] = useState<StockLot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<LotFilters>({});
  const navigation = useNavigation();



  

  const defaultFilters = useMemo(() => {
    if (user?.magasinID) {
      return { magasinID: user.magasinID.toString() };
    }
    return {};
  }, [user]);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchLots = async () => {
        if (Object.keys(filters).length === 0) {
            setLots([]);
            return;
        }
        setLoading(true);
        try {
          const data = await getStockLots(filters);
          setLots(data);
        } catch (error) {
          console.error("Failed to load lots for sortie:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLots();
    }, [filters])
  );
  
  const handleCardPress = (item: StockLot) => {
    navigation.navigate('Transfert', { item });
  };

  const handleFilterChange = (newFilters: LotFilters) => {
    setFilters({ ...defaultFilters, ...newFilters });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  }

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
  }

  return (
    <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
      <Filtre onFilterChange={handleFilterChange} onReset={handleResetFilters} />
      <FlatList
        data={lots}
        renderItem={({ item }) => (
            <LotCard 
                item={{
                    // ## CORRECTION APPLIQUÉE ICI ##
                    // On construit un objet `Lot` complet et sûr pour `LotCard`
                    id: item.reference, // Utilise la référence comme ID unique
                    numeroLot: item.reference,
                    poidsNet: item.poidsNetAccepte ?? 0,
                    exportateurNom: item.exportateurNom ?? 'N/A',
                    statut: 'AP',
                    // Ajout de valeurs par défaut pour tous les champs requis par le type `Lot` partagé
                    dateLot: new Date().toISOString(),
                    campagneID: item.campagneID ?? 'N/A',
                    typeLotDesignation: item.libelleTypeLot ?? 'N/A',
                    certificationDesignation: item.nomCertification ?? 'N/A',
                    estQueue: false,
                    estManuel: false,
                    // Fournir des valeurs par défaut pour les autres champs obligatoires de `Lot`
                    exportateurID: item.exportateurID,
                    productionID: '',
                    numeroProduction: '',
                    typeLotID: item.typeLotID ?? 0,
                    certificationID: item.certificationID ?? 0,
                    nombreSacs: item.quantite ?? 0,
                    poidsBrut: item.poidsBrut ?? 0,
                    tareSacs: 0,
                    tarePalettes: 0,
                    estReusine: false,
                    desactive: false,
                    creationUtilisateur: '',
                    creationDate: new Date().toISOString(),
                    estQueueText: 'No',
                    estManuelText: 'Yes',
                    estReusineText: 'No',
                    estFictif: false,
                }}
                onPress={() => handleCardPress(item)} 
            />
        )}
        keyExtractor={(item, index) => {
        // 1. On priorise l'ID s'il existe. C'est le cas idéal.
        if (item.id) {
          return item.id.toString();
        }
        
        // 2. Sinon, on crée une clé composite comme "plan B".
        // On combine des champs qui ont de fortes chances d'être uniques ensemble.
        // L'ajout de `index` à la fin est la garantie ULTIME que la clé sera unique pour le rendu.
        return `${item.reference}-${item.exportateurID}-${index}`;
      }}
        contentContainerStyle={Styles.list}
        ListEmptyComponent={<Text style={Styles.emptyText}>Aucun lot à expédier pour les critères sélectionnés.</Text>}
      />
    </View>
  );
};

export default SortieScreen;