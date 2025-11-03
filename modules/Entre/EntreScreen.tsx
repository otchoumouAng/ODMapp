import React, { useState, useContext } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Styles } from '../../styles/style';
import LotCard from '../Shared/components/LotCard';
import { AuthContext } from '../../contexts/AuthContext';
import { getLotsARecevoir } from './routes';
// Le type TransfertLot est défini dans un fichier partagé
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
                    // Appelle l'API /api/transfertlot/entransit
                    const data = await getLotsARecevoir(user.magasinID);
                    setLots(data);
                } catch (error: any) {
                    Alert.alert("Erreur", error.message || "Impossible de charger les lots à recevoir.");
                } finally {
                    setLoading(false);
                }
            };
            fetchLots();
        }, [user])
    );

    const handleCardPress = (item: TransfertLot) => {
        // Navigue vers l'écran de formulaire en passant l'objet TransfertLot complet
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
                    // --- MODIFICATION --- : Mappage complet vers le LotCard
                    // Le LotCard attend un type 'Lot', nous mappons 'TransfertLot' vers 'Lot'
                    <LotCard 
                        item={{
                            id: item.id, // ID du transfert (GUID)
                            numeroLot: item.numeroLot,
                            poidsNet: item.poidsNetExpedition ?? 0,
                            exportateurNom: item.exportateurNom ?? 'N/A',
                            statut: item.statut, // Statut du transfert (ex: 'NA')
                            campagneID: item.campagneID,
                            dateLot: item.dateExpedition, // La date pertinente est la date d'expédition
                            nombreSacs: item.nombreSacsExpedition ?? 0,
                            poidsBrut: item.poidsBrutExpedition ?? 0,
                            exportateurID: item.exportateurID,

                            // --- Champs requis par 'Lot' (type du LotCard) ---
                            // Fournir des valeurs par défaut
                            typeLotID: 0,
                            typeLotDesignation: "Transfert",
                            certificationID: 0,
                            certificationDesignation: "N/A",
                            productionID: '', 
                            numeroProduction: '',
                            tareSacs: item.tareSacsExpedition ?? 0,
                            tarePalettes: item.tarePaletteExpedition ?? 0,
                            estQueue: false,
                            estManuel: false,
                            estReusine: false,
                            desactive: false,
                            creationUtilisateur: item.creationUtilisateur,
                            creationDate: item.creationDate,
                            rowVersionKey: item.rowVersionKey, 
                            estQueueText: 'No',
                            estManuelText: 'Yes',
                            estReusineText: 'No',
                            estFictif: false,
                        }}
                        onPress={() => handleCardPress(item)}
                    />
                )}
                keyExtractor={(item) => item.id} // L'ID du transfert est unique
                contentContainerStyle={Styles.list}
                ListEmptyComponent={<Text style={Styles.emptyText}>Aucun lot en attente de réception.</Text>}
            />
        </View>
    );
};

export default EntreeScreen;
