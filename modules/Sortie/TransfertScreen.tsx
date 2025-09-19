import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Lot, Magasin } from './type';
import { getMagasins } from '../Shared/route';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as apiService from '../Shared/route';
import { AddMouvementPayload } from '../Shared/route';
import { AuthContext } from '../../contexts/AuthContext';

interface TransfertData {
    operationType: 'transfert' | 'export';
    transfertMode: 'total' | 'partiel';
    destinationMagasinId?: string;
    tracteur?: string;
    remorque?: string;
    nombrePalettes?: number;
    nombreSacs?: number;
}

const TransfertScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { item, onValider } = route.params as { item: Lot; onValider: (id: string) => void };


  const [operationType, setOperationType] = useState<'transfert' | 'export'>('transfert');
  const [transfertMode, setTransfertMode] = useState<'total' | 'partiel'>('total');
  const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
  const [tracteur, setTracteur] = useState('');
  const [remorque, setRemorque] = useState('');
  const [nombrePalettes, setNombrePalettes] = useState<number | undefined>(undefined);
  const [nombreSacs, setNombreSacs] = useState<number | undefined>(undefined);
  const [magasins, setMagasins] = useState<Magasin[]>([]);

  useEffect(() => {
    const loadMagasins = async () => {
      try {
        const data = await getMagasins();
        setMagasins(data);
      } catch (error) {
        console.error("Failed to load magasins", error);
        Alert.alert("Erreur", "Impossible de charger la liste des magasins.");
      }
    };
    loadMagasins();
  }, []);


  useEffect(() => {
    if (operationType === 'export') {
      setDestinationMagasinId('N/A');
    } else {
      setDestinationMagasinId('');
    }
  }, [operationType]);


  useEffect(() => {
    if (transfertMode === 'total' && item) {
      setNombreSacs(item.nombreSacs);
      // Assuming you might add nombrePalettes to the Lot type later
      // setNombrePalettes(item.nombrePalettes);
    } else {
      setNombreSacs(undefined);
      setNombrePalettes(undefined);
    }
  }, [transfertMode, item]);


  const handleTransfert = () => {
    if (operationType === 'transfert' && !destinationMagasinId) {
        Alert.alert("Erreur", "Veuillez sélectionner un magasin de destination.");
        return;
    }

    Alert.alert(
        "Confirmer la sortie",
        `Voulez-vous vraiment confirmer la sortie du lot ${item.numeroLot} de votre magasin ?`,
        [
            { text: "Annuler", style: "cancel" },
            {
                text: "Confirmer",
                onPress: async () => {
                    try {
                        const destinationMagasin = magasins.find(m => m.id.toString() === destinationMagasinId);
                        const sacsATransferer = nombreSacs || item.nombreSacs;

                        const poidsNetTransfert = transfertMode === 'partiel' && nombreSacs ? (item.poidsNet / item.nombreSacs) * nombreSacs : item.poidsNet;
                        const poidsBrutTransfert = transfertMode === 'partiel' && nombreSacs ? (item.poidsBrut / item.nombreSacs) * nombreSacs : item.poidsBrut;
                        const tareSacsTransfert = transfertMode === 'partiel' && nombreSacs ? (item.tareSacs / item.nombreSacs) * nombreSacs : item.tareSacs;

                        const payload: AddMouvementPayload = {
                            magasinID: destinationMagasin?.id || 0,
                            magasinNom: destinationMagasin ? destinationMagasin.designation : 'Export',
                            campagneID: item.campagneID,
                            exportateurID: item.exportateurID,
                            exportateurNom: item.exportateurNom,
                            mouvementTypeID: 2, // 'Sortie'
                            mouvementTypeDesignation: 'Sortie',
                            certificationID: item.certificationID,
                            certificationDesignation: item.certificationDesignation,
                            siteID: destinationMagasin?.siteID || 0,
                            siteNom: destinationMagasin?.siteNom || 'N/A',
                            reference1: item.numeroLot,
                            dateMouvement: new Date().toISOString(),
                            sens: -1, // Sortie
                            quantite: sacsATransferer,
                            poidsBrut: poidsBrutTransfert,
                            tareSacs: tareSacsTransfert,
                            tarePalettes: item.tarePalettes, // Assuming whole palettes are transferred
                            poidsNetLivre: poidsNetTransfert,
                            retentionPoids: 0,
                            poidsNetAccepte: poidsNetTransfert,
                            creationUtilisateur: user?.username || 'user',
                        };

                        await apiService.addMouvement(payload);

                        // Étape 4: Appeler la fonction de rappel pour mettre à jour la liste
                        onValider(item.id);

                        // Étape 5: Revenir à l'écran de la liste
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

  const renderPicker = (label: string, selectedValue: any, onValueChange: (value: any) => void, items: any[], enabled: boolean = true) => (
    <View style={[Styles.filterPickerContainer, { marginTop: 20, marginBottom: 20 }]}>
        <Text style={Styles.filterPickerLabel}>{label}</Text>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={Styles.filterPicker}
            enabled={enabled}
        >
            {items.map(i => (
                <Picker.Item key={i.value} label={i.label} value={i.value} />
            ))}
        </Picker>
    </View>
  );

  return (
    <ScrollView style={Styles.container}>
      <View style={{ padding: 20, marginTop:36 }}>
          <Text style={Styles.modalTitle}>Transférer le Lot</Text>

          <Text style={Styles.lotInfo}>Lot: <Text style={Styles.lotInfoBold}>{item.numeroLot}</Text></Text>

          {renderPicker("Type d’opération", operationType, setOperationType, [
              { label: 'Transfert inter-magasin', value: 'transfert' },
              { label: 'Sortie pour export', value: 'export' },
          ])}

          {renderPicker("Mode de transfert", transfertMode, setTransfertMode, [
              { label: 'Total', value: 'total' },
              { label: 'Partiel', value: 'partiel' },
          ])}

          <View style={[Styles.filterPickerContainer, { marginTop: 20, marginBottom: 20 }]}>
              <Text style={Styles.filterPickerLabel}>Magasin de Destination</Text>
              <Picker
                  selectedValue={destinationMagasinId}
                  onValueChange={(itemValue) => setDestinationMagasinId(itemValue)}
                  style={Styles.filterPicker}
                  enabled={operationType === 'transfert'}
              >
                  <Picker.Item label={operationType === 'export' ? "N/A" : "-- Sélectionnez un magasin --"} value="" />
                  {magasins.map(magasin => (
                      <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id.toString()} />
                  ))}
              </Picker>
          </View>

          <TextInput style={Styles.filterInput} placeholder="Tracteur" value={tracteur} onChangeText={setTracteur} />
          <TextInput style={Styles.filterInput} placeholder="Remorque" value={remorque} onChangeText={setRemorque} />

          <TextInput
            style={[Styles.filterInput, transfertMode === 'total' && { backgroundColor: '#e9ecef' }]}
            placeholder="Nombre de sacs"
            value={nombreSacs?.toString()}
            onChangeText={(text) => setNombreSacs(Number(text))}
            editable={transfertMode === 'partiel'}
            keyboardType="numeric"
          />
          <TextInput
            style={[Styles.filterInput, transfertMode === 'total' && { backgroundColor: '#e9ecef' }]}
            placeholder="Nombre de palettes"
            value={nombrePalettes?.toString()}
            onChangeText={(text) => setNombrePalettes(Number(text))}
            editable={transfertMode === 'partiel'}
            keyboardType="numeric"
          />

          <View style={Styles.modalButtonContainer}>
            <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} />
            <Button title="Transférer" onPress={handleTransfert} color={Colors.primary} />
          </View>
        </View>
    </ScrollView>
  );
};

export default TransfertScreen;
