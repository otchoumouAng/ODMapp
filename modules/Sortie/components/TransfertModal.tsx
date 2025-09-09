import React, { useState } from 'react';
import { Modal, View, Text, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Lot } from '../type';
import { Styles, Colors } from '../../../styles/style';

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
      <View style={Styles.modalCenteredView}>
        <View style={[Styles.modalView, { alignItems: 'center' }]}>
          <Text style={Styles.modalTitle}>Transférer le Lot</Text>

          <Text style={Styles.lotInfo}>Lot: <Text style={Styles.lotInfoBold}>{item.numeroLot}</Text></Text>
          <Text style={Styles.lotInfo}>Poids Net: <Text style={Styles.lotInfoBold}>{item.poidsNet.toFixed(2)} kg</Text></Text>

          <View style={[Styles.filterPickerContainer, { marginTop: 20, marginBottom: 20 }]}>
              <Text style={Styles.filterPickerLabel}>Magasin de Destination</Text>
              <Picker
                  selectedValue={destinationMagasinId}
                  onValueChange={(itemValue) => setDestinationMagasinId(itemValue)}
                  style={Styles.filterPicker}
              >
                  <Picker.Item label="-- Sélectionnez un magasin --" value="" />
                  {mockMagasins.map(magasin => (
                      <Picker.Item key={magasin.id} label={magasin.designation} value={magasin.id} />
                  ))}
              </Picker>
          </View>

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
