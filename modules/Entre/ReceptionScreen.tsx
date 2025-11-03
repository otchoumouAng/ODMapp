import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker'; // Ajout de Picker
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TransfertLot, DropdownItem } from '../Shared/type'; // Ajout de DropdownItem
import { ReceptionData } from './type';
import { validerReception } from './routes';
import { getMouvementStockTypes } from '../Shared/route'; // Ajout de l'import
import CustomTextInput from '../Shared/components/CustomTextInput';

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}><Text style={localStyles.infoLabel}>{label}</Text><Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text></View>
);

const ReceptionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params as { item: TransfertLot };

    // --- LOGIQUE MISE À JOUR ---
    // Tous les états sont pré-remplis avec les données de l'expédition
    const [numBordereau, setNumBordereau] = useState(item.numBordereauExpedition ?? '');
    const [tracteur, setTracteur] = useState(item.immTracteurExpedition ?? '');
    const [remorque, setRemorque] = useState(item.immRemorqueExpedition ?? '');
    const [nombreSacs, setNombreSacs] = useState(item.nombreSacsExpedition?.toString() ?? '0');
    const [nombrePalettes, setNombrePalettes] = useState(item.nombrePaletteExpedition?.toString() ?? '0');
    const [poidsBrut, setPoidsBrut] = useState(item.poidsBrutExpedition?.toString() ?? '0');
    const [poidsNet, setPoidsNet] = useState(item.poidsNetExpedition?.toString() ?? '0');
    const [tareSacs, setTareSacs] = useState(item.tareSacsExpedition?.toString() ?? '0');
    const [tarePalettes, setTarePalettes] = useState(item.tarePaletteExpedition?.toString() ?? '0');
    
    // Le seul champ éditable
    const [commentaire, setCommentaire] = useState('');

    // États pour le type de mouvement (maintenant auto-sélectionné)
    const [mouvementTypes, setMouvementTypes] = useState<DropdownItem[]>([]);
    const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
    
    const [loading, setLoading] = useState(true); // Gère le chargement des types de mvt
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- LOGIQUE MISE À JOUR ---
    // Charge les types de mouvement et sélectionne "31" (Réception) par défaut
    useEffect(() => {
        const loadMouvementTypes = async () => {
            setLoading(true);
            try {
                const data = await getMouvementStockTypes();
                setMouvementTypes(data);
                
                // Trouve le type de mouvement "31" (basé sur l'exemple Postman)
                const defaultReceptionType = data.find(m => m.id === 31);
                
                if (defaultReceptionType) {
                    setMouvementTypeID(defaultReceptionType.id.toString());
                } else if (data.length > 0) {
                    // Fallback si 31 n'existe pas (ne devrait pas arriver)
                    Alert.alert("Erreur de configuration", "Type de mouvement '31' introuvable.");
                    setMouvementTypeID(data[0].id.toString());
                }
            } catch (error) {
                console.error("Failed to load mouvement types:", error);
                Alert.alert("Erreur", "Impossible de charger les types de mouvements.");
            } finally {
                setLoading(false);
            }
        };
        loadMouvementTypes();
    }, []);


    const handleValidation = async () => {
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur d'utilisateur", "Vos informations utilisateur sont incomplètes.");
            return;
        }
        
        // Validation simple, car tout est pré-rempli
        if (!mouvementTypeID) {
            Alert.alert("Patientez", "Le type de mouvement est en cours de chargement.");
            return;
        }

        setIsSubmitting(true);

        // --- LOGIQUE MISE À JOUR ---
        // Les données sont lues depuis les états pré-remplis
        const receptionData: ReceptionData = {
            dateReception: new Date().toISOString(),
            destinationID: user.magasinID,
            modificationUser: user.name,
            
            // Données pré-remplies (lecture seule)
            numBordereauRec: numBordereau.trim(),
            immTracteurRec: tracteur.trim(),
            immRemorqueRec: remorque.trim(),
            nombreSac: parseInt(nombreSacs, 10) || 0,
            nombrePalette: parseInt(nombrePalettes, 10) || 0,
            poidsBrut: parseFloat(poidsBrut) || 0,
            poidsNetRecu: parseFloat(poidsNet) || 0,
            tareSacRecu: parseFloat(tareSacs) || 0,
            tarePaletteArrive: parseFloat(tarePalettes) || 0,
            mouvementTypeId: parseInt(mouvementTypeID, 10), // Corrigé en 'mouvementTypeId'
            
            // Seul champ éditable
            commentaireRec: commentaire.trim(),

            statut: 'RE',
            rowVersionKey: item.rowVersionKey,
        };

        try {
            await validerReception(item.id, receptionData);
            Toast.show({ type: 'success', text1: 'Opération Réussie', text2: `Le lot ${item.numeroLot} est entré en stock.` });
            navigation.goBack();
        } catch (receptionError: any) {
            const errorMessage = receptionError.message || 'Erreur inconnue';
            Alert.alert("Échec de la Réception", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[Styles.container, Styles.loader]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={Styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={Styles.container}>
            <View style={localStyles.pageContainer}>
                <Text style={Styles.modalTitle}>RÉCEPTION DU LOT</Text>
                <Text style={localStyles.lotNumberHeader}>{item.numeroLot}</Text>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails de l'Expédition</Text>
                    <InfoRow label="Magasin Expéditeur" value={item.magasinExpeditionNom} />
                    <InfoRow label="Sacs Expédiés" value={item.nombreSacsExpedition} />
                    <InfoRow label="Poids Net Expédié" value={`${item.poidsNetExpedition?.toFixed(2)} kg`} />
                    <InfoRow label="N° Bordereau Exp." value={item.numBordereauExpedition} />
                    <InfoRow label="Tracteur Exp." value={item.immTracteurExpedition} />
                    <InfoRow label="Remorque Exp." value={item.immRemorqueExpedition} />
                </View>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails de la Réception</Text>
                    
                    {/* --- LOGIQUE MISE À JOUR : Champs en lecture seule --- */}
                    
                    <CustomTextInput 
                        placeholder="N° Bordereau Réception *" 
                        value={numBordereau} 
                        onChangeText={setNumBordereau} 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    <CustomTextInput 
                        placeholder="Tracteur *" 
                        value={tracteur} 
                        onChangeText={setTracteur} 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    <CustomTextInput 
                        placeholder="Remorque *" 
                        value={remorque} 
                        onChangeText={setRemorque} 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    
                    <View style={[localStyles.pickerContainer, localStyles.disabledPicker]}>
                        <Picker 
                            selectedValue={mouvementTypeID} 
                            onValueChange={(itemValue) => setMouvementTypeID(itemValue)} 
                            style={localStyles.pickerText}
                            enabled={false} // Désactivé
                        >
                            <Picker.Item label="Type de Mouvement *" value="" style={{ color: '#999999' }}/>
                            {mouvementTypes.map(mvt => (
                                <Picker.Item key={mvt.id} label={mvt.designation} value={mvt.id.toString()} />
                            ))}
                        </Picker>
                    </View>

                    <CustomTextInput 
                        placeholder="Nombre de sacs *" 
                        value={nombreSacs} 
                        onChangeText={setNombreSacs} 
                        keyboardType="numeric" 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    <CustomTextInput 
                        placeholder="Nombre de palettes *" 
                        value={nombrePalettes} 
                        onChangeText={setNombrePalettes} 
                        keyboardType="numeric" 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    <CustomTextInput 
                        placeholder="Poids Brut Réception *" 
                        value={poidsBrut} 
                        onChangeText={setPoidsBrut} 
                        keyboardType="decimal-pad" 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    <CustomTextInput 
                        placeholder="Poids Net Réception *" 
                        value={poidsNet} 
                        onChangeText={setPoidsNet} 
                        keyboardType="decimal-pad" 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    <CustomTextInput 
                        placeholder="Tare Sacs Réception *" 
                        value={tareSacs} 
                        onChangeText={setTareSacs} 
                        keyboardType="decimal-pad" 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    <CustomTextInput 
                        placeholder="Tare Palettes Réception *" 
                        value={tarePalettes} 
                        onChangeText={setTarePalettes} 
                        keyboardType="decimal-pad" 
                        editable={false} 
                        style={localStyles.disabledInput}
                    />
                    
                    {/* Seul champ éditable */}
                    <CustomTextInput 
                        placeholder="Commentaire" 
                        value={commentaire} 
                        onChangeText={setCommentaire} 
                        multiline 
                        editable={true}
                    />
                </View>

                <View style={Styles.modalButtonContainer}>
                    <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
                    <Button title="Valider Réception" onPress={handleValidation} color={Colors.primary} disabled={isSubmitting || loading} />
                </View>
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    pageContainer: { padding: 20, paddingTop: 40 },
    sectionContainer: { 
        backgroundColor: '#fff', 
        borderRadius: 8, 
        padding: 16, 
        marginBottom: 20, 
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd'
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
    lotNumberHeader: { textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 20, },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, },
    infoLabel: { fontSize: 16, color: '#666', },
    infoValue: { fontSize: 16, fontWeight: '500', color: '#000', textAlign: 'right' },
    
    // Styles pour les champs désactivés
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d'
    },
    disabledPicker: {
        backgroundColor: '#e9ecef',
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
});

export default ReceptionScreen;

