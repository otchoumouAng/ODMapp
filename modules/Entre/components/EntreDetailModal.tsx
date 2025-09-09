import React from 'react';
import { Modal, View, Text, StyleSheet, Button, ScrollView, Alert } from 'react-native';
import { Lot } from '../type';

interface EntreDetailModalProps {
  visible: boolean;
  item: Lot | null;
  onClose: () => void;
  onEntre: (item: Lot) => void;
}

const DetailRow: React.FC<{ label: string; value?: any }> = ({ label, value }) => (
    value || value === 0 || value === false ? (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{String(value)}</Text>
        </View>
    ) : null
);

const EntreDetailModal: React.FC<EntreDetailModalProps> = ({ visible, item, onClose, onEntre }) => {
  if (!item) {
    return null;
  }

  const handleEntre = () => {
    // Simulate the reception action
    Alert.alert(
        "Confirmation",
        `Voulez-vous vraiment entrer le lot ${item.numeroLot} ?`,
        [
            { text: "Annuler", style: "cancel" },
            { text: "Confirmer", onPress: () => onEntre(item) }
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
          <Text style={styles.modalTitle}>Détails du Lot</Text>
          <ScrollView style={styles.scrollView}>
            <DetailRow label="Numéro Lot" value={item.numeroLot} />
            <DetailRow label="Campagne" value={item.campagneID} />
            <DetailRow label="Exportateur" value={item.exportateurNom} />
            <DetailRow label="Poids Net" value={`${item.poidsNet.toFixed(2)} kg`} />
            <DetailRow label="Nombre de Sacs" value={item.nombreSacs} />
            <DetailRow label="Certification" value={item.certificationDesignation} />
            <DetailRow label="Date du Lot" value={new Date(item.dateLot).toLocaleString()} />
            <DetailRow label="Statut" value={item.statut} />
            <DetailRow label="Manuel" value={item.estManuelText} />
            <DetailRow label="Queue" value={item.estQueueText} />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button title="Fermer" onPress={onClose} color="#6c757d" />
            <Button title="ENTRER" onPress={handleEntre} color="#28a745" />
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  value: {
    color: '#555',
    flex: 1.5,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  }
});

export default EntreDetailModal;
