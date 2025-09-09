import React from 'react';
import { Modal, View, Text, Button, ScrollView } from 'react-native';
import { MouvementStock } from '../type';
import { Styles, Colors } from '../../../styles/style';

interface MouvementStockDetailModalProps {
  visible: boolean;
  item: MouvementStock | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    value ? (
        <View style={Styles.modalRow}>
            <Text style={Styles.modalLabel}>{label}:</Text>
            <Text style={Styles.modalValue}>{String(value)}</Text>
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
      <View style={Styles.modalCenteredView}>
        <View style={Styles.modalView}>
          <Text style={Styles.modalTitle}>Détails du Mouvement</Text>
          <ScrollView style={Styles.modalScrollView}>
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
          <Button title="Fermer" onPress={onClose} color={Colors.primary} />
        </View>
      </View>
    </Modal>
  );
};

export default MouvementStockDetailModal;
