import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TransfertLot } from '../Shared/type';
// --- MODIFICATION --- : Import des types locaux
import { ReceptionData, DropdownItem } from './type';
import { validerReception } from './routes';
// --- MODIFICATION --- : Import du loader de types
import { getMouvementStockTypes } from '../Shared/route';
import CustomTextInput from '../Shared/components/CustomTextInput';

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}><Text style={localStyles.infoLabel}>{label}</Text><Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text></View>
);

const ReceptionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params as { item: TransfertLot }; // 'item' est le TransfertLot

    // --- États du formulaire ---
    const [numBordereau, setNumBordereau] = useState('');
    const [tracteur, setTracteur] = useState('');
    const [remorque, setRemorque] = useState('');
    const [commentaire, setCommentaire] = useState('');
    // Pré-remplissage avec les données d'expédition
    const [nombreSacs, setNombreSacs] = useState(item.nombreSacsExpedition?.toString() ?? '');
    const [nombrePalettes, setNombrePalettes] = useState(item.nombrePaletteExpedition?.toString() ?? '');
    const [poidsBrut, setPoidsBrut] = useState(item.poidsBrutExpedition?.toString() ?? '');
    const [poidsNet, setPoidsNet] = useState(item.poidsNetExpedition?.toString() ?? '');
    const [tareSacs, setTareSacs] = useState(item.tareSacsExpedition?.toString() ?? '');
    const [tarePalettes, setTarePalettes] = useState(item.tarePaletteExpedition?.toString() ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- MODIFICATION --- : États pour le nouveau champ
    const [isLoading, setIsLoading] = useState(true);
    const [mouvementTypes, setMouvementTypes] = useState<DropdownItem[]>([]);
    // L'état interne peut garder le PascalCase, ce n'est pas grave
    const [mouvementTypeID, setMouvementTypeID] = useState<string>(''); // Champ requis par l'API

    // --- MODIFICATION --- : Chargement des types de mouvements
    useEffect(() => {
        const loadMvtTypes = async () => {
            try {
                setIsLoading(true);
                const data = await getMouvementStockTypes();
                setMouvementTypes(data);
            } catch (error: any) {
                Alert.alert("Erreur", "Impossible de charger les types de mouvements.");
            } finally {
                setIsLoading(false);
            }
        };
        loadMvtTypes();
    }, []);


    const handleValidation = async () => {
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur d'utilisateur", "Vos informations utilisateur sont incomplètes. Impossible de continuer.");
            return;
        }
        
        // --- MODIFICATION --- : Ajout de mouvementTypeID à la validation
        const requiredFields = [
            { name: 'N° Bordereau Réception', value: numBordereau },
            { name: 'Tracteur', value: tracteur },
            { name: 'Remorque', value: remorque },
            { name: 'Type de Mouvement', value: mouvementTypeID }, // On valide l'état
            { name: 'Nombre de sacs', value: nombreSacs },
            { name: 'Nombre de palettes', value: nombrePalettes },
            { name: 'Poids Brut Réception', value: poidsBrut },
            { name: 'Poids Net Réception', value: poidsNet },
            { name: 'Tare Sacs Réception', value: tareSacs },
            { name: 'Tare Palettes Réception', value: tarePalettes },
        ];
        // ... (validation des champs vides inchangée) ...
        for (const field of requiredFields) {
            if (!field.value || !field.value.trim()) { // Ajout vérification 'undefined' et 'trim'
                Alert.alert("Champ obligatoire", `Veuillez remplir le champ : ${field.name}`);
                return;
            }
        }

        // Note: La validation numérique commence à l'index 3 (Type de Mouvement)
        const numericFields = requiredFields.slice(3); 
        for (const field of numericFields) {
            if (isNaN(parseFloat(field.value))) {
                Alert.alert("Valeur invalide", `Le champ "${field.name}" doit être un nombre valide.`);
                return;
            }
        }

        setIsSubmitting(true);

        // --- MODIFICATION --- : Correction de la clé en 'mouvementTypeId' (camelCase)
        const receptionData: ReceptionData = {
            dateReception: new Date().toISOString(),
            destinationID: user.magasinID,
            modificationUser: user.name,
            numBordereauRec: numBordereau.trim(),
            immTracteurRec: tracteur.trim(),
            immRemorqueRec: remorque.trim(),
            commentaireRec: commentaire.trim(),
            nombreSac: parseInt(nombreSacs, 10) || 0,
            nombrePalette: parseInt(nombrePalettes, 10) || 0,
            poidsBrut: parseFloat(poidsBrut) || 0,
            poidsNetRecu: parseFloat(poidsNet) || 0,
            tareSacRecu: parseFloat(tareSacs) || 0,
            tarePaletteArrive: parseFloat(tarePalettes) || 0,
            statut: 'RE',
            rowVersionKey: item.rowVersionKey,
            mouvementTypeId: parseInt(mouvementTypeID, 10), // Clé corrigée (camelCase)
        };

        try {
            await validerReception(item.id, receptionData);
            Toast.show({ type: 'success', text1: 'Opération Réussie', text2: `Le lot ${item.numeroLot} est entré en stock.` });
            navigation.goBack();
        } catch (receptionError: any) {
            // L'erreur est déjà formatée par le 'routes.ts' mis à jour
            Alert.alert("Échec de la Réception", receptionError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- MODIFICATION --- : Ajout du loader pendant le chargement des types
    if (isLoading) {
        return (
            <View style={[Styles.container, Styles.loader]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={Styles.loadingText}>Chargement...</Text>
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
                </View>

                <View style={localStyles.sectionContainer}>
                    <Text style={localStyles.sectionTitle}>Détails de la Réception</Text>
                    
                    {/* --- MODIFICATION --- : Ajout du Picker */}
                    <View style={localStyles.pickerContainer}>
                        <Picker 
                            selectedValue={mouvementTypeID} 
                            onValueChange={(itemValue) => setMouvementTypeID(itemValue)} 
                            style={localStyles.pickerText}
                            enabled={!isLoading}
                        >
                            <Picker.Item label="Type de Mouvement *" value="" enabled={false} style={{ color: '#999999' }}/>
                            {mouvementTypes.map(mvt => (
                                <Picker.Item key={mvt.id} label={mvt.designation} value={mvt.id.toString()} />
                            ))}
                        </Picker>
                    </View>
                    
                    <CustomTextInput placeholder="N° Bordereau Réception *" value={numBordereau} onChangeText={setNumBordereau} />
                    <CustomTextInput placeholder="Tracteur *" value={tracteur} onChangeText={setTracteur} />
                    <CustomTextInput placeholder="Remorque *" value={remorque} onChangeText={setRemorque} />
                    <CustomTextInput placeholder="Nombre de sacs *" value={nombreSacs} onChangeText={setNombreSacs} keyboardType="numeric" />
                    <CustomTextInput placeholder="Nombre de palettes *" value={nombrePalettes} onChangeText={setNombrePalettes} keyboardType="numeric" />
                    <CustomTextInput placeholder="Poids Brut Réception *" value={poidsBrut} onChangeText={setPoidsBrut} keyboardType="decimal-pad" />
                    <CustomTextInput placeholder="Poids Net Réception *" value={poidsNet} onChangeText={setPoidsNet} keyboardType="decimal-pad" />
                    <CustomTextInput placeholder="Tare Sacs Réception *" value={tareSacs} onChangeText={setTareSacs} keyboardType="decimal-pad" />
                    <CustomTextInput placeholder="Tare Palettes Réception *" value={tarePalettes} onChangeText={setTarePalettes} keyboardType="decimal-pad" />
                    <CustomTextInput placeholder="Commentaire" value={commentaire} onChangeText={setCommentaire} multiline />
                </View>

                <View style={Styles.modalButtonContainer}>
                    <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
                    <Button title="Valider Réception" onPress={handleValidation} color={Colors.primary} disabled={isSubmitting || isLoading} />
                </View>
            </View>
        </ScrollView>
    );
};

// ... (localStyles inchangés) ...
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
    infoValue: { fontSize: 16, fontWeight: '500', color: '#000', },
    // --- MODIFICATION --- : Ajout des styles manquants
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

export default ReceptionScreen;

