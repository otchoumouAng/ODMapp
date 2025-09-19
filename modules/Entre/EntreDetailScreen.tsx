import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Lot } from './type';
import { Magasin } from '../Shared/type';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as apiService from '../Shared/route';
import { AddMouvementPayload } from '../Shared/route';
import { AuthContext } from '../../contexts/AuthContext';

const ReadOnlyField = ({ label, value }: { label: string, value: string | number | null | undefined }) => (
    <View style={localStyles.fieldContainer}>
        <Text style={localStyles.label}>{label}</Text>
        <TextInput
            style={[Styles.filterInput, localStyles.readOnlyInput]}
            value={value?.toString() || 'N/A'}
            editable={false}
        />
    </View>
);


const EntreDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  // On récupère le lot ET la fonction de rappel 'onValider'
  const { item, onValider } = route.params as { item: Lot; onValider: (id: string) => void };

  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [nombreSacs, setNombreSacs] = useState('');
  const [tracteur, setTracteur] = useState('');
  const [remorque, setRemorque] = useState('');
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    const loadMagasins = async () => {
      try {
        const data = await apiService.getMagasins();
        setMagasins(data);
      } catch (error) {
        console.error("Failed to load magasins", error);
        Alert.alert("Erreur", "Impossible de charger la liste des magasins.");
      }
    };
    loadMagasins();
  }, []);

  const handleValiderEntree = () => {
    // Étape 1: Afficher la confirmation
    Alert.alert(
        "Confirmer l'entrée",
        `Voulez-vous vraiment confirmer l'entrée du lot ${item.numeroLot} dans votre magasin ?`,
        [
            // Bouton pour annuler
            {
                text: "Annuler",
                style: "cancel"
            },
            // Bouton pour confirmer
            {
                text: "Confirmer",
                onPress: async () => {
                    try {
                        const magasin = magasins.find(m => m.designation === item.magasinReceptionNom);

                        const payload: AddMouvementPayload = {
                            magasinID: magasin?.id || 0,
                            magasinNom: item.magasinReceptionNom || 'N/A',
                            campagneID: item.campagneID,
                            exportateurID: item.exportateurID,
                            exportateurNom: item.exportateurNom,
                            mouvementTypeID: 1, // 'Entrée'
                            mouvementTypeDesignation: 'Entrée',
                            certificationID: item.certificationID,
                            certificationDesignation: item.certificationDesignation,
                            siteID: magasin?.siteID || 0,
                            siteNom: item.siteNom || 'N/A',
                            reference1: item.numeroLot,
                            dateMouvement: new Date().toISOString(),
                            sens: 1, // Entrée
                            quantite: item.nombreSacs,
                            poidsBrut: item.poidsBrut,
                            tareSacs: item.tareSacs,
                            tarePalettes: item.tarePalettes,
                            poidsNetLivre: item.poidsNet,
                            retentionPoids: 0,
                            poidsNetAccepte: item.poidsNet,
                            creationUtilisateur: user?.username || 'user',
                        };

                        await apiService.addMouvement(payload);

                        // Étape 3: Appeler la fonction de rappel pour mettre à jour la liste
                        onValider(item.id);

                        // Étape 4: Naviguer en arrière
                        navigation.goBack();
                    } catch (error) {
                        console.error("Erreur lors de l'ajout du mouvement de stock:", error);
                        Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement du mouvement.");
                    }
                }
            }
        ]
    );
  };

  return (
    <ScrollView style={Styles.container}>
      <View style={{ padding: 20, marginTop: 36 }}>
          <Text style={Styles.modalTitle}>Entrée du Lot</Text>

          <Text style={Styles.lotInfo}>
              Lot: <Text style={Styles.lotInfoBold}>{item.numeroLot}</Text> - Bordereau: <Text style={Styles.lotInfoBold}>{item.numeroTransfert || 'N/A'}</Text>
          </Text>

          <ReadOnlyField label="Campagne" value={item.campagneID} />
          <ReadOnlyField label="Site" value={item.siteNom} />
          <ReadOnlyField label="Magasin Réception" value={item.magasinReceptionNom} />
          <ReadOnlyField label="Date Expédition" value={item.dateExpedition ? new Date(item.dateExpedition).toLocaleDateString() : 'N/A'} />
          <ReadOnlyField label="Magasin Expédition" value={item.magasinExpeditionNom} />
          <ReadOnlyField label="Date/Heure Lot" value={new Date(item.dateLot).toLocaleString()} />
          <ReadOnlyField label="Nombre de Palettes" value={item.nombrePalettes} />
          {/*<ReadOnlyField label="Nombre de Sacs" value={item.nombreSacs} />*/}
          <ReadOnlyField label="Poids Brut" value={`${item.poidsBrut} kg`} />

          <Text style={localStyles.sectionTitle}>Informations de Transport</Text>
          <TextInput style={Styles.filterInput} placeholder="Nombre de Sacs" value={nombreSacs} onChangeText={setNombreSacs} />
          <TextInput style={Styles.filterInput} placeholder="N° Tracteur" value={tracteur} onChangeText={setTracteur} />
          <TextInput style={Styles.filterInput} placeholder="N° Remorque" value={remorque} onChangeText={setRemorque} />
          <TextInput
            style={[Styles.filterInput, { height: 100 }]}
            placeholder="Commentaire"
            value={commentaire}
            onChangeText={setCommentaire}
            multiline
          />

          <View style={Styles.modalButtonContainer}>
            <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} />
            <Button title="Valider Entrée" onPress={handleValiderEntree} color={Colors.primary} />
          </View>
        </View>
    </ScrollView>
  );
};

// les styles locaux restent identiques
const localStyles = StyleSheet.create({
    readOnlyInput: {
        backgroundColor: '#e9ecef',
        color: '#495057',
    },
    fieldContainer: {
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: Colors.darkGray,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginTop: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
        paddingBottom: 5,
    }
});

export default EntreDetailScreen;