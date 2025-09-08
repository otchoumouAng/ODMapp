import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as apiService from '../../../services/api';


export interface MouvementStockFilters {
  dateDebut?: string;
  dateFin?: string;
  magasinID?: string;
  exportateurID?: string;
  campagneID?: string;
  siteID?: string;
  mouvementTypeID?: string;
}

interface MouvementStockFilterProps {
  onFilterChange: (filters: MouvementStockFilters) => void;
  onReset: () => void;
}

const MouvementStockFilter: React.FC<MouvementStockFilterProps> = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState<MouvementStockFilters>({});

  // State for dropdown data
  const [magasins, setMagasins] = useState<any[]>([]);
  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<string[]>([]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setMagasins(await apiService.getMagasins());
        setExportateurs(await apiService.getExportateurs());
        setSites(await apiService.getSites());
        setTypes(await apiService.getMouvementStockTypes());
        setCampagnes(await apiService.getCampagnes());
      } catch (error) {
        // In a real app, you might want to show a toast or an error message
        console.error("Failed to load filter data", error);
      }
    };
    loadDropdownData();
  }, []);

  const handleValueChange = (name: keyof MouvementStockFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [name]: String(value) }));
  };

  const handleApplyFilters = () => onFilterChange(filters);
  const handleResetFilters = () => {
    setFilters({});
    onReset();
  }

  const renderPicker = (label: string, selectedValue: any, onValueChange: (value: any) => void, items: any[], labelKey: string, valueKey: string) => (
    <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            mode="dropdown"
        >
            <Picker.Item label={`-- Tous les ${label.toLowerCase()} --`} value="" />
            {items.map(item => (
                <Picker.Item key={item[valueKey]} label={item[labelKey]} value={item[valueKey]} />
            ))}
        </Picker>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtres</Text>
      <ScrollView>
        {renderPicker("Magasins", filters.magasinID, (val) => handleValueChange('magasinID', val), magasins, 'designation', 'id')}
        {renderPicker("Exportateurs", filters.exportateurID, (val) => handleValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
        {renderPicker("Sites", filters.siteID, (val) => handleValueChange('siteID', val), sites, 'nom', 'id')}
        {renderPicker("Types", filters.mouvementTypeID, (val) => handleValueChange('mouvementTypeID', val), types, 'designation', 'id')}

        <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Campagnes</Text>
            <Picker selectedValue={filters.campagneID} onValueChange={(val) => handleValueChange('campagneID', val)} style={styles.picker} mode="dropdown">
                <Picker.Item label="-- Toutes les campagnes --" value="" />
                {campagnes.map(c => <Picker.Item key={c} label={c} value={c} />)}
            </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Date Début (YYYY-MM-DD)"
          value={filters.dateDebut}
          onChangeText={(val) => handleValueChange('dateDebut', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Date Fin (YYYY-MM-DD)"
          value={filters.dateFin}
          onChangeText={(val) => handleValueChange('dateFin', val)}
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
    maxHeight: 350,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    height: 50, // Give the container a fixed height
    justifyContent: 'center', // Center the picker content vertically
  },
  pickerLabel: {
    color: '#666',
    fontSize: 12,
    paddingHorizontal: 10,
    position: 'absolute', // Position label absolutely to not interfere with picker layout
    top: 1,
  },
  picker: {
    width: '100%',
    marginTop: 10, // Add margin to avoid overlapping with the label
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default MouvementStockFilter;
