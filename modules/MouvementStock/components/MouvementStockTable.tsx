import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MouvementStock } from '../type';
import MouvementStockCard from './MouvementStockCard';
import { Styles, Colors } from '../../../styles/style';

interface MouvementStockTableProps {
  data: MouvementStock[];
  onRowPress: (item: MouvementStock) => void;
}

const MouvementStockTable: React.FC<MouvementStockTableProps> = ({ data, onRowPress }) => {

  const renderItem = ({ item }: { item: MouvementStock }) => (
    <MouvementStockCard item={item} onPress={onRowPress} />
  );

  return (
    <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={Styles.list}
            ListEmptyComponent={<Text style={Styles.emptyText}>Aucun mouvement à afficher.</Text>}
        />
    </View>
  );
};

export default MouvementStockTable;