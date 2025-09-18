import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors, Styles } from '../../styles/style'; 
import { Lot, Magasin } from '../Shared/type';
import LotCard from '../Shared/components/LotCard'; 
import StockDetailModal from './components/StockDetailModal';
import { getStockLots, getMagasins } from '../Shared/route';
import { AuthContext } from '../../contexts/AuthContext';

const StockScreen = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [selectedMagasin, setSelectedMagasin] = useState<string | undefined>(user?.magasinId?.toString());

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user || !user.magasinId) {
        setError("Impossible de charger les données: l'utilisateur ou l'identifiant du magasin n'est pas disponible.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch magasins for the picker
        const fetchedMagasins = await getMagasins();
        setMagasins(fetchedMagasins);

        // Fetch lots for the initial magasin
        const initialMagasinId = selectedMagasin || user.magasinId.toString();
        if (initialMagasinId) {
            const fetchedLots = await getStockLots(initialMagasinId);
            setLots(fetchedLots);
        }
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Une erreur est survenue lors du chargement des données.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const fetchLotsForSelectedMagasin = async () => {
      if (selectedMagasin) {
        try {
          setLoading(true);
          const fetchedLots = await getStockLots(selectedMagasin);
          setLots(fetchedLots);
          setError(null);
        } catch (e: any) {
          setError(e.message || 'Une erreur est survenue lors du chargement du stock.');
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };

    if (selectedMagasin) {
        fetchLotsForSelectedMagasin();
    }
  }, [selectedMagasin]);

  const handleCardPress = (item: Lot) => {
    setSelectedLot(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedLot(null);
  };

  if (loading && lots.length === 0) { // Show loader only on initial load
    return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
  }

  if (error) {
      return (
          <View style={Styles.container}>
              <Text style={Styles.errorText}>{error}</Text>
          </View>
      );
  }

  return (
    <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
      <View style={Styles.filterContainer}>
        <Picker
          selectedValue={selectedMagasin}
          onValueChange={(itemValue) => setSelectedMagasin(itemValue)}
          style={Styles.picker}
        >
          {magasins.map((magasin) => (
            <Picker.Item key={magasin.id} label={magasin.nom} value={magasin.id.toString()} />
          ))}
        </Picker>
      </View>

      {loading && <ActivityIndicator size="small" color={Colors.primary} />}

      <FlatList
        data={lots}
        renderItem={({ item }) => <LotCard item={item} onPress={handleCardPress} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={Styles.list}
        ListEmptyComponent={<Text style={Styles.emptyListText}>Aucun lot en stock pour ce magasin.</Text>}
      />
      <StockDetailModal
        visible={isModalVisible}
        item={selectedLot}
        onClose={handleCloseModal}
      />
    </View>
  );
};

export default StockScreen;