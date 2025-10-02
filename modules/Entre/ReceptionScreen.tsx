import React, { useState, useContext } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TransfertLot } from '../Shared/type';
import { ReceptionData } from './type';
import { validerReception } from './routes';

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}><Text style={localStyles.infoLabel}>{label}</Text><Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text></View>
);

const ReceptionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params as { item: TransfertLot };

    // State pour le formulaire
    const [numBordereau, setNumBordereau] = useState('');
    const [tracteur, setTracteur] = useState('');
    const [remorque, setRemorque] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [nombreSacs, setNombreSacs] = useState(item.nombreSacsExpedition?.toString() ?? '0');
    const [nombrePalettes, setNombrePalettes] = useState(item.nombrePaletteExpedition?.toString() ?? '0');
    const [poidsBrut, setPoidsBrut] = useState(item.poidsBrutExpedition?.toString() ?? '0');
    const [poidsNet, setPoidsNet] = useState(item.poidsNetExpedition?.toString() ?? '0');
    const [tareSacs, setTareSacs] = useState(item.tareSacsExpedition?.toString() ?? '0');
    const [tarePalettes, setTarePalettes] = useState(item.tarePaletteExpedition?.toString() ?? '0');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fichier : modules/Entre/ReceptionScreen.tsx

    const handleValidation = async () => {
        // --- 1. VALIDATION INITIALE DU FORMULAIRE ---
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur d'utilisateur", "Vos informations utilisateur sont incomplètes. Impossible de continuer.");
            return;
        }
        if (!numBordereau.trim()) {
            Alert.alert("Champ requis", "Le numéro de bordereau de réception est obligatoire.");
            return;
        }

        // Validation des champs de poids et de tare
        if (!poidsNet.trim() || !tareSacs.trim() || !tarePalettes.trim()) {
            Alert.alert("Champs obligatoires", "Veuillez remplir le Poids Net, la Tare Sacs et la Tare Palettes.");
            return;
        }

        const parsedPoidsNet = parseFloat(poidsNet);
        const parsedTareSacs = parseFloat(tareSacs);
        const parsedTarePalettes = parseFloat(tarePalettes);

        if (isNaN(parsedPoidsNet) || isNaN(parsedTareSacs) || isNaN(parsedTarePalettes)) {
            Alert.alert("Valeurs invalides", "Les poids et tares doivent être des nombres valides.");
            return;
        }

        setIsSubmitting(true);

        // --- 2. CONSTRUCTION DE L'OBJET 'receptionData' ---
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
            statut: 'RE', // Statut 'Reçu'
            rowVersionKey: item.rowVersionKey,
        };

        // --- 3. JOURNALISATION (LOG) POUR LE DÉBOGAGE ---
        /*console.log('--- CONTEXTE DE DÉBOGAGE POUR LA RÉCEPTION ---');
        console.log(`Lot N°: ${item.numeroLot} (ID du Transfert: ${item.id})`);
        console.log(`Magasin Expéditeur (Original): ${item.magasinExpeditionID}`);
        console.log(`Magasin de Destination (Envoyé): ${receptionData.destinationID}`);
        console.log('-------------------------------------------------');
        console.log('>> 1. Données envoyées à validerReception :', JSON.stringify(receptionData, null, 2));
*/
        // --- 4. EXÉCUTION DE L'APPEL API ---
        try {
            // Appel unique pour valider la réception (ce qui crée aussi le mouvement de stock côté backend)
            await validerReception(item.id, receptionData);

            // SUCCÈS : L'opération a réussi.
            Toast.show({ type: 'success', text1: 'Opération Réussie', text2: `Le lot ${item.numeroLot} est entré en stock.` });
            navigation.goBack();

        } catch (receptionError: any) {
            // GESTION AMÉLIORÉE DES ERREURS DE RÉCEPTION
            const errorMessage = receptionError.message || '';

            if (errorMessage.includes('Prière vérifier le magasin de reception')) {
                // Cas 1 : Erreur spécifique de magasin identique
                Alert.alert(
                    "Action Impossible",
                    "Ce lot ne peut pas être réceptionné dans ce magasin car c'est son point d'expédition d'origine."
                );
            } else {
                // Cas 2 : Toutes les autres erreurs de réception
                Alert.alert("Échec de la Réception", errorMessage);
            }
            
        } finally {
            // Quoi qu'il arrive, on réactive le bouton de soumission.
            setIsSubmitting(false);
        }
    };

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
                    <TextInput style={Styles.filterInput} placeholder="N° Bordereau Réception *" value={numBordereau} onChangeText={setNumBordereau} />
                    <TextInput style={Styles.filterInput} placeholder="Tracteur" value={tracteur} onChangeText={setTracteur} />
                    <TextInput style={Styles.filterInput} placeholder="Remorque" value={remorque} onChangeText={setRemorque} />
                    <TextInput style={Styles.filterInput} placeholder="Nombre de sacs *" value={nombreSacs} onChangeText={setNombreSacs} keyboardType="numeric" />
                    <TextInput style={Styles.filterInput} placeholder="Nombre de palettes *" value={nombrePalettes} onChangeText={setNombrePalettes} keyboardType="numeric" />
                    <TextInput style={Styles.filterInput} placeholder="Poids Brut Réception *" value={poidsBrut} onChangeText={setPoidsBrut} keyboardType="decimal-pad" />
                    <TextInput style={Styles.filterInput} placeholder="Poids Net Réception *" value={poidsNet} onChangeText={setPoidsNet} keyboardType="decimal-pad" />
                    <TextInput style={Styles.filterInput} placeholder="Tare Sacs Réception *" value={tareSacs} onChangeText={setTareSacs} keyboardType="decimal-pad" />
                    <TextInput style={Styles.filterInput} placeholder="Tare Palettes Réception *" value={tarePalettes} onChangeText={setTarePalettes} keyboardType="decimal-pad" />
                    <TextInput style={Styles.filterInput} placeholder="Commentaire" value={commentaire} onChangeText={setCommentaire} multiline />
                </View>

                <View style={Styles.modalButtonContainer}>
                    <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
                    <Button title="Valider Réception" onPress={handleValidation} color={Colors.primary} disabled={isSubmitting} />
                </View>
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    pageContainer: { padding: 20, paddingTop: 40 },
    sectionContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 20, },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8, },
    lotNumberHeader: { textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 20, },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, },
    infoLabel: { fontSize: 16, color: '#666', },
    infoValue: { fontSize: 16, fontWeight: '500', color: '#000', },
});

export default ReceptionScreen;
