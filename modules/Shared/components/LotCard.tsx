import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Package } from 'phosphor-react-native';
import { Lot } from '../types/lot';

interface LotCardProps {
  item: Lot;
  onPress: (item: Lot) => void;
}

const getStatusStyle = (status: string) => {
    // This can be expanded with more statuses later
    if (status === 'NA') {
        return { borderColor: '#007bff', statusText: 'Nouveau' };
    }
    return { borderColor: '#6c757d', statusText: status };
};

const LotCard: React.FC<LotCardProps> = ({ item, onPress }) => {
    const statusStyle = getStatusStyle(item.statut);

    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <View style={[styles.card, { borderLeftColor: statusStyle.borderColor }]}>
                <View style={styles.iconContainer}>
                    <Package size={32} color={statusStyle.borderColor} weight="bold" />
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.row}>
                        <Text style={styles.lotNumber} numberOfLines={1}>{item.numeroLot}</Text>
                        <Text style={styles.dateText}>{new Date(item.dateLot).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.poidsText}>{item.poidsNet.toFixed(2)} kg</Text>
                        <Text style={styles.statusText}>{statusStyle.statusText}</Text>
                    </View>
                     <Text style={styles.subText} numberOfLines={1}>{item.exportateurNom} | {item.campagneID}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginVertical: 6,
        marginHorizontal: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
    },
    iconContainer: {
        marginRight: 12,
    },
    detailsContainer: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    lotNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
    },
    poidsText: {
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        backgroundColor: '#f0f0f0',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        overflow: 'hidden', // to ensure borderRadius works on Text
    },
    subText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    }
});

export default LotCard;
