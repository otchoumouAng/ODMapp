import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, Button, Alert, ScrollView, StyleSheet,
    ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control'; // <-- NOUVEL IMPORT
import Toast from 'react-native-toast-message';
import { Magasin, DropdownItem, StockLot, TransfertDto, LotDetail } from './type';
import { getMagasins, getMouvementStockTypes, getParametres } from '../Shared/route';
import { createTransfert, getLotById } from './routes';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style'; // Assurez-vous que Colors.background existe
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import CustomTextInput from '../Shared/components/CustomTextInput';

type TransfertScreenRouteParams = {
    item: StockLot;
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

const FormLabel = ({ text }: { text: string }) => (
    <Text style={localStyles.formLabel}>{text}</Text>
);

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
    
    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [mouvementTypes, setMouvementTypes] = useState<DropdownItem[]>([]);
    const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [campagneActuelle, setCampagneActuelle] = useState<string>('');
    const [detailedLot, setDetailedLot] = useState<LotDetail | null>(null);

    const [nombreSacs, setNombreSacs] = useState<number | undefined>();
    const [nombrePalettes, setNombrePalettes] = useState<string>('0');
    const [poidsBrut, setPoidsBrut] = useState<string>('0');
    const [tareSacs, setTareSacs] = useState<string>('0');
    const [tarePalettes, setTarePalettes] = useState<string>('0'); 
    const [poidsNet, setPoidsNet] = useState<string>('0'); 


    // Chargement des données... (INCHANGÉ)
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

    // Gère le changement de "Type d'opération"... (INCHANGÉ)
    useEffect(() => {
        if (operationType === 'export') {
            setDestinationMagasinId('1000'); 
        } else if (operationType !== 'transfert' && operationType !== 'empotage') {
            setDestinationMagasinId(''); 
        }
    }, [operationType]);


    // Hook 1 (Mode Change)... (INCHANGÉ)
    useEffect(() => {
        if (!item || !detailedLot) return;
        if (transfertMode === 'total') {
            const sacs = item.quantite;
            const brut = item.poidsBrut; 
            const net = item.poidsNetAccepte;
            const palettes = Math.ceil(sacs / SACS_PAR_PALETTE);
            
            const tareSacUnitaire = detailedLot.nombreSacs ? (detailedLot.tareSacs / detailedLot.nombreSacs) : 0;
            const tarePaletteUnitaire = detailedLot.nombreSacs ? (detailedLot.tarePalettes / detailedLot.nombreSacs) : 0;

            const tSacsCalculee = tareSacUnitaire * sacs;
            const tPalCalculee = tarePaletteUnitaire * sacs;

            setNombreSacs(sacs);
            setNombrePalettes(formatNumber(palettes));
            setPoidsBrut(formatNumber(brut));
            setTareSacs(formatNumber(tSacsCalculee)); 
            setTarePalettes(formatNumber(tPalCalculee));
            setPoidsNet(formatNumber(net)); 
        } else {
            setNombreSacs(undefined); 
            setNombrePalettes('0');
            setPoidsBrut('0');
            setTareSacs('0');
            setTarePalettes('0');
// @ts-ignore
            setPoidsNet('0');
        }
    }, [transfertMode, item, detailedLot]); 

    // Hook 2 (Calcul Partiel - Sacs)... (INCHANGÉ)
    useEffect(() => {
        if (transfertMode !== 'partiel') return; 
        const sacsNum = nombreSacs ? Number(nombreSacs) : 0;

        if (sacsNum <= 0) {
            setPoidsBrut('0');
            setTareSacs('0');
            setNombrePalettes('0');
            return;
        }
        const newPoidsBrut = sacsNum * POIDS_BRUT_PAR_SAC;
        const newTareSacs = Math.round(sacsNum * TARE_SAC_RATIO); 
        const newPalettes = Math.ceil(sacsNum / SACS_PAR_PALETTE);

        setPoidsBrut(formatNumber(newPoidsBrut));
        setTareSacs(formatNumber(newTareSacs));
        setNombrePalettes(newPalettes.toString());
    }, [nombreSacs, transfertMode]); 

    // Hook 3 (Calcul Partiel - Poids Net)... (INCHANGÉ)
    useEffect(() => {
        if (transfertMode !== 'partiel') return; 
        const brut = parseFloat(poidsBrut) || 0;
        const tSacs = parseFloat(tareSacs) || 0;
        const tPalettes = parseFloat(tarePalettes) || 0;
        const newPoidsNet = brut - tSacs - tPalettes;
        setPoidsNet(formatNumber(newPoidsNet));
    }, [poidsBrut, tareSacs, tarePalettes, transfertMode]); 


    // handleTransfert (Logique inchangée)
    const handleTransfert = async () => {
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
            <View style={[localStyles.pageContainer, localStyles.loaderContainer]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={Styles.loadingText}>Chargement des détails...</Text>
            </View>
        );
    }

    const isEditable = transfertMode === 'partiel';
    // --- NOUVELLE VARIABLE ---
    const modeIndex = transfertMode === 'total' ? 0 : (transfertMode === 'partiel' ? 1 : -1);

    return (
        // --- NOUVELLE STRUCTURE (SafeAreaView + KeyboardAvoidingView) ---
        <SafeAreaView style={localStyles.pageContainer}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={localStyles.scrollContainer} 
                    contentContainerStyle={localStyles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={Styles.modalTitle}>SORTIE DU LOT</Text>
                    <Text style={localStyles.lotNumberHeader}>{item.reference}</Text>
                    <Text style={localStyles.campagneHeader}>Campagne : {campagneActuelle}</Text>

                    {/* --- CARTE 1 : Infos Lot --- */}
                    <View style={localStyles.sectionContainer}>
                        <Text style={localStyles.sectionTitle}>Détails du Stock</Text>
                        <InfoRow label="Produit" value={item.libelleProduit} />
                        <InfoRow label="Certification" value={item.nomCertification} />
                        <InfoRow label="Sacs (Stock Magasin)" value={item.quantite} />
                        <InfoRow label="Poids Net (Stock)" value={`${item.poidsNetAccepte?.toFixed(2)} kg`} />
                        <InfoRow label="Poids Brut (Stock)" value={`${item.poidsBrut?.toFixed(2)} kg`} />
                        <InfoRow label="Sacs (Total Lot)" value={detailedLot?.nombreSacs} />
                    </View>

                    {/* --- CARTE 2 : Opération --- */}
                    <View style={localStyles.sectionContainer}>
                        <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>
                        
                        <FormLabel text="Numéro du Bordereau *" />
                        <CustomTextInput placeholder="Saisir le numéro..." value={numBordereau} onChangeText={setNumBordereau} style={localStyles.inputMargin} />
                        
                        <FormLabel text="Type d'opération *" />
                        <View style={localStyles.pickerContainer}>
                            <Picker selectedValue={operationType} onValueChange={(itemValue) => setOperationType(itemValue)} style={localStyles.pickerText}>
                                <Picker.Item label="Sélectionner un type..." value="" enabled={false} style={{ color: '#999999' }}/>
                                <Picker.Item label='Transfert inter-magasin' value='transfert' />
                                <Picker.Item label='Sortie pour empotage' value='empotage' />
                                <Picker.Item label='Sortie pour export' value='export' />
                            </Picker>
                        </View>

                        <FormLabel text="Type de Mouvement *" />
                        <View style={localStyles.pickerContainer}>
                            <Picker selectedValue={mouvementTypeID} onValueChange={(itemValue) => setMouvementTypeID(itemValue)} style={localStyles.pickerText}>
                                <Picker.Item label="Sélectionner un mouvement..." value="" enabled={false} style={{ color: '#999999' }}/>
                                {mouvementTypes.map(mvt => (
                                    <Picker.Item key={mvt.id} label={mvt.designation} value={mvt.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                        
                        <FormLabel text={operationType === 'export' ? "Destination" : "Destination *"} />
                        {operationType === 'transfert' || operationType === 'empotage' ? (
                            <View style={localStyles.pickerContainer}>
                                <Picker selectedValue={destinationMagasinId} onValueChange={(itemValue) => setDestinationMagasinId(itemValue)} style={localStyles.pickerText}>
                                    <Picker.Item label="Sélectionner un magasin..." value="" enabled={false} style={{ color: '#999999' }}/>
                                    {magasins.map(magasin => (
                                        <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        ) : (
                            <CustomTextInput placeholder="Destination" value={operationType === 'export' ? "Sortie pour Export" : "N/A"} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />
                        )}
                        
                        <FormLabel text="Tracteur" />
                        <CustomTextInput placeholder="N° immatriculation tracteur" value={tracteur} onChangeText={setTracteur} style={localStyles.inputMargin} />
                        
                        <FormLabel text="Remorque" />
                        <CustomTextInput placeholder="N° immatriculation remorque" value={remorque} onChangeText={setRemorque} style={localStyles.inputMargin} />

                    </View>

                    {/* --- CARTE 3 : Calcul --- */}
                    <View style={localStyles.sectionContainer}>
                        <Text style={localStyles.sectionTitle}>Quantités à sortir</Text>

                        <FormLabel text="Mode de transfert *" />
                        {/* --- COMPOSANT "OUF" --- */}
                        <SegmentedControl
                            values={['Total', 'Partiel']}
                            selectedIndex={modeIndex}
                            onChange={(event) => {
                                const newMode = event.nativeEvent.selectedSegmentIndex === 0 ? 'total' : 'partiel';
                                setTransfertMode(newMode);
                            }}
                            style={localStyles.inputMargin}
                            tintColor={Colors.primary}
                        />

                        {/* 1. Nombre de sacs */}
                        <FormLabel text="Nombre de sacs *" />
                        <CustomTextInput
                            placeholder="Saisir le nombre de sacs"
                            value={nombreSacs?.toString() || ''}
                            onChangeText={(text) => setNombreSacs(text ? parseInt(text.replace(/[^0-9]/g, ''), 10) : undefined)}
                            editable={isEditable}
                            keyboardType="numeric"
                            style={[!isEditable ? localStyles.disabledInput : {}, localStyles.inputMargin]}
                        />
                        
                        {/* 2. Nombre de palettes */}
                        <FormLabel text="Nombre de palettes (calculé)" />
                        <CustomTextInput
                            placeholder="Nombre de palettes"
                            value={nombrePalettes}
                            editable={false}
                            style={[localStyles.disabledInput, localStyles.inputMargin]}
                        />

                        {/* 3. Poids Brut */}
                        <FormLabel text="Poids Brut (calculé)" />
                        <CustomTextInput
                            placeholder="Poids Brut (calculé)"
                            value={poidsBrut}
                            editable={false}
                            style={[localStyles.disabledInput, localStyles.inputMargin]}
                        />

                        {/* 4. Tare Sacs */}
                        <FormLabel text="Tare Sacs" />
                        <CustomTextInput
                            placeholder={isEditable ? "Saisir la tare sacs" : "Tare Sacs"}
                            value={tareSacs}
                            onChangeText={setTareSacs} 
                            editable={isEditable}
                            keyboardType="numeric"
                            style={[!isEditable ? localStyles.disabledInput : {}, localStyles.inputMargin]}
                        />

                        {/* 5. Tare Palettes */}
                        <FormLabel text="Tare Palettes" />
                        <CustomTextInput
                            placeholder={isEditable ? "Saisir la tare palettes" : "Tare Palettes"}
                            value={tarePalettes}
                            onChangeText={setTarePalettes} 
                            editable={isEditable}
                            keyboardType="numeric"
                            style={[!isEditable ? localStyles.disabledInput : {}, localStyles.inputMargin]}
                        />

                        {/* 6. Poids Net */}
                        <FormLabel text="Poids Net (calculé)" />
                        <CustomTextInput
                            placeholder="Poids Net (calculé)"
                            value={poidsNet}
                            editable={false}
                            style={[localStyles.disabledInput, localStyles.inputMargin]}
                        />
                        
                        <FormLabel text="Commentaire" />
                        <CustomTextInput placeholder="Ajouter un commentaire (optionnel)" value={commentaire} onChangeText={setCommentaire} multiline />
                    </View>

                </ScrollView>

                {/* --- NOUVEAU FOOTER D'ACTION (Sticky) --- */}
                <View style={localStyles.footerContainer}>
                    <View style={localStyles.footerButtonWrapper}>
                        <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
                    </View>
                    <View style={localStyles.footerButtonWrapper}>
                        <Button title="Valider Sortie" onPress={handleTransfert} color={Colors.primary} disabled={isSubmitting || isLoading} />
                    </View>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- NOUVEAUX STYLES "OUF" ---
const localStyles = StyleSheet.create({
    // --- NOUVELLE STRUCTURE DE PAGE ---
    pageContainer: {
        flex: 1,
        backgroundColor: Colors.background || '#f4f7f8', // Un fond gris clair
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40, // Espace en bas du scroll
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- NOUVEAU FOOTER ---
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16, // Safe area
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerButtonWrapper: {
        flex: 1,
        marginHorizontal: 8,
    },

    // --- DESIGN "CARTE" ---
    sectionContainer: {
        backgroundColor: '#fff',
        borderRadius: 12, // Plus arrondi
        padding: 16,
        marginBottom: 24, // Plus d'espace
        // Ombre Android
        elevation: 3,
        // Ombre iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },

    // --- TYPOGRAPHIE AMÉLIORÉE ---
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16, // Plus d'espace
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    lotNumberHeader: {
        textAlign: 'center',
        fontSize: 24, // Plus grand
        fontWeight: 'bold',
        color: Colors.primary, // Couleur primaire
        marginBottom: 8,
    },
    campagneHeader: {
        textAlign: 'center',
        fontSize: 16,
        color: Colors.darkGray,
        marginBottom: 20,
    },

    // --- INFOS (INCHANGÉ) ---
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 15,
        color: Colors.darkGray,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.dark,
        textAlign: 'right'
    },

    // --- CHAMPS DE FORMULAIRE ---
    formLabel: {
        fontSize: 15, // Plus lisible
        fontWeight: '600', // Semi-bold
        color: '#333', // Plus sombre
        marginBottom: 8,
        marginLeft: 2, 
    },
    inputMargin: {
      marginBottom: 20, // Espace unifié sous les inputs/pickers
    },
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        borderRadius: 5, // Match CustomTextInput
    },
    pickerContainer: {
        backgroundColor: '#f9f9f9', // Léger fond
        borderColor: '#ddd', 
        borderWidth: 1,
        borderRadius: 8, // Match cartes
        marginBottom: 20, // Espace unifié
        justifyContent: 'center',
    },
    pickerText: {
        color: Colors.textDark, 
    },
});

export default TransfertScreen;