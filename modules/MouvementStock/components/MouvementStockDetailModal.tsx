import React from 'react';
import { Modal, View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { MouvementStock } from '../type';

interface MouvementStockDetailModalProps {
  visible: boolean;
  item: MouvementStock | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    value ? (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{String(value)}</Text>
        </View>
    ) : null
);

const MouvementStockDetailModal: React.FC<MouvementStockDetailModalProps> = ({ visible, item, onClose }) => {
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
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Détails du Mouvement</Text>
          <ScrollView style={styles.scrollView}>
            <DetailRow label="ID" value={item.ID} />
            <DetailRow label="Date" value={new Date(item.DateMouvement).toLocaleString()} />
            <DetailRow label="Magasin" value={item.MagasinNom} />
            <DetailRow label="Campagne" value={item.CampagneID} />
            <DetailRow label="Type Mouvement" value={item.MouvementTypeDesignation} />
            <DetailRow label="Exportateur" value={item.ExportateurNom} />
            <DetailRow label="Référence 1" value={item.Reference1} />
            <DetailRow label="Référence 2" value={item.Reference2} />
            <DetailRow label="Référence 3 (Immat.)" value={item.Reference3} />
            <DetailRow label="Sens" value={item.Sens === 1 ? 'Entrée' : 'Sortie'} />
            <DetailRow label="Quantité" value={item.Quantite} />
            <DetailRow label="Poids Brut" value={item.PoidsBrut} />
            <DetailRow label="Tare Sacs" value={item.TareSacs} />
            <DetailRow label="Tare Palettes" value={item.TarePalettes} />
            <DetailRow label="Poids Net Livré" value={item.PoidsNetLivre} />
            <DetailRow label="Poids Net Accepté" value={item.PoidsNetAccepte} />
            <DetailRow label="Statut" value={item.Statut} />
            <DetailRow label="Certification" value={item.CertificationDesignation} />
            <DetailRow label="Emplacement" value={item.EmplacementDesignation} />
            <DetailRow label="Site" value={item.SiteNom} />
            <DetailRow label="Commentaire" value={item.Commentaire} />
            <DetailRow label="Créé par" value={`${item.CreationUtilisateur} le ${new Date(item.CreationDate).toLocaleDateString()}`} />
          </ScrollView>
          <Button title="Fermer" onPress={onClose} />
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
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
    flex: 2,
    textAlign: 'left',
  },
});

export default MouvementStockDetailModal;
