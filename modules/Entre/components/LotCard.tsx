import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Package } from 'phosphor-react-native';
import { Lot } from '../type';
import { Styles, Colors } from '../../../styles/style';

interface LotCardProps {
  item: Lot;
  onPress: (item: Lot) => void;
}

const getStatusStyle = (status: string) => {
    // This can be expanded with more statuses later
    if (status === 'NA') {
        return { borderColor: Colors.statusBlue, statusText: 'Nouveau' };
    }
    return { borderColor: Colors.secondary, statusText: status };
};

const LotCard: React.FC<LotCardProps> = ({ item, onPress }) => {
    const statusStyle = getStatusStyle(item.statut);

    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <View style={[Styles.lotCard, { borderLeftColor: statusStyle.borderColor }]}>
                <View style={Styles.lotCardIconContainer}>
                    <Package size={32} color={statusStyle.borderColor} weight="bold" />
                </View>

                <View style={Styles.lotCardDetailsContainer}>
                    <View style={Styles.lotCardRow}>
                        <Text style={Styles.lotCardLotNumber} numberOfLines={1}>{item.numeroLot}</Text>
                        <Text style={Styles.lotCardDateText}>{new Date(item.dateLot).toLocaleDateString()}</Text>
                    </View>
                    <View style={Styles.lotCardRow}>
                        <Text style={Styles.lotCardPoidsText}>{item.poidsNet.toFixed(2)} kg</Text>
                        <Text style={Styles.lotCardStatusText}>{statusStyle.statusText}</Text>
                    </View>
                     <Text style={Styles.lotCardSubText} numberOfLines={1}>{item.exportateurNom} | {item.campagneID}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default LotCard;
