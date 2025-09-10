import React from 'react';
import { Modal, View, Text, StyleSheet, Button } from 'react-native';
import { Lot } from '../../Shared/type'; 
import { Styles, Colors, Typography } from '../../../styles/style'; 

interface StockDetailModalProps {
  visible: boolean;
  item: Lot | null;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <View style={localStyles.row}>
        <Text style={localStyles.label}>{label}</Text>
        <Text style={localStyles.value}>{value || 'N/A'}</Text>
    </View>
);

const StockDetailModal: React.FC<StockDetailModalProps> = ({ visible, item, onClose }) => {
  if (!item) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={localStyles.centeredView}>
        <View style={localStyles.modalView}>
          <Text style={Styles.modalTitle}>Détail du Lot</Text>
          <Text style={Styles.lotInfoBold}>{item.numeroLot}</Text>

          <DetailRow label="Campagne" value={item.campagneID} />
          <DetailRow label="Exportateur" value={item.exportateurNom} />
          <DetailRow label="Certification" value={item.certificationDesignation} />
          <DetailRow label="Poids Net" value={`${item.poidsNet.toFixed(2)} kg`} />
          <DetailRow label="Nombre de Sacs" value={item.nombreSacs} />
          <DetailRow label="Statut" value={item.statut} />
          <DetailRow label="Date" value={new Date(item.dateLot).toLocaleDateString()} />

          <View style={{marginTop: 20}}>
             <Button title="Fermer" onPress={onClose} color={Colors.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  label: {
    ...Typography.body,
    color: Colors.darkGray,
    fontWeight: 'bold',
  },
  value: {
    ...Typography.body,
    color: Colors.dark,
  },
});

export default StockDetailModal;