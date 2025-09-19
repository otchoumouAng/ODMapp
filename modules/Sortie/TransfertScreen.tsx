import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { Magasin } from './type';
import { getMagasins } from '../Shared/route';
import { createTransfert } from './routes';
import { createMouvementStock } from '../MouvementStock/routes';
import { MouvementStock } from '../MouvementStock/type';
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

    const [operationType, setOperationType] = useState<'transfert' | 'export'>('transfert');
    const [transfertMode, setTransfertMode] = useState<'total' | 'partiel'>('total');
    const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
    const [tracteur, setTracteur] = useState('');
    const [remorque, setRemorque] = useState('');
    const [nombreSacs, setNombreSacs] = useState<number | undefined>(item.quantite);
    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // #################### AJOUT DES CHAMPS REQUIS ####################
    const [numBordereau, setNumBordereau] = useState('');
    const [commentaire, setCommentaire] = useState('');
    // ##################################################################

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
        // Validation côté client
        if (operationType === 'transfert' && !destinationMagasinId) {
            Alert.alert("Validation", "Veuillez sélectionner un magasin de destination.");
            return;
        }
        if (!numBordereau.trim()) {
            Alert.alert("Validation", "Le numéro du bordereau est obligatoire.");
            return;
        }
         if (!commentaire.trim()) {
            Alert.alert("Validation", "Un commentaire est obligatoire pour la sortie.");
            return;
        }
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur", "Utilisateur non authentifié.");
            return;
        }
        if (!item.lotID) {
            Alert.alert("Erreur Critique", "L'identifiant du lot (GUID) est manquant.");
            return;
        }

        setIsSubmitting(true);

        const transfertData = {
            LotID: item.lotID,
            NumeroLot: item.reference,
            CampagneID: item.campagneID || "2023/2024",
            SiteID: user.locationID,
            MagasinExpeditionID: user.magasinID,
            MagReceptionTheoID: operationType === 'transfert' ? parseInt(destinationMagasinId, 10) : undefined,
            NombreSacsExpedition: nombreSacs ?? 0,
            PoidsBrutExpedition: item.poidsBrut,
            PoidsNetExpedition: item.poidsNetAccepte,
            TareSacsExpedition: (item.poidsBrut ?? 0) - (item.poidsNetAccepte ?? 0),
            TarePaletteExpedition: 0,
            ImmTracteurExpedition: tracteur,
            ImmRemorqueExpedition: remorque,
            DateExpedition: new Date().toISOString(),
            CreationUtilisateur: user.name,

            // #################### AJOUT DES CHAMPS DANS L'ENVOI ####################
            Statut: "PE", // "PE" pour "En Préparation" ou "AP" pour "Approuvé", à adapter
            CommentaireExpedition: commentaire,
            NumBordereauExpedition: numBordereau,
            ModeTransfertID: transfertMode === 'total' ? 1 : 2,
            TypeOperationID: operationType === 'transfert' ? 1 : 2,
            // #######################################################################
        };

        try {
            const transfertResponse = await createTransfert(transfertData);

            const mouvementData: Partial<MouvementStock> = {
                magasinID: user.magasinID,
                mouvementTypeID: 1, // Sortie
                objetEnStockType: 1, // Lot
                reference1: item.reference,
                dateMouvement: new Date().toISOString(),
                sens: -1,
                quantite: nombreSacs ?? 0,
                poidsBrut: item.poidsBrut ?? 0,
                poidsNetLivre: item.poidsNetAccepte ?? 0,
                creationUtilisateur: user.name,
                campagneID: item.campagneID,
                commentaire: commentaire,
                reference2: numBordereau,
                statut: 'VALID',
            };

            await createMouvementStock(mouvementData);

            Toast.show({ type: 'success', text1: 'Opération réussie', text2: `La sortie du lot ${item.reference} a été validée.` });
            navigation.goBack();
        } catch (error: any) {
            // Affiche une erreur plus claire pour l'utilisateur
            const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue.";
            Alert.alert("Échec de l'opération", errorMessage);
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
                    
                    {/* ############### AJOUT DES CHAMPS DANS L'INTERFACE ############### */}
                    <TextInput style={Styles.filterInput} placeholder="Numéro du Bordereau *" value={numBordereau} onChangeText={setNumBordereau} />
                    <TextInput style={Styles.filterInput} placeholder="Commentaire *" value={commentaire} onChangeText={setCommentaire} multiline />
                    {/* ################################################################### */}
                    
                    <Picker selectedValue={operationType} onValueChange={itemValue => setOperationType(itemValue)}>
                        <Picker.Item label='Transfert inter-magasin' value='transfert' />
                        <Picker.Item label='Sortie pour export' value='export' />
                    </Picker>
                    <Picker selectedValue={transfertMode} onValueChange={itemValue => setTransfertMode(itemValue)}>
                        <Picker.Item label='Total' value='total' />
                        <Picker.Item label='Partiel' value='partiel' />
                    </Picker>
                    <Picker selectedValue={destinationMagasinId} onValueChange={itemValue => setDestinationMagasinId(itemValue)} enabled={operationType === 'transfert'}>
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

// ... (les styles restent identiques)
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
