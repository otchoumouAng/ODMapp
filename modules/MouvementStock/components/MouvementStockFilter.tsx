import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

// This interface will hold the filter values.
// We can expand it to include all filterable fields from the SP.
export interface MouvementStockFilters {
  dateDebut?: string;
  dateFin?: string;
  magasinID?: string;
  exportateurID?: string;
  campagneID?: string;
}

interface MouvementStockFilterProps {
  onFilterChange: (filters: MouvementStockFilters) => void;
  onReset: () => void;
}

const MouvementStockFilter: React.FC<MouvementStockFilterProps> = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState<MouvementStockFilters>({});

  const handleInputChange = (name: keyof MouvementStockFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // Basic validation could be added here
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setFilters({});
    onReset();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtres</Text>
      <ScrollView>
        <TextInput
          style={styles.input}
          placeholder="ID Magasin"
          value={filters.magasinID}
          onChangeText={(val) => handleInputChange('magasinID', val)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="ID Exportateur"
          value={filters.exportateurID}
          onChangeText={(val) => handleInputChange('exportateurID', val)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="ID Campagne"
          value={filters.campagneID}
          onChangeText={(val) => handleInputChange('campagneID', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Date Début (YYYY-MM-DD)"
          value={filters.dateDebut}
          onChangeText={(val) => handleInputChange('dateDebut', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Date Fin (YYYY-MM-DD)"
          value={filters.dateFin}
          onChangeText={(val) => handleInputChange('dateFin', val)}
        />
        <View style={styles.buttonContainer}>
          <Button title="Réinitialiser" onPress={handleResetFilters} color="#ff6347" />
          <Button title="Appliquer" onPress={handleApplyFilters} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    maxHeight: 250, // To make sure it doesn't take too much space
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default MouvementStockFilter;
