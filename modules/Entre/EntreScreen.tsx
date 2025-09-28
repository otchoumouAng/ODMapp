import React, { useState, useContext } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Styles } from '../../styles/style';
import LotCard from '../Shared/components/LotCard';
import { AuthContext } from '../../contexts/AuthContext';
import { getLotsARecevoir } from './routes';
import { TransfertLot } from '../Shared/type';

const EntreeScreen = () => {
    const { user } = useContext(AuthContext);
    const [lots, setLots] = useState<TransfertLot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const fetchLots = async () => {
                if (!user?.magasinID) {
                    Alert.alert("Erreur", "Magasin de l'utilisateur non défini.");
                    setLoading(false);
                    return;
                }
                setLoading(true);
                try {
                    const data = await getLotsARecevoir(user.magasinID);
                    setLots(data);
                } catch (error) {
                    console.error("Échec du chargement des lots à recevoir:", error);
                    Alert.alert("Erreur", "Impossible de charger les lots à recevoir.");
                } finally {
                    setLoading(false);
                }
            };
            fetchLots();
        }, [user])
    );

    const handleCardPress = (item: TransfertLot) => {
        navigation.navigate('ReceptionScreen', { item });
    };

    if (loading) {
        return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
    }

    return (
        <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
            <FlatList
                data={lots}
                renderItem={({ item }) => (
                    <LotCard 
                        item={{
                            id: item.id,
                            numeroLot: item.numeroLot,
                            poidsNet: item.poidsNetExpedition ?? 0,
                            exportateurNom: item.exportateurNom ?? 'N/A',
                            statut: item.statut,
                            // Mapper les autres champs nécessaires pour LotCard
                        }}
                        onPress={() => handleCardPress(item)}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={Styles.list}
                ListEmptyComponent={<Text style={Styles.emptyText}>Aucun lot en attente de réception.</Text>}
            />
        </View>
    );
};

export default EntreeScreen;
