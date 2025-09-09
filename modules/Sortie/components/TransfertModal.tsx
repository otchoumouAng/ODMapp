import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Lot } from '../type';
import { Styles, Colors } from '../../../styles/style';

interface TransfertData {
    operationType: 'transfert' | 'export';
    transfertMode: 'total' | 'partiel';
    destinationMagasinId?: string;
    tracteur?: string;
    remorque?: string;
    nombrePalettes?: number;
    nombreSacs?: number;
}

interface TransfertModalProps {
  visible: boolean;
  item: Lot | null;
  onClose: () => void;
  onTransfert: (item: Lot, data: TransfertData) => void;
}

// Mock data for destination stores
const mockMagasins = [
    { id: '101', designation: 'Magasin Central' },
    { id: '102', designation: 'Dépôt Abidjan' },
    { id: '103', designation: 'Port de San Pedro' },
];

const TransfertModal: React.FC<TransfertModalProps> = ({ visible, item, onClose, onTransfert }) => {
  const [operationType, setOperationType] = useState<'transfert' | 'export'>('transfert');
  const [transfertMode, setTransfertMode] = useState<'total' | 'partiel'>('total');
  const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
  const [tracteur, setTracteur] = useState('');
  const [remorque, setRemorque] = useState('');
  const [nombrePalettes, setNombrePalettes] = useState<number | undefined>(undefined);
  const [nombreSacs, setNombreSacs] = useState<number | undefined>(undefined);

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

  if (!item) {
    return null;
  }

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

    Alert.alert(
        "Confirmation",
        `Voulez-vous vraiment continuer avec cette sortie ?`,
        [
            { text: "Annuler", style: "cancel" },
            { text: "Confirmer", onPress: () => onTransfert(item, data) }
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={Styles.modalCenteredView}>
        <View style={[Styles.modalView, { alignItems: 'center' }]}>
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
                  {mockMagasins.map(magasin => (
                      <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id} />
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
            <Button title="Annuler" onPress={onClose} color={Colors.secondary} />
            <Button title="Transférer" onPress={handleTransfert} color={Colors.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TransfertModal;
