import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Lot, Magasin } from './type';
import { getMagasins } from './routes';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';

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
  const { item } = route.params as { item: Lot };

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

    const data: TransfertData = {
        operationType,
        transfertMode,
        destinationMagasinId: destinationMagasinId,
        tracteur,
        remorque,
        nombreSacs,
        nombrePalettes,
    };

    console.log(`Transfert action for lot: ${item.numeroLot} with data:`, data);
    Alert.alert(
        "Succès",
        `La sortie du lot ${item.numeroLot} a été enregistrée.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
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
