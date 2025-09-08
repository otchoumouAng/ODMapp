import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Lot } from '../type';

interface TransfertModalProps {
  visible: boolean;
  item: Lot | null;
  onClose: () => void;
  onTransfert: (item: Lot, destinationMagasinId: string) => void;
}

// Mock data for destination stores
const mockMagasins = [
    { id: '101', designation: 'Magasin Central' },
    { id: '102', designation: 'Dépôt Abidjan' },
    { id: '103', designation: 'Port de San Pedro' },
];

const TransfertModal: React.FC<TransfertModalProps> = ({ visible, item, onClose, onTransfert }) => {
  const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');

  if (!item) {
    return null;
  }

  const handleTransfert = () => {
    if (!destinationMagasinId) {
        Alert.alert("Erreur", "Veuillez sélectionner un magasin de destination.");
        return;
    }
    Alert.alert(
        "Confirmation",
        `Voulez-vous vraiment transférer le lot ${item.numeroLot} vers le magasin sélectionné ?`,
        [
            { text: "Annuler", style: "cancel" },
            { text: "Confirmer", onPress: () => onTransfert(item, destinationMagasinId) }
        ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Transférer le Lot</Text>

          <Text style={styles.lotInfo}>Lot: <Text style={styles.lotInfoBold}>{item.numeroLot}</Text></Text>
          <Text style={styles.lotInfo}>Poids Net: <Text style={styles.lotInfoBold}>{item.poidsNet.toFixed(2)} kg</Text></Text>

          <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Magasin de Destination</Text>
              <Picker
                  selectedValue={destinationMagasinId}
                  onValueChange={(itemValue) => setDestinationMagasinId(itemValue)}
                  style={styles.picker}
              >
                  <Picker.Item label="-- Sélectionnez un magasin --" value="" />
                  {mockMagasins.map(magasin => (
                      <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id} />
                  ))}
              </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Annuler" onPress={onClose} color="#6c757d" />
            <Button title="Transférer" onPress={handleTransfert} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  lotInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  lotInfoBold: {
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 4,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  }
});

export default TransfertModal;
