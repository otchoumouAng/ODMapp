import React, { useState, useContext, useEffect } from 'react';
import {
    View, Text, Button, Alert, ScrollView, StyleSheet,
    ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
// Il n'y a plus besoin de Picker ici, on peut le supprimer
// import { Picker } from '@react-native-picker/picker'; 
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TransfertLot, DropdownItem } from '../Shared/type';
import { ReceptionData } from './type';
import { validerReception } from './routes';
import { getMouvementStockTypes } from '../Shared/route';
import CustomTextInput from '../Shared/components/CustomTextInput';

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}>
        <Text style={localStyles.infoLabel}>{label}</Text>
        <Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text>
    </View>
);

// Ajout du composant FormLabel (si vous ne l'avez pas dans un fichier partagé)
const FormLabel = ({ text }: { text: string }) => (
    <Text style={localStyles.formLabel}>{text}</Text>
);

const ReceptionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params as { item: TransfertLot };

    // --- LOGIQUE MISE À JOUR (INCHANGÉE) ---
    // Les états sont toujours nécessaires pour être envoyés à l'API,
    // même s'ils ne sont plus affichés dans des inputs.
    const [numBordereau] = useState(item.numBordereauExpedition ?? '');
    const [tracteur] = useState(item.immTracteurExpedition ?? '');
    const [remorque] = useState(item.immRemorqueExpedition ?? '');
    const [nombreSacs] = useState(item.nombreSacsExpedition?.toString() ?? '0');
    const [nombrePalettes] = useState(item.nombrePaletteExpedition?.toString() ?? '0');
    const [poidsBrut] = useState(item.poidsBrutExpedition?.toString() ?? '0');
    const [poidsNet] = useState(item.poidsNetExpedition?.toString() ?? '0');
    const [tareSacs] = useState(item.tareSacsExpedition?.toString() ?? '0');
    const [tarePalettes] = useState(item.tarePaletteExpedition?.toString() ?? '0');
    
    // Le seul champ éditable
    const [commentaire, setCommentaire] = useState('');

    const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
    const [mouvementTypeNom, setMouvementTypeNom] = useState<string>('Chargement...'); // Pour l'affichage
    
    const [loading, setLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadMouvementTypes = async () => {
            setLoading(true);
            try {
                const data = await getMouvementStockTypes();
                const defaultReceptionType = data.find(m => m.id === 31);
                
                if (defaultReceptionType) {
                    setMouvementTypeID(defaultReceptionType.id.toString());
                    setMouvementTypeNom(defaultReceptionType.designation); // Stocker le nom
                } else {
                    Alert.alert("Erreur de configuration", "Type de mouvement '31' introuvable.");
                    if (data.length > 0) {
                        setMouvementTypeID(data[0].id.toString());
                        setMouvementTypeNom(data[0].designation);
                    }
                }
            } catch (error) {
                console.error("Failed to load mouvement types:", error);
                Alert.alert("Erreur", "Impossible de charger les types de mouvements.");
                setMouvementTypeNom('Erreur');
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
        
        if (!mouvementTypeID) {
            Alert.alert("Patientez", "Le type de mouvement est en cours de chargement.");
            return;
        }

        setIsSubmitting(true);

        const receptionData: ReceptionData = {
            dateReception: new Date().toISOString(),
            destinationID: user.magasinID,
            modificationUser: user.name,
            numBordereauRec: numBordereau.trim(),
            immTracteurRec: tracteur.trim(),
            immRemorqueRec: remorque.trim(),
            nombreSac: parseInt(nombreSacs, 10) || 0,
            nombrePalette: parseInt(nombrePalettes, 10) || 0,
            poidsBrut: parseFloat(poidsBrut) || 0,
            poidsNetRecu: parseFloat(poidsNet) || 0,
            tareSacRecu: parseFloat(tareSacs) || 0,
            tarePaletteArrive: parseFloat(tarePalettes) || 0,
            mouvementTypeId: parseInt(mouvementTypeID, 10),
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

    // --- LE Rendu "Ouf" ---

    if (loading) {
        return (
            <View style={[localStyles.pageContainer, localStyles.loaderContainer]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={Styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
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
                    <Text style={Styles.modalTitle}>RÉCEPTION DU LOT</Text>
                    <Text style={localStyles.lotNumberHeader}>{item.numeroLot}</Text>
                    
                    {/* --- CARTE 1 : Infos Expédition --- */}
                    <View style={localStyles.sectionContainer}>
                        <Text style={localStyles.sectionTitle}>Détails de l'Expédition</Text>
                        <InfoRow label="Magasin Expéditeur" value={item.magasinExpeditionNom} />
                        <InfoRow label="N° Bordereau Exp." value={item.numBordereauExpedition} />
                        <InfoRow label="Tracteur Exp." value={item.immTracteurExpedition} />
                        <InfoRow label="Remorque Exp." value={item.immRemorqueExpedition} />
                    </View>

                    {/* --- CARTE 2 : Données de Réception (Confirmées) --- */}
                    {/* C'est ici le "Ouf". Fini les inputs grisés ! */}
                    <View style={localStyles.sectionContainer}>
                        <Text style={localStyles.sectionTitle}>Données à Confirmer</Text>
                        <InfoRow label="Type de Mouvement" value={mouvementTypeNom} />
                        <InfoRow label="Nombre de sacs" value={nombreSacs} />
                        <InfoRow label="Nombre de palettes" value={nombrePalettes} />
                        
                        {/* Séparateur visuel */}
                        <View style={localStyles.separator} /> 
                        
                        <InfoRow label="Poids Brut" value={`${poidsBrut} kg`} />
                        <InfoRow label="Tare Sacs" value={`${tareSacs} kg`} />
                        <InfoRow label="Tare Palettes" value={`${tarePalettes} kg`} />
                        
                         {/* Séparateur visuel */}
                        <View style={localStyles.separator} /> 

                        {/* Mise en avant du Poids Net */}
                        <InfoRow label="Poids Net Réception" value={poidsNet} /> 
                    </View>

                    {/* --- CARTE 3 : Seul champ éditable --- */}
                    <View style={localStyles.sectionContainer}>
                         <Text style={localStyles.sectionTitle}>Commentaire</Text>
                        <FormLabel text="Ajouter une note (optionnel)" />
                        <CustomTextInput 
                            placeholder="Saisir un commentaire..." 
                            value={commentaire} 
                            onChangeText={setCommentaire} 
                            multiline 
                            editable={true}
                        />
                    </View>

                </ScrollView>
                
                {/* --- FOOTER D'ACTION (Sticky) --- */}
                <View style={localStyles.footerContainer}>
                    <View style={localStyles.footerButtonWrapper}>
                        <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
                    </View>
                    <View style={localStyles.footerButtonWrapper}>
                        <Button title="Valider Réception" onPress={handleValidation} color={Colors.primary} disabled={isSubmitting || loading} />
                    </View>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- STYLES "OUF" (Réutilisés de TransfertScreen) ---
const localStyles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: Colors.background || '#f4f7f8',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerButtonWrapper: {
        flex: 1,
        marginHorizontal: 8,
    },
    sectionContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    lotNumberHeader: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10, // Plus d'espace
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 16,
        color: Colors.darkGray,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold', // Rendre la valeur plus visible
        color: Colors.dark,
        textAlign: 'right',
        flexShrink: 1, // Permet au texte de passer à la ligne si trop long
    },
    formLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 2,
    },
    // NOUVEAU STYLE pour séparer les groupes d'infos
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 8,
    },
    
    // Styles pour les champs désactivés (PLUS UTILISÉS ICI, mais gardés au cas où)
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        borderRadius: 5,
        marginBottom: 15,
    },
    disabledPicker: {
        backgroundColor: '#e9ecef',
        borderRadius: 5,
        marginBottom: 15,
    },
    pickerContainer: {
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

export default ReceptionScreen;