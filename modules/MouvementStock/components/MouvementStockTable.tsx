import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MouvementStock } from '../type';

interface MouvementStockTableProps {
  data: MouvementStock[];
  onRowDoubleClick: (item: MouvementStock) => void;
}

const MouvementStockTable: React.FC<MouvementStockTableProps> = ({ data, onRowDoubleClick }) => {
  // Simple double-tap detection logic
  let lastTap: number | null = null;
  const handleDoubleClick = (item: MouvementStock) => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) {
      onRowDoubleClick(item);
    } else {
      lastTap = now;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
      <Text style={[styles.headerCell, styles.cellType]}>Type Mouvement</Text>
      <Text style={[styles.headerCell, styles.cellPoids]}>Poids Net</Text>
      <Text style={[styles.headerCell, styles.cellStatut]}>Statut</Text>
    </View>
  );

  const renderItem = ({ item }: { item: MouvementStock }) => (
    <TouchableOpacity onPress={() => handleDoubleClick(item)}>
      <View style={styles.row}>
        <Text style={[styles.cell, styles.cellDate]}>{new Date(item.DateMouvement).toLocaleDateString()}</Text>
        <Text style={[styles.cell, styles.cellType]}>{item.MouvementTypeDesignation}</Text>
        <Text style={[styles.cell, styles.cellPoids]}>{item.PoidsNetAccepte.toFixed(2)}</Text>
        <Text style={[styles.cell, styles.cellStatut]}>{item.Statut}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <FlatList
            data={data}
            ListHeaderComponent={renderHeader}
            renderItem={renderItem}
            keyExtractor={(item) => item.ID}
            stickyHeaderIndices={[0]}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucun mouvement à afficher.</Text>}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#eef2f5',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 2,
        borderColor: '#d1d9e0',
    },
    headerCell: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: 'white',
    },
    cell: {
        fontSize: 12,
    },
    cellDate: {
        flex: 2,
    },
    cellType: {
        flex: 3,
    },
    cellPoids: {
        flex: 2,
        textAlign: 'right',
        marginRight: 5,
    },
    cellStatut: {
        flex: 1.5,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    }
});

export default MouvementStockTable;
