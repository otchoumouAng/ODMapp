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
    // On s'assure que le type de `item` inclut les propriétés de tare optionnelles
    const item = route.params.item as StockLot & { lotID: string, tareSacs?: number, tarePalettes?: number };

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
                Alert.alert("Erreur", "Impossible de charger la liste des magasins.");
            }
        };
        loadMagasins();
    }, [user]);

    useEffect(() => {
        if (operationType === 'export') {
            setDestinationMagasinId('1000'); // Valeur pour "N/A"
        } else {
            // Pour 'transfert' ET 'empotage', on réinitialise pour laisser l'utilisateur choisir
            setDestinationMagasinId('');
        }
    }, [operationType]);

    useEffect(() => {
        if (transfertMode === 'total') {
            setNombreSacs(item.quantite);
        } else {
            // En mode partiel, on vide le champ pour que l'utilisateur saisisse une valeur
            setNombreSacs(undefined); 
        }
    }, [transfertMode, item.quantite]);


    const handleTransfert = async () => {
        const sacsATransferer = Number(nombreSacs);

        // --- Validations ---
        if ((operationType === 'transfert' || operationType === 'empotage') && !destinationMagasinId) {
            Alert.alert("Validation", "Veuillez sélectionner un magasin de destination."); return;
        }
        if (!numBordereau.trim()) {
            Alert.alert("Validation", "Le numéro du bordereau est obligatoire."); return;
        }
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur", "Utilisateur non authentifié ou informations manquantes."); return;
        }
        if (!item.lotID) {
            Alert.alert("Erreur Critique", "L'identifiant du lot (GUID) est manquant."); return;
        }
        if (transfertMode === 'partiel' && (!sacsATransferer || sacsATransferer <= 0 || sacsATransferer >= item.quantite)) {
            Alert.alert("Validation", `Le nombre de sacs doit être supérieur à 0 et inférieur à ${item.quantite}.`); return;
        }

        setIsSubmitting(true);

        // --- Calcul final au prorata ---
        let poidsNetExpedition: number;
        let poidsBrutExpedition: number;
        let tareSacsExpedition: number;
        let tarePaletteExpedition: number;

        if (transfertMode === 'partiel') {
            const proportion = sacsATransferer / item.quantite;
            
            poidsNetExpedition = (item.poidsNetAccepte || 0) * proportion;
            poidsBrutExpedition = (item.poidsBrut || 0) * proportion;
            tareSacsExpedition = (item.tareSacs || 0) * proportion;
            tarePaletteExpedition = (item.tarePalettes || 0) * proportion;
        } else { // Mode total
            poidsNetExpedition = item.poidsNetAccepte || 0;
            poidsBrutExpedition = item.poidsBrut || 0;
            tareSacsExpedition = item.tareSacs || 0;
            tarePaletteExpedition = item.tarePalettes || 0;
        }

        const transfertData = {
            lotID: item.lotID,
            NumeroLot: item.numeroLot,
            campagneID: item.campagneID || "2024/2025",
            siteID: user.locationID,
            numBordereauExpedition: numBordereau,
            magasinExpeditionID: user.magasinID,
            nombreSacsExpedition: sacsATransferer,
            nombrePaletteExpedition: 0, // Cette valeur est fixée à 0
            tareSacsExpedition: tareSacsExpedition,
            tarePaletteExpedition: tarePaletteExpedition,
            poidsBrutExpedition: poidsBrutExpedition,
            poidsNetExpedition: poidsNetExpedition,
            immTracteurExpedition: tracteur,
            immRemorqueExpedition: remorque,
            dateExpedition: new Date().toISOString(),
            commentaireExpedition: commentaire,
            statut: "NA", // Statut "En Transit" corrigé
            magReceptionTheoID: parseInt(destinationMagasinId, 10) || 0,
            modeTransfertID: transfertMode === 'total' ? 1 : 2,
            typeOperationID: operationType === 'transfert' ? 1 : (operationType === 'empotage' ? 2 : 3),
            creationUtilisateur: user.name,
        };

        try {
            await createTransfert(transfertData);
            Toast.show({ type: 'success', text1: 'Opération réussie', text2: `La sortie du lot ${item.reference} a été validée.` });
            navigation.goBack();
        } catch (error: any) {
            const serverMessage = error.response?.data?.message || error.message;
            Alert.alert("Échec de l'opération", serverMessage || "Une erreur inattendue est survenue.");
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
                    <InfoRow label="Poids Net Total" value={`${item.poidsNetAccepte?.toFixed(2)} kg`} />
                    <InfoRow label="Sacs en stock" value={item.quantite} />
                </View>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>
                    <TextInput style={Styles.filterInput} placeholder="Numéro du Bordereau *" value={numBordereau} onChangeText={setNumBordereau} />
                    <TextInput style={Styles.filterInput} placeholder="Commentaire" value={commentaire} onChangeText={setCommentaire} multiline />
                    <Picker selectedValue={operationType} onValueChange={(itemValue) => setOperationType(itemValue)}>
                        <Picker.Item label='Transfert inter-magasin' value='transfert' />
                        <Picker.Item label='Sortie pour empotage' value='empotage' />
                        <Picker.Item label='Sortie pour export' value='export' />
                    </Picker>
                    <Picker selectedValue={transfertMode} onValueChange={(itemValue) => setTransfertMode(itemValue)}>
                        <Picker.Item label='Total' value='total' />
                        <Picker.Item label='Partiel' value='partiel' />
                    </Picker>
                    <Text style={localStyles.inputLabel}>Magasin de destination</Text>
                    {operationType === 'transfert' || operationType === 'empotage' ? (
                        <Picker selectedValue={destinationMagasinId} onValueChange={(itemValue) => setDestinationMagasinId(itemValue)}>
                            <Picker.Item label="-- Sélectionnez un magasin --" value="" />
                            {magasins.map(magasin => (
                                <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id.toString()} />
                            ))}
                        </Picker>
                    ) : (
                        <TextInput
                          style={[Styles.filterInput, localStyles.disabledInput, { marginTop: 15, marginBottom: 6}]}
                          value={"N/A (Sortie pour Export)"}
                          editable={false}
                        />
                    )}
                    <TextInput style={Styles.filterInput} placeholder="Tracteur" value={tracteur} onChangeText={setTracteur} />
                    <TextInput style={Styles.filterInput} placeholder="Remorque" value={remorque} onChangeText={setRemorque} />
                    <TextInput
                        style={[Styles.filterInput, transfertMode === 'total' && localStyles.disabledInput]}
                        placeholder="Nombre de sacs à transférer *"
                        value={nombreSacs?.toString() || ''}
                        onChangeText={(text) => setNombreSacs(text ? parseInt(text, 10) : undefined)}
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
    inputLabel: {
        fontSize: 16,
        color: Colors.darkGray,
        marginLeft: 8,
        marginBottom: -8,
    },
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#495057',
    }
});

export default TransfertScreen;