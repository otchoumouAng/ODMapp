import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'phosphor-react-native';
import { MouvementStock } from '../type';

interface MouvementStockCardProps {
  item: MouvementStock;
  onDoubleClick: (item: MouvementStock) => void;
}

// Simple double-tap detection logic
let lastTap: number | null = null;
const handleDoubleClick = (item: MouvementStock, onDoubleClickCallback: (item: MouvementStock) => void) => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) {
        onDoubleClickCallback(item);
    } else {
        lastTap = now;
    }
};

const getStatusStyle = (status: string | null | undefined) => {
    switch (status) {
        case 'VAL':
            return {
                borderColor: '#28a745', // Green for Validated
                statusText: 'Validé',
                statusColor: '#28a745'
            };
        case 'CON':
            return {
                borderColor: '#ffc107', // Yellow for Confirmed/Pending
                statusText: 'Confirmé',
                statusColor: '#ffc107'
            };
        default:
            return {
                borderColor: '#6c757d', // Gray for other statuses
                statusText: status || 'N/A',
                statusColor: '#6c757d'
            };
    }
};

const MouvementStockCard: React.FC<MouvementStockCardProps> = ({ item, onDoubleClick }) => {
    const statusStyle = getStatusStyle(item.Statut);
    const isEntree = item.Sens === 1;

    return (
        <TouchableOpacity onPress={() => handleDoubleClick(item, onDoubleClick)}>
            <View style={[styles.card, { borderLeftColor: statusStyle.borderColor }]}>
                <View style={styles.iconContainer}>
                    {isEntree ? <ArrowDownLeft size={28} color="#28a745" weight="bold" /> : <ArrowUpRight size={28} color="#dc3545" weight="bold" />}
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.row}>
                        <Text style={styles.typeText} numberOfLines={1}>{item.MouvementTypeDesignation}</Text>
                        <Text style={styles.dateText}>{new Date(item.DateMouvement).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.poidsText}>{item.PoidsNetAccepte.toFixed(2)} kg</Text>
                        <Text style={[styles.statusText, { color: statusStyle.statusColor }]}>{statusStyle.statusText}</Text>
                    </View>
                     <Text style={styles.magasinText}>{item.MagasinNom} | {item.ExportateurNom}</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    typeText: {
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
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    magasinText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    }
});

export default MouvementStockCard;
