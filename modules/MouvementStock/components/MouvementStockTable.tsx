import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MouvementStock } from '../type';
import MouvementStockCard from './MouvementStockCard';

interface MouvementStockTableProps {
  data: MouvementStock[];
  onRowDoubleClick: (item: MouvementStock) => void;
}

const MouvementStockTable: React.FC<MouvementStockTableProps> = ({ data, onRowDoubleClick }) => {

  const renderItem = ({ item }: { item: MouvementStock }) => (
    <MouvementStockCard item={item} onDoubleClick={onRowDoubleClick} />
  );

  return (
    <View style={styles.container}>
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.ID}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucun mouvement à afficher.</Text>}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#f0f2f5', // A light background color for the list screen
    },
    list: {
        paddingVertical: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    }
});

export default MouvementStockTable;
