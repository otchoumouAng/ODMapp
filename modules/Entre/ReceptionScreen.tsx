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
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleValidation = async () => {
        if (!user || !user.magasinID || !user.name) {
            Alert.alert("Erreur", "Utilisateur non authentifié.");
            return;
        }
        if (!numBordereau) {
            Alert.alert("Validation", "Le numéro de bordereau de réception est obligatoire.");
            return;
        }

        setIsSubmitting(true);

        const receptionData: ReceptionData = {
            dateReception: new Date().toISOString(),
            destinationID: user.magasinID,
            modificationUser: user.name,
            numBordereauRec: numBordereau,
            immTracteurRec: tracteur,
            immRemorqueRec: remorque,
            commentaireRec: commentaire,
            nombreSac: parseInt(nombreSacs, 10),
            nombrePalette: parseInt(nombrePalettes, 10),
            poidsBrut: parseFloat(poidsBrut),
            poidsNetRecu: parseFloat(poidsNet),
            tareSacRecu: parseFloat(poidsBrut) - parseFloat(poidsNet),
            tarePaletteArrive: 0, // A ajuster si nécessaire
            statut: 'RE',
            rowVersionKey: item.rowVersionKey,
        };

        try {
            await validerReception(item.id, receptionData);
            Toast.show({ type: 'success', text1: 'Succès', text2: `Le lot ${item.numeroLot} a été réceptionné.` });
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Échec de l'opération", error.message);
        } finally {
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
