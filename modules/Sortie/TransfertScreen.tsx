import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { Magasin } from './type';
import { getMagasins } from '../Shared/route';
import { createTransfert } from './routes';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StockLot } from '../Stock/type';

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}>
        <Text style={localStyles.infoLabel}>{label}</Text>
        <Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text>
    </View>
);

const TransfertScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params as { item: StockLot & { lotID: string } };

    const [operationType, setOperationType] = useState<'transfert' | 'empotage' | 'export'>('transfert');
    const [transfertMode, setTransfertMode] = useState<'total' | 'partiel'>('total');
    const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
    const [tracteur, setTracteur] = useState('');
    const [remorque, setRemorque] = useState('');
    const [nombreSacs, setNombreSacs] = useState<number | undefined>(item.quantite);
    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [numBordereau, setNumBordereau] = useState('');
    const [commentaire, setCommentaire] = useState('');

    useEffect(() => {
        const loadMagasins = async () => {
            try {
                const data = await getMagasins();
                const filteredMagasins = data.filter(m => m.id !== user?.magasinID);
                setMagasins(filteredMagasins);
            } catch (error) {
                console.error("Failed to load magasins", error);
                Alert.alert("Erreur", "Impossible de charger la liste des magasins.");
            }
        };
        loadMagasins();
    }, [user]);

    const handleTransfert = async () => {
        // --- Validations ---
        if (operationType === 'transfert' && !destinationMagasinId) {
            Alert.alert("Validation", "Veuillez sélectionner un magasin de destination.");
            return;
        }
        if (!numBordereau.trim()) {
            Alert.alert("Validation", "Le numéro du bordereau est obligatoire.");
            return;
        }
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur", "Utilisateur non authentifié ou informations manquantes.");
            return;
        }
        if (!item.lotID) {
            Alert.alert("Erreur Critique", "L'identifiant du lot (GUID) est manquant. Impossible de continuer.");
            return;
        }
        if (item.poidsBrut == null || item.poidsNetAccepte == null) {
            Alert.alert("Données de lot invalides", "Le poids brut ou le poids net du lot sélectionné sont manquants.");
            return;
        }

        setIsSubmitting(true);

        // --- Objet de données final et correct ---
        const transfertData = {
            lotID: item.lotID,
            campagneID: item.campagneID || "2024/2025",
            siteID: user.locationID,
            numeroLot: item.reference,
            numBordereauExpedition: numBordereau,
            magasinExpeditionID: user.magasinID,
            nombreSacsExpedition: nombreSacs ?? 0,
            nombrePaletteExpedition: 0,
            tareSacsExpedition: item.poidsBrut - item.poidsNetAccepte,
            tarePaletteExpedition: 0,
            poidsBrutExpedition: item.poidsBrut,
            poidsNetExpedition: item.poidsNetAccepte,
            immTracteurExpedition: tracteur,
            immRemorqueExpedition: remorque,
            dateExpedition: new Date().toISOString(),
            commentaireExpedition: commentaire,
            statut: "TR", // Statut "En Transit"
            magReceptionTheoID: parseInt(destinationMagasinId, 10) || 0,
            modeTransfertID: transfertMode === 'total' ? 1 : 2,
            typeOperationID: operationType === 'transfert' ? 1 : 2,
            creationUtilisateur: user.name,
        };

        try {
            // --- Un seul appel API qui gère toute la logique ---
            await createTransfert(transfertData);

            Toast.show({ type: 'success', text1: 'Opération réussie', text2: `La sortie du lot ${item.reference} a été validée.` });
            navigation.goBack();
        } catch (error: any) {
            const serverMessage = error.response?.data?.message || error.message;
            const displayMessage = serverMessage || "Une erreur inattendue est survenue.";
            console.error("Échec de l'opération de transfert:", JSON.stringify(error, null, 2));
            Alert.alert("Échec de l'opération", displayMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={Styles.container}>
            <View style={localStyles.pageContainer}>
                <Text style={Styles.modalTitle}>SORTIE DU LOT</Text>
                <Text style={localStyles.lotNumberHeader}>{item.reference}</Text>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails du Lot</Text>
                    <InfoRow label="Produit" value={item.libelleProduit} />
                    <InfoRow label="Certification" value={item.nomCertification} />
                    <InfoRow label="Poids Net" value={`${item.poidsNetAccepte?.toFixed(2)} kg`} />
                    <InfoRow label="Nombre de Sacs" value={item.quantite} />
                </View>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>
                    
                    <TextInput style={Styles.filterInput} placeholder="Numéro du Bordereau *" value={numBordereau} onChangeText={setNumBordereau} />
                    <TextInput style={Styles.filterInput} placeholder="Commentaire *" value={commentaire} onChangeText={setCommentaire} multiline />
                    
                    <Picker selectedValue={operationType} onValueChange={(itemValue: 'transfert' | 'empotage' | 'export') => setOperationType(itemValue)}>
                        <Picker.Item label='Transfert inter-magasin' value='transfert' />
                        <Picker.Item label='Sortie pour empotage' value='empotage' />
                        <Picker.Item label='Sortie pour export' value='export' />
                    </Picker>
                    <Picker selectedValue={transfertMode} onValueChange={(itemValue: 'total' | 'partiel') => setTransfertMode(itemValue)}>
                        <Picker.Item label='Total' value='total' />
                        <Picker.Item label='Partiel' value='partiel' />
                    </Picker>
                    <Picker selectedValue={destinationMagasinId} onValueChange={(itemValue: string) => setDestinationMagasinId(itemValue)} enabled={operationType === 'transfert' || operationType === 'empotage'}>
                        <Picker.Item label={operationType === 'export' ? "N/A" : "-- Sélectionnez un magasin --"} value="" />
                        {magasins.map(magasin => (
                            <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id.toString()} />
                        ))}
                    </Picker>
                    <TextInput style={Styles.filterInput} placeholder="Tracteur" value={tracteur} onChangeText={setTracteur} />
                    <TextInput style={Styles.filterInput} placeholder="Remorque" value={remorque} onChangeText={setRemorque} />
                    <TextInput
                        style={[Styles.filterInput, transfertMode === 'total' && localStyles.disabledInput]}
                        placeholder="Nombre de sacs"
                        value={nombreSacs?.toString()}
                        onChangeText={(text) => setNombreSacs(Number(text))}
                        editable={transfertMode === 'partiel'}
                        keyboardType="numeric"
                    />
                </View>

                <View style={Styles.modalButtonContainer}>
                    <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
                    <Button title="Valider Sortie" onPress={handleTransfert} color={Colors.primary} disabled={isSubmitting} />
                </View>
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    pageContainer: {
        padding: 20,
        paddingTop: 40
    },
    sectionContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
        paddingBottom: 8,
    },
    lotNumberHeader: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.dark,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 16,
        color: Colors.darkGray,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.dark,
    },
    disabledInput: {
        backgroundColor: '#e9ecef'
    }
});

export default TransfertScreen;

