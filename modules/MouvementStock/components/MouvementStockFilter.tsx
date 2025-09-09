import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as apiService from '../../../services/api';
import { getMagasins } from '../../Magasin/routes';
import { Magasin } from '../../Magasin/type';
import { Styles, Colors } from '../../../styles/style';

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
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<string[]>([]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setMagasins(await getMagasins());
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
    <View style={Styles.filterPickerContainer}>
        <Text style={Styles.filterPickerLabel}>{label}</Text>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={Styles.filterPicker}
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
    <View style={Styles.filterContainer}>
      <Text style={Styles.filterTitle}>Filtres</Text>
      <ScrollView>
        {renderPicker("Magasins", filters.magasinID, (val) => handleValueChange('magasinID', val), magasins, 'designation', 'id')}
        {renderPicker("Exportateurs", filters.exportateurID, (val) => handleValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
        {renderPicker("Sites", filters.siteID, (val) => handleValueChange('siteID', val), sites, 'nom', 'id')}
        {renderPicker("Types", filters.mouvementTypeID, (val) => handleValueChange('mouvementTypeID', val), types, 'designation', 'id')}

        <View style={Styles.filterPickerContainer}>
            <Text style={Styles.filterPickerLabel}>Campagnes</Text>
            <Picker selectedValue={filters.campagneID} onValueChange={(val) => handleValueChange('campagneID', val)} style={Styles.filterPicker} mode="dropdown">
                <Picker.Item label="-- Toutes les campagnes --" value="" />
                {campagnes.map(c => <Picker.Item key={c} label={c} value={c} />)}
            </Picker>
        </View>

        <TextInput
          style={Styles.filterInput}
          placeholder="Date Début (YYYY-MM-DD)"
          value={filters.dateDebut}
          onChangeText={(val) => handleValueChange('dateDebut', val)}
        />
        <TextInput
          style={Styles.filterInput}
          placeholder="Date Fin (YYYY-MM-DD)"
          value={filters.dateFin}
          onChangeText={(val) => handleValueChange('dateFin', val)}
        />

        <View style={Styles.filterButtonContainer}>
          <Button title="Réinitialiser" onPress={handleResetFilters} color={Colors.danger} />
          <Button title="Appliquer" onPress={handleApplyFilters} color={Colors.primary}/>
        </View>
      </ScrollView>
    </View>
  );
};

export default MouvementStockFilter;
