import React, { useState, useContext } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TransfertLot } from '../Shared/type';
import { ReceptionData } from './type';
import { validerReception } from './routes';
// Assurez-vous que le chemin vers votre nouveau composant est correct
import CustomTextInput from '../Shared/components/CustomTextInput';

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}><Text style={localStyles.infoLabel}>{label}</Text><Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text></View>
);

const ReceptionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { item } = route.params as { item: TransfertLot };

    const [numBordereau, setNumBordereau] = useState('');
    const [tracteur, setTracteur] = useState('');
    const [remorque, setRemorque] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [nombreSacs, setNombreSacs] = useState(item.nombreSacsExpedition?.toString() ?? '');
    const [nombrePalettes, setNombrePalettes] = useState(item.nombrePaletteExpedition?.toString() ?? '');
    const [poidsBrut, setPoidsBrut] = useState(item.poidsBrutExpedition?.toString() ?? '');
    const [poidsNet, setPoidsNet] = useState(item.poidsNetExpedition?.toString() ?? '');
    const [tareSacs, setTareSacs] = useState(item.tareSacsExpedition?.toString() ?? '');
    const [tarePalettes, setTarePalettes] = useState(item.tarePaletteExpedition?.toString() ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleValidation = async () => {
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur d'utilisateur", "Vos informations utilisateur sont incomplètes. Impossible de continuer.");
            return;
        }
        
        const requiredFields = [
            { name: 'N° Bordereau Réception', value: numBordereau },
            { name: 'Tracteur', value: tracteur },
            { name: 'Remorque', value: remorque },
            { name: 'Nombre de sacs', value: nombreSacs },
            { name: 'Nombre de palettes', value: nombrePalettes },
            { name: 'Poids Brut Réception', value: poidsBrut },
            { name: 'Poids Net Réception', value: poidsNet },
            { name: 'Tare Sacs Réception', value: tareSacs },
            { name: 'Tare Palettes Réception', value: tarePalettes },
        ];

        for (const field of requiredFields) {
            if (!field.value.trim()) {
                Alert.alert("Champ obligatoire", `Veuillez remplir le champ : ${field.name}`);
                return;
            }
        }

        const numericFields = requiredFields.slice(3);
        for (const field of numericFields) {
            if (isNaN(parseFloat(field.value))) {
                Alert.alert("Valeur invalide", `Le champ "${field.name}" doit être un nombre valide.`);
                return;
            }
        }

        setIsSubmitting(true);

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
        };

        try {
            await validerReception(item.id, receptionData);
            Toast.show({ type: 'success', text1: 'Opération Réussie', text2: `Le lot ${item.numeroLot} est entré en stock.` });
            navigation.goBack();
        } catch (receptionError: any) {
            const errorMessage = receptionError.message || '';
            if (errorMessage.includes('Prière vérifier le magasin de reception')) {
                Alert.alert("Action Impossible", "Ce lot ne peut pas être réceptionné dans ce magasin car c'est son point d'expédition d'origine.");
            } else {
                Alert.alert("Échec de la Réception", errorMessage);
            }
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
                    <Button title="Valider Réception" onPress={handleValidation} color={Colors.primary} disabled={isSubmitting} />
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
    infoValue: { fontSize: 16, fontWeight: '500', color: '#000', },
});

export default ReceptionScreen;