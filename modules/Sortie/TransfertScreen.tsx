import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { Magasin } from './type'; // Assurez-vous que ce type est correctement défini et importé
import { getMagasins } from '../Shared/route';
import { createTransfert } from './routes';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StockLot } from '../Stock/type';
import CustomTextInput from '../Shared/components/CustomTextInput';

// Définition du type pour les paramètres de la route pour plus de sécurité
type TransfertScreenRouteParams = {
    item: StockLot & { lotID: string, tareSacs?: number, tarePalettes?: number };
};

// Petit composant pour afficher les lignes d'information
const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}>
        <Text style={localStyles.infoLabel}>{label}</Text>
        <Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text>
    </View>
);

const TransfertScreen = () => {
    const route = useRoute<RouteProp<{ params: TransfertScreenRouteParams }>>();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params;

    const [operationType, setOperationType] = useState<'transfert' | 'empotage' | 'export' | ''>('');
    const [transfertMode, setTransfertMode] = useState<'total' | 'partiel' | ''>('');
    
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
                // Filtre le magasin actuel de la liste des destinations possibles
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
            setDestinationMagasinId('1000'); // ID potentiellement hardcodé pour "Export"
        } else {
            setDestinationMagasinId(''); // Réinitialise si l'utilisateur change d'avis
        }
    }, [operationType]);

    useEffect(() => {
        if (transfertMode === 'total') {
            setNombreSacs(item.quantite);
        } else {
            setNombreSacs(undefined); // Vide le champ pour la saisie manuelle en partiel
        }
    }, [transfertMode, item.quantite]);

    const handleTransfert = async () => {
        // --- Validations ---
        if (!operationType) {
            Alert.alert("Validation", "Veuillez sélectionner un type d'opération."); 
            return;
        }
        if (!transfertMode) {
            Alert.alert("Validation", "Veuillez sélectionner un mode de transfert."); 
            return;
        }
        if ((operationType === 'transfert' || operationType === 'empotage') && !destinationMagasinId) {
            Alert.alert("Validation", "Veuillez sélectionner un magasin de destination."); return;
        }
        if (!numBordereau.trim()) {
            Alert.alert("Validation", "Le numéro du bordereau est obligatoire."); return;
        }
        const sacsATransferer = Number(nombreSacs);
        if (transfertMode === 'partiel' && (!sacsATransferer || sacsATransferer <= 0 || sacsATransferer >= item.quantite)) {
            Alert.alert("Validation", `Le nombre de sacs doit être supérieur à 0 et inférieur à ${item.quantite}.`); return;
        }
        if (!user?.magasinID || !user?.locationID || !user?.name) {
            Alert.alert("Erreur", "Utilisateur non authentifié ou informations manquantes."); return;
        }
        if (!item.lotID) {
            Alert.alert("Erreur Critique", "L'identifiant du lot (GUID) est manquant."); return;
        }

        setIsSubmitting(true);

        let poidsNetExpedition: number;
        let poidsBrutExpedition: number;
        let tareSacsExpedition: number;
        let tarePaletteExpedition: number;

        if (transfertMode === 'partiel' && sacsATransferer) {
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
            NumeroLot: item.reference,
            campagneID: item.campagneID || "2024/2025", // A Rendre dynamique si possible
            siteID: user.locationID,
            numBordereauExpedition: numBordereau,
            magasinExpeditionID: user.magasinID,
            nombreSacsExpedition: sacsATransferer,
            nombrePaletteExpedition: 0,
            tareSacsExpedition,
            tarePaletteExpedition,
            poidsBrutExpedition,
            poidsNetExpedition,
            immTracteurExpedition: tracteur,
            immRemorqueExpedition: remorque,
            dateExpedition: new Date().toISOString(),
            commentaireExpedition: commentaire,
            statut: "NA",
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
                    
                    <CustomTextInput placeholder="Numéro du Bordereau *" value={numBordereau} onChangeText={setNumBordereau} />
                    
                    <View style={localStyles.pickerContainer}>
                        <Picker selectedValue={operationType} onValueChange={(itemValue) => setOperationType(itemValue)} style={localStyles.pickerText}>
                            <Picker.Item label="Type d'opération *" value="" enabled={false} style={{ color: '#999999' }}/>
                            <Picker.Item label='Transfert inter-magasin' value='transfert' />
                            <Picker.Item label='Sortie pour empotage' value='empotage' />
                            <Picker.Item label='Sortie pour export' value='export' />
                        </Picker>
                    </View>

                    <View style={localStyles.pickerContainer}>
                        <Picker selectedValue={transfertMode} onValueChange={(itemValue) => setTransfertMode(itemValue)} style={localStyles.pickerText}>
                            <Picker.Item label="Mode de transfert *" value="" enabled={false} style={{ color: '#999999' }}/>
                            <Picker.Item label='Total' value='total' />
                            <Picker.Item label='Partiel' value='partiel' />
                        </Picker>
                    </View>

                    {operationType === 'transfert' || operationType === 'empotage' ? (
                        <View style={localStyles.pickerContainer}>
                            <Picker selectedValue={destinationMagasinId} onValueChange={(itemValue) => setDestinationMagasinId(itemValue)} style={localStyles.pickerText}>
                                <Picker.Item label="Magasin de destination *" value="" enabled={false} style={{ color: '#999999' }}/>
                                {magasins.map(magasin => (
                                    <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                    ) : (
                        <CustomTextInput placeholder="Destination" value={operationType === 'export' ? "Sortie pour Export" : "N/A"} editable={false} style={localStyles.disabledInput} />
                    )}
                    
                    <CustomTextInput placeholder="Tracteur" value={tracteur} onChangeText={setTracteur} />
                    <CustomTextInput placeholder="Remorque" value={remorque} onChangeText={setRemorque} />
                    <CustomTextInput
                        placeholder="Nombre de sacs à transférer *"
                        value={nombreSacs?.toString() || ''}
                        onChangeText={(text) => setNombreSacs(text ? parseInt(text, 10) : undefined)}
                        editable={transfertMode === 'partiel'}
                        keyboardType="numeric"
                        style={transfertMode !== 'partiel' ? localStyles.disabledInput : {}}
                    />
                     <CustomTextInput placeholder="Commentaire" value={commentaire} onChangeText={setCommentaire} multiline />
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
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
        backgroundColor: '#e9ecef',
        color: '#6c757d'
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderColor: '#E3E3E3', 
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        justifyContent: 'center',
    },
    // ## CORRECTION APPLIQUÉE ICI ##
    // Ce style garantit que le texte du Picker est visible.
    pickerText: {
        color: Colors.dark, // ou '#000'
    },
});

export default TransfertScreen;