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

// --- CONSTANTES DE CALCUL ---
const POIDS_BRUT_PAR_SAC = 65;
const TARE_SAC_RATIO = 0.7;
const SACS_PAR_PALETTE = 40;

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}>
        <Text style={localStyles.infoLabel}>{label}</Text>
        <Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text>
    </View>
);

// Fonction pour formater les nombres (enlève .00)
const formatNumber = (num: number) => {
    return parseFloat(num.toFixed(2)).toString();
};

const TransfertScreen = () => {
    const route = useRoute<RouteProp<{ params: TransfertScreenRouteParams }>>();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params; 

    // --- États du formulaire ---
    const [operationType, setOperationType] = useState<'transfert' | 'empotage' | 'export' | ''>('');
    const [transfertMode, setTransfertMode] = useState<'total' | 'partiel' | ''>('');
    const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
    const [tracteur, setTracteur] = useState('');
    const [remorque, setRemorque] = useState('');
    const [numBordereau, setNumBordereau] = useState('');
    const [commentaire, setCommentaire] = useState('');
    
    // --- États pour les sélecteurs ---
    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [mouvementTypes, setMouvementTypes] = useState<DropdownItem[]>([]);
    const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
    
    // --- États de chargement ---
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [campagneActuelle, setCampagneActuelle] = useState<string>('');
    const [detailedLot, setDetailedLot] = useState<LotDetail | null>(null);

    // --- États pour le calcul ---
    const [nombreSacs, setNombreSacs] = useState<number | undefined>();
    const [nombrePalettes, setNombrePalettes] = useState<string>('0');
    const [poidsBrut, setPoidsBrut] = useState<string>('0');
    const [tareSacs, setTareSacs] = useState<string>('0');
    const [tarePalettes, setTarePalettes] = useState<string>('0'); 
    const [poidsNet, setPoidsNet] = useState<string>('0'); 


    // Chargement des données au démarrage (Magasins, Parametres, Lot, MvtTypes)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [magasinsData, paramsData, lotData, mvtTypesData] = await Promise.all([
                    getMagasins(),
                    getParametres(),
                    getLotById(item.lotID), 
                    getMouvementStockTypes()
                ]);

                setMagasins(magasinsData.filter(m => m.id !== user?.magasinID));
                setCampagneActuelle(paramsData.campagne);
                setDetailedLot(lotData);
                setMouvementTypes(mvtTypesData);
                
                const defaultSortieType = mvtTypesData.find(m => m.id === 30);
                if (defaultSortieType) {
                    setMouvementTypeID(defaultSortieType.id.toString());
                }

            } catch (error: any) {
                Alert.alert("Erreur de chargement", error.message || "Impossible de charger les données initiales.");
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [user, item.lotID, navigation]); 

    // Gère le changement de "Type d'opération"
    useEffect(() => {
        if (operationType === 'export') {
            setDestinationMagasinId('1000'); 
        } else if (operationType !== 'transfert' && operationType !== 'empotage') {
            setDestinationMagasinId(''); 
        }
    }, [operationType]);


    // --- LOGIQUE MISE À JOUR : Hook 1 (Mode Change) ---
    // Gère le mode "Total" vs "Partiel"
    useEffect(() => {
        if (transfertMode === 'total') {
            // --- Pré-remplissage avec les valeurs de 'item' ---
            const sacs = item.quantite;
            const brut = item.poidsBrut; // Vient de /api/stock/lots
            const net = item.poidsNetAccepte; // Vient de /api/stock/lots
            const palettes = Math.ceil(sacs / SACS_PAR_PALETTE);
            
            // On déduit les tares pour pré-remplir
            const tSacsDefault = Math.round(sacs * TARE_SAC_RATIO);
            // On ajuste la tare palette pour que le Poids Net corresponde
            const tPalDefault = brut - net - tSacsDefault; 

            setNombreSacs(sacs);
            setNombrePalettes(formatNumber(palettes));
            setPoidsBrut(formatNumber(brut));
            setTareSacs(formatNumber(tSacsDefault));
            setTarePalettes(formatNumber(tPalDefault));
            setPoidsNet(formatNumber(net));

        } else {
            // Mode partiel, reset
            setNombreSacs(undefined); 
            setNombrePalettes('0');
            setPoidsBrut('0');
            setTareSacs('0');
            setTarePalettes('0'); // Champ éditable
            setPoidsNet('0');
        }
    }, [transfertMode, item]); // Dépend de 'item'

    // --- LOGIQUE MISE À JOUR : Hook 2 (Calcul Partiel - Sacs) ---
    // Calcule Poids Brut, Tare Sacs (par défaut), et Palettes
    useEffect(() => {
        // Ne s'exécute que en mode partiel
        if (transfertMode !== 'partiel') return; 

        const sacsNum = nombreSacs ? Number(nombreSacs) : 0;

        if (sacsNum <= 0) {
            setPoidsBrut('0');
            setTareSacs('0');
            setNombrePalettes('0');
            return;
        }

        const newPoidsBrut = sacsNum * POIDS_BRUT_PAR_SAC;
        const newTareSacs = Math.round(sacsNum * TARE_SAC_RATIO); // Arrondi
        const newPalettes = Math.ceil(sacsNum / SACS_PAR_PALETTE);

        setPoidsBrut(formatNumber(newPoidsBrut));
        setTareSacs(formatNumber(newTareSacs));
        setNombrePalettes(newPalettes.toString());

    }, [nombreSacs, transfertMode]); // Ajout de transfertMode

    // --- LOGIQUE MISE À JOUR : Hook 3 (Calcul Partiel - Poids Net) ---
    // Calcule le Poids Net dès qu'un de ses composants change
    useEffect(() => {
        // Ne s'exécute que en mode partiel
        if (transfertMode !== 'partiel') return; 

        const brut = parseFloat(poidsBrut) || 0;
        const tSacs = parseFloat(tareSacs) || 0;
        const tPalettes = parseFloat(tarePalettes) || 0;

        const newPoidsNet = brut - tSacs - tPalettes;

        setPoidsNet(formatNumber(newPoidsNet));

    }, [poidsBrut, tareSacs, tarePalettes, transfertMode]); // Ajout de transfertMode


    /**
     * Gère la validation et la soumission du transfert
     */
    const handleTransfert = async () => {
        // --- Validations ---
        if (!operationType || !transfertMode || !numBordereau.trim() || !mouvementTypeID) {
            Alert.alert("Validation", "Veuillez remplir tous les champs obligatoires (*)."); 
            return;
        }
        if (!campagneActuelle || !detailedLot) {
             Alert.alert("Erreur", "Les données du lot ne sont pas encore chargées."); 
             return;
        }
        if ((operationType === 'transfert' || operationType === 'empotage') && !destinationMagasinId) {
            Alert.alert("Validation", "Veuillez sélectionner un magasin de destination."); return;
        }
        const sacsATransferer = Number(nombreSacs);
        if (!sacsATransferer || sacsATransferer <= 0 || sacsATransferer > item.quantite) {
            Alert.alert("Validation", `Le nombre de sacs doit être supérieur à 0 et inférieur ou égal au stock disponible (${item.quantite}).`); return;
        }
        if (!user?.magasinID || !user?.locationID || !user?.name) {
            Alert.alert("Erreur", "Utilisateur non authentifié ou informations manquantes."); return;
        }
        // --- Fin Validations ---

        setIsSubmitting(true);

        const transfertData: TransfertDto = {
            campagneID: campagneActuelle,
            lotID: item.lotID,
            produitID: item.produitID,
            certificationID: detailedLot.certificationID ?? item.certificationID, 
            numeroLot: detailedLot.numeroLot,
            exportateurID: detailedLot.exportateurID,
            siteID: user.locationID,
            magasinExpeditionID: user.magasinID,
            creationUtilisateur: user.name,
            numBordereauExpedition: numBordereau.trim(),
            nombreSacsExpedition: sacsATransferer,
            immTracteurExpedition: tracteur.trim(),
            immRemorqueExpedition: remorque.trim(),
            dateExpedition: new Date().toISOString(),
            commentaireExpedition: commentaire.trim(),
            magReceptionTheoID: parseInt(destinationMagasinId, 10) || 0,
            modeTransfertID: transfertMode === 'total' ? 1 : 2,
            typeOperationID: operationType === 'transfert' ? 1 : (operationType === 'empotage' ? 2 : 3),
            mouvementTypeID: parseInt(mouvementTypeID, 10),
            statut: "NA",
            sacTypeID: 1, 

            // Champs lus depuis l'état (calculés ou saisis)
            nombrePaletteExpedition: parseInt(nombrePalettes, 10) || 0,
            poidsBrutExpedition: parseFloat(poidsBrut) || 0,
            poidsNetExpedition: parseFloat(poidsNet) || 0,
            tareSacsExpedition: parseFloat(tareSacs) || 0,
            tarePaletteExpedition: parseFloat(tarePalettes) || 0,
        };

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

    if (isLoading) {
        return (
            <View style={[Styles.container, Styles.loader]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={Styles.loadingText}>Chargement des détails du lot...</Text>
            </View>
        );
    }

    // --- LOGIQUE MISE À JOUR : 'isEditable' ---
    const isEditable = transfertMode === 'partiel';

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
                    <InfoRow label="Sacs (Stock Magasin)" value={item.quantite} />
                    <InfoRow label="Poids Net (Stock)" value={`${item.poidsNetAccepte?.toFixed(2)} kg`} />
                    <InfoRow label="Poids Brut (Stock)" value={`${item.poidsBrut?.toFixed(2)} kg`} />
                    <InfoRow label="Sacs (Total Lot)" value={detailedLot?.nombreSacs} />
                </View>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>
                    
                    <CustomTextInput placeholder="Numéro du Bordereau *" value={numBordereau} onChangeText={setNumBordereau} />
                    
                    {/* Sélecteurs (Opération, Mouvement, Mode, Destination) */}
                    <View style={localStyles.pickerContainer}>
                        <Picker selectedValue={operationType} onValueChange={(itemValue) => setOperationType(itemValue)} style={localStyles.pickerText}>
                            <Picker.Item label="Type d'opération *" value="" enabled={false} style={{ color: '#999999' }}/>
                            <Picker.Item label='Transfert inter-magasin' value='transfert' />
                            <Picker.Item label='Sortie pour empotage' value='empotage' />
                            <Picker.Item label='Sortie pour export' value='export' />
                        </Picker>
                    </View>
                    <View style={localStyles.pickerContainer}>
                        <Picker selectedValue={mouvementTypeID} onValueChange={(itemValue) => setMouvementTypeID(itemValue)} style={localStyles.pickerText}>
                            <Picker.Item label="Type de Mouvement *" value="" enabled={false} style={{ color: '#999999' }}/>
                            {mouvementTypes.map(mvt => (
                                <Picker.Item key={mvt.id} label={mvt.designation} value={mvt.id.toString()} />
                            ))}
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
                    
                    {/* Champs Tracteur / Remorque (Editables) */}
                    <CustomTextInput placeholder="Tracteur" value={tracteur} onChangeText={setTracteur} />
                    <CustomTextInput placeholder="Remorque" value={remorque} onChangeText={setRemorque} />

                    {/* --- NOUVELLE LOGIQUE DE CALCUL (Champs ordonnés) --- */}

                    {/* 1. Nombre de sacs (Éditable si partiel) */}
                    <CustomTextInput
                        placeholder="Nombre de sacs à transférer *"
                        value={nombreSacs?.toString() || ''}
                        onChangeText={(text) => setNombreSacs(text ? parseInt(text.replace(/[^0-9]/g, ''), 10) : undefined)}
                        editable={isEditable}
                        keyboardType="numeric"
                        style={!isEditable ? localStyles.disabledInput : {}}
                    />
                    
                    {/* 2. Nombre de palettes (Calculé, Read-only) */}
                    <CustomTextInput
                        placeholder="Nombre de palettes"
                        value={nombrePalettes}
                        editable={false}
                        style={localStyles.disabledInput}
                    />

                    {/* 3. Poids Brut (Calculé, Read-only) */}
                    <CustomTextInput
                        placeholder="Poids Brut (calculé)"
                        value={poidsBrut}
                        editable={false}
                        style={localStyles.disabledInput}
                    />

                    {/* 4. Tare Sacs (Éditable si partiel) */}
                    <CustomTextInput
                        placeholder="Tare Sacs"
                        value={tareSacs}
                        onChangeText={setTareSacs} 
                        editable={isEditable}
                        keyboardType="numeric"
                        style={!isEditable ? localStyles.disabledInput : {}}
                    />

                    {/* 5. Tare Palettes (Éditable si partiel) */}
                    <CustomTextInput
                        placeholder="Tare Palettes"
                        value={tarePalettes}
                        onChangeText={setTarePalettes} 
                        editable={isEditable}
                        keyboardType="numeric"
                        style={!isEditable ? localStyles.disabledInput : {}}
                    />

                    {/* 6. Poids Net (Calculé, Read-only) */}
                     <CustomTextInput
                        placeholder="Poids Net (calculé)"
                        value={poidsNet}
                        editable={false}
                        style={localStyles.disabledInput}
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

// Styles locaux (inchangés)
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
        color: Colors.textDark, 
    },
});

export default TransfertScreen;

