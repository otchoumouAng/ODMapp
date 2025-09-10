import React, { useState } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Lot } from './type';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';

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
  // On récupère le lot ET la fonction de rappel 'onValider'
  const { item, onValider } = route.params as { item: Lot; onValider: (id: string) => void };

  const [nombreSacs, setNombreSacs] = useState('');
  const [tracteur, setTracteur] = useState('');
  const [remorque, setRemorque] = useState('');
  const [commentaire, setCommentaire] = useState('');

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
                onPress: () => {
                    // Étape 2: Logique de validation après confirmation
                    const entreeData = {
                        lotId: item.id,
                        tracteur,
                        remorque,
                        commentaire,
                    };
                    console.log("Validation confirmée:", entreeData);

                    // Étape 3: Appeler la fonction de rappel pour mettre à jour la liste
                    onValider(item.id);

                    // Étape 4: Naviguer en arrière
                    navigation.goBack();
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