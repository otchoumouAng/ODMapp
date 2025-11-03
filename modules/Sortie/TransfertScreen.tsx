import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { Magasin, DropdownItem, StockLot, TransfertDto, LotDetail } from './type';
import { getMagasins, getMouvementStockTypes, getParametres } from '../Shared/route';
import { createTransfert, getLotById } from './routes';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import CustomTextInput from '../Shared/components/CustomTextInput';

type TransfertScreenRouteParams = {
    item: StockLot; // L'objet de la liste (/api/stock/lots)
};

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
    // 'item' contient les données de /api/stock/lots (quantité dispo, poids net dispo...)
    const { item } = route.params; 

    // --- États du formulaire ---
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
    const [nombrePalettes, setNombrePalettes] = useState<string>('0');
    const [mouvementTypes, setMouvementTypes] = useState<DropdownItem[]>([]);
    const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
    
    // --- États des données chargées ---
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [campagneActuelle, setCampagneActuelle] = useState<string>('');
    // 'detailedLot' contiendra les données de /api/lot/{id} (tares, sacs totaux...)
    const [detailedLot, setDetailedLot] = useState<LotDetail | null>(null);

    // Chargement des données au démarrage
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                // Exécute tous les appels en parallèle
                const [magData, mvtData, paramsData, lotData] = await Promise.all([
                    getMagasins(),
                    getMouvementStockTypes(),
                    getParametres(),
                    getLotById(item.lotID) // Appel crucial à /api/lot/{id}
                ]);

                // Traite les magasins
                const filteredMagasins = magData.filter(m => m.id !== user?.magasinID);
                setMagasins(filteredMagasins);

                // Traite les types de mouvements
                setMouvementTypes(mvtData);

                // Traite les paramètres (campagne)
                if (paramsData && paramsData.campagne) {
                    setCampagneActuelle(paramsData.campagne);
                } else {
                    throw new Error("Impossible de récupérer la campagne actuelle.");
                }

                // Traite les détails du lot
                setDetailedLot(lotData);

            } catch (error: any) {
                Alert.alert("Erreur de chargement", error.message || "Impossible de charger les données initiales.");
                navigation.goBack(); // Retour à l'écran précédent si les données échouent
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.magasinID && item.lotID) {
            loadInitialData();
        }
    }, [user, item.lotID, navigation]); // Dépendances

    // Gère le changement de type d'opération
    useEffect(() => {
        if (operationType === 'export') {
            setDestinationMagasinId('1000'); // ID potentiellement hardcodé pour "Export"
        } else {
            setDestinationMagasinId(''); // Réinitialise
        }
    }, [operationType]);


    // Gère 'Total' vs 'Partiel'
    useEffect(() => {
        if (transfertMode === 'total') {
            // "Total" signifie le total du *stock disponible* (item.quantite)
            setNombreSacs(item.quantite);
        } else {
            setNombreSacs(undefined); // Vide pour saisie manuelle
        }
    }, [transfertMode, item.quantite]);

    /**
     * Gère la validation et la soumission du transfert
     */
    const handleTransfert = async () => {
        // --- Validations ---
        if (!operationType || !transfertMode || !numBordereau.trim() || !mouvementTypeID) {
            Alert.alert("Validation", "Veuillez remplir tous les champs obligatoires (*)."); 
            return;
        }

        // Vérifie que les données asynchrones sont chargées
        if (!campagneActuelle || !detailedLot) {
             Alert.alert("Erreur", "Les données du lot ne sont pas encore chargées. Veuillez patienter."); 
             return;
        }

        if ((operationType === 'transfert' || operationType === 'empotage') && !destinationMagasinId) {
            Alert.alert("Validation", "Veuillez sélectionner un magasin de destination."); return;
        }
        
        const sacsATransferer = Number(nombreSacs);
        // Validation: ne peut pas transférer plus que le stock disponible
        if (!sacsATransferer || sacsATransferer <= 0 || sacsATransferer > item.quantite) {
            Alert.alert("Validation", `Le nombre de sacs doit être supérieur à 0 et inférieur ou égal au stock disponible (${item.quantite}).`); return;
        }
        if (!user?.magasinID || !user?.locationID || !user?.name) {
            Alert.alert("Erreur", "Utilisateur non authentifié ou informations manquantes."); return;
        }
        // --- Fin Validations ---


        setIsSubmitting(true);

        let poidsNetExpedition: number;
        let poidsBrutExpedition: number;
        let tareSacsExpedition: number;
        let tarePaletteExpedition: number;

        // --- LOGIQUE DE CALCUL (basée sur le stock disponible) ---
        if (transfertMode === 'total') {
            // En mode "total", on transfère 100% du stock disponible
            // On utilise donc les poids/tares calculés pour ce stock (venant de /api/stock/lots)
            poidsNetExpedition = item.poidsNetAccepte;
            poidsBrutExpedition = item.poidsBrut;
            
            // Calcul des tares pour le stock disponible (item.quantite)
            // basé sur les tares unitaires du lot total (detailedLot)
            // (Assure que les tares sont proportionnelles même si le poids brut du stock/lot diffère)
            const tareSacUnitaire = detailedLot.tareSacs / detailedLot.nombreSacs;
            const tarePaletteUnitaire = detailedLot.tarePalettes / detailedLot.nombreSacs; 
            
            tareSacsExpedition = tareSacUnitaire * item.quantite;
            tarePaletteExpedition = tarePaletteUnitaire * item.quantite;

        } else {
            // En mode "partiel", on calcule la proportion basée sur le *stock disponible*
            const proportion = sacsATransferer / item.quantite;

            // Applique la proportion aux poids du *stock disponible*
            poidsNetExpedition = item.poidsNetAccepte * proportion;
            poidsBrutExpedition = item.poidsBrut * proportion;

            // Calcule les tares en se basant sur la tare unitaire (du lot total)
            // et le nombre de sacs *à transférer*.
            const tareSacUnitaire = detailedLot.tareSacs / detailedLot.nombreSacs;
            const tarePaletteUnitaire = detailedLot.tarePalettes / detailedLot.nombreSacs;

            tareSacsExpedition = tareSacUnitaire * sacsATransferer;
            tarePaletteExpedition = tarePaletteUnitaire * sacsATransferer;
        }
        // --- FIN LOGIQUE DE CALCUL ---


        // --- Construction de l'objet DTO complet ---
        const transfertData: TransfertDto = {
            // Source: /api/parametre
            campagneID: campagneActuelle,
            
            // Source: 'item' de /api/stock/lots (données du stock)
            lotID: item.lotID,
            produitID: item.produitID,
            certificationID: item.certificationID, 
            
            // Source: 'detailedLot' de /api/lot/{id} (données de base du lot)
            numeroLot: detailedLot.numeroLot,
            exportateurID: detailedLot.exportateurID,
            
            // Source: Contexte 'user'
            siteID: user.locationID,
            magasinExpeditionID: user.magasinID,
            creationUtilisateur: user.name,
            
            // Source: Formulaire 'state'
            numBordereauExpedition: numBordereau.trim(),
            nombreSacsExpedition: sacsATransferer,
            nombrePaletteExpedition: Number(nombrePalettes) || 0,
            immTracteurExpedition: tracteur.trim(),
            immRemorqueExpedition: remorque.trim(),
            dateExpedition: new Date().toISOString(),
            commentaireExpedition: commentaire.trim(),
            magReceptionTheoID: parseInt(destinationMagasinId, 10) || 0,
            modeTransfertID: transfertMode === 'total' ? 1 : 2,
            typeOperationID: operationType === 'transfert' ? 1 : (operationType === 'empotage' ? 2 : 3),
            mouvementTypeID: parseInt(mouvementTypeID, 10),

            // Source: Calculé (avec la nouvelle logique)
            poidsNetExpedition: parseFloat(poidsNetExpedition.toFixed(4)),
            poidsBrutExpedition: parseFloat(poidsBrutExpedition.toFixed(4)),
            tareSacsExpedition: parseFloat(tareSacsExpedition.toFixed(4)),
            tarePaletteExpedition: parseFloat(tarePaletteExpedition.toFixed(4)),

            // Source: Fixe (Postman)
            statut: "NA",
            sacTypeID: 1, 
        };
        // --- FIN Construction DTO ---

        try {
            await createTransfert(transfertData);
            Toast.show({ type: 'success', text1: 'Opération réussie', text2: `La sortie du lot ${item.reference} a été validée.` });
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Échec de l'opération", error.message || "Une erreur inattendue est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Affichage de chargement ---
    if (isLoading) {
        return (
            <View style={[Styles.container, Styles.loader]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={Styles.loadingText}>Chargement des détails du lot...</Text>
            </View>
        );
    }

    // --- Rendu JSX ---
    return (
        <ScrollView style={Styles.container}>
            <View style={localStyles.pageContainer}>
                <Text style={Styles.modalTitle}>SORTIE DU LOT</Text>
                <Text style={localStyles.lotNumberHeader}>{item.reference}</Text>
                <Text style={localStyles.infoValue}>Campagne : {campagneActuelle}</Text>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails du Lot (Stock)</Text>
                    <InfoRow label="Produit" value={item.libelleProduit} />
                    <InfoRow label="Certification" value={item.nomCertification} />
                    <InfoRow label="Poids Net (Stock)" value={`${item.poidsNetAccepte?.toFixed(2)} kg`} />
                    <InfoRow label="Sacs (Stock)" value={item.quantite} />
                    <InfoRow label="Poids Brut (Stock)" value={`${item.poidsBrut?.toFixed(2)} kg`} />
                    <InfoRow label="Sacs (Total Lot)" value={detailedLot?.nombreSacs} />
                </View>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>
                    
                    <CustomTextInput placeholder="Numéro du Bordereau *" value={numBordereau} onChangeText={setNumBordereau} />
                    
                    {/* Sélecteur Type d'opération */}
                    <View style={localStyles.pickerContainer}>
                        <Picker selectedValue={operationType} onValueChange={(itemValue) => setOperationType(itemValue)} style={localStyles.pickerText}>
                            <Picker.Item label="Type d'opération *" value="" enabled={false} style={{ color: '#999999' }}/>
                            <Picker.Item label='Transfert inter-magasin' value='transfert' />
                            <Picker.Item label='Sortie pour empotage' value='empotage' />
                            <Picker.Item label='Sortie pour export' value='export' />
                        </Picker>
                    </View>

                    {/* Sélecteur Type de Mouvement */}
                    <View style={localStyles.pickerContainer}>
                        <Picker selectedValue={mouvementTypeID} onValueChange={(itemValue) => setMouvementTypeID(itemValue)} style={localStyles.pickerText}>
                            <Picker.Item label="Type de Mouvement *" value="" enabled={false} style={{ color: '#999999' }}/>
                            {mouvementTypes.map(mvt => (
                                <Picker.Item key={mvt.id} label={mvt.designation} value={mvt.id.toString()} />
                            ))}
                        </Picker>
                    </View>
                    
                    {/* Sélecteur Mode de transfert */}
                    <View style={localStyles.pickerContainer}>
                        <Picker selectedValue={transfertMode} onValueChange={(itemValue) => setTransfertMode(itemValue)} style={localStyles.pickerText}>
                            <Picker.Item label="Mode de transfert *" value="" enabled={false} style={{ color: '#999999' }}/>
                            <Picker.Item label='Total' value='total' />
                            <Picker.Item label='Partiel' value='partiel' />
                        </Picker>
                    </View>

                    {/* Sélecteur Magasin destination */}
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

                    {/* Champ Nombre de palettes */}
                    <CustomTextInput
                        placeholder="Nombre de palettes"
                        value={nombrePalettes}
                        onChangeText={setNombrePalettes}
                        keyboardType="numeric"
                    />
                    
                    {/* Champ Nombre de sacs */}
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
                    <Button title="Valider Sortie" onPress={handleTransfert} color={Colors.primary} disabled={isSubmitting || isLoading} />
                </View>
            </View>
        </ScrollView>
    );
};

// Styles locaux
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
        textAlign: 'right'
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
    pickerText: {
        color: Colors.textDark, // Assure la visibilité du texte
    },
    
    // Ajout des styles manquants pour le loader
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: Colors.darkGray,
    }
});

export default TransfertScreen;

