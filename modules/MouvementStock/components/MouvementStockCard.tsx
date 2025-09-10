import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'phosphor-react-native';
import { MouvementStock } from '../type';
import { Styles, Colors } from '../../../styles/style';

interface MouvementStockCardProps {
  item: MouvementStock;
  onPress: (item: MouvementStock) => void;
}

const getStatusStyle = (status: string | null | undefined) => {
    switch (status) {
        case 'VAL':
            return {
                borderColor: Colors.success,
                statusText: 'Validé',
                statusColor: Colors.success
            };
        case 'CON':
            return {
                borderColor: Colors.warning,
                statusText: 'Confirmé',
                statusColor: Colors.warning
            };
        default:
            return {
                borderColor: Colors.secondary,
                statusText: status || 'N/A',
                statusColor: Colors.secondary
            };
    }
};

const MouvementStockCard: React.FC<MouvementStockCardProps> = ({ item, onPress }) => {
    const statusStyle = getStatusStyle(item.statut);
    const isEntree = item.sens === 1;

    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <View style={[Styles.mouvementStockCard, { borderLeftColor: statusStyle.borderColor }]}>
                <View style={Styles.mouvementStockCardIconContainer}>
                    {isEntree ? <ArrowDownLeft size={28} color={Colors.success} weight="bold" /> : <ArrowUpRight size={28} color={Colors.error} weight="bold" />}
                </View>

                <View style={Styles.mouvementStockCardDetailsContainer}>
                    <View style={Styles.mouvementStockCardRow}>
                        <Text style={Styles.mouvementStockCardTypeText} numberOfLines={1}>{item.mouvementTypeDesignation}</Text>
                        <Text style={Styles.mouvementStockCardDateText}>{new Date(item.dateMouvement).toLocaleDateString()}</Text>
                    </View>
                    <View style={Styles.mouvementStockCardRow}>
                        <Text style={Styles.mouvementStockCardPoidsText}>{(item.poidsNetAccepte ?? 0).toFixed(2)} kg</Text>
                        <Text style={[Styles.mouvementStockCardStatusText, { color: statusStyle.statusColor }]}>{statusStyle.statusText}</Text>
                    </View>
                     <Text style={Styles.mouvementStockCardMagasinText}>{item.magasinNom} | {item.exportateurNom}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default MouvementStockCard;