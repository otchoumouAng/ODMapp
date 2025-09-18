import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FadersHorizontal, CaretUp, CaretDown, CalendarBlank } from 'phosphor-react-native';
import * as apiService from '../../Shared/route';
import { Styles, Colors } from '../../../styles/style';

// Interface mise à jour avec tous les filtres requis
export interface StockFilters {
  magasinID?: string;
  campagneID?: string;
  exportateurID?: string;
  //dateDebut?: string;
  //dateFin?: string;
  produitID?: string;
  certificationID?: string;
  typeLotID?: string;
  gradeLotID?: string;
}

interface StockFiltreProps {
  initialFilters: StockFilters;
  onFilterChange: (filters: StockFilters) => void;
  onReset: () => void;
  lockedMagasinID?: string;
  lockedMagasinNom?: string;
}

const StockFiltre: React.FC<StockFiltreProps> = ({ initialFilters, onFilterChange, onReset,lockedMagasinID,lockedMagasinNom}) => {
  const [filters, setFilters] = useState<StockFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // États pour les listes
  const [magasins, setMagasins] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<string[]>([]);
  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [lotTypes, setLotTypes] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);

  // États pour les dates
  //const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  //const [datePickerTarget, setDatePickerTarget] = useState<'dateDebut' | 'dateFin' | null>(null);

  useEffect(() => { setFilters(initialFilters); }, [initialFilters]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [m, c, e, p, cert, lt, g] = await Promise.all([
            apiService.getMagasins(), apiService.getCampagnes(), apiService.getExportateurs(),
            apiService.getProduits(), apiService.getCertifications(), apiService.getLotTypes(),
            apiService.getGrades()
        ]);
        setMagasins(m); setCampagnes(c); setExportateurs(e);
        setProduits(p); setCertifications(cert); setLotTypes(lt); setGrades(g);
      } catch (error) { console.error("Failed to load filter data", error); }
    };
    
    if (isExpanded && magasins.length === 0) { loadDropdownData(); }
  }, [isExpanded]);

  const handleValueChange = (name: keyof StockFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === "" || value === null) { delete newFilters[name]; } 
    else { newFilters[name] = String(value); }
    setFilters(newFilters);
  };

/*  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && datePickerTarget) {
      handleValueChange(datePickerTarget, selectedDate.toISOString().split('T')[0]);
    }
  };

  const showPickerFor = (target: 'dateDebut' | 'dateFin') => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };*/

  const handleApplyFilters = () => { onFilterChange(filters); setIsExpanded(false); };
  const handleResetFilters = () => { setFilters({}); onReset(); };

  const renderPicker = (label: string, selectedValue: any, onValueChange: (v: any) => void, items: any[], labelKey = 'designation', valueKey = 'id') => (
    <View style={Styles.filterPickerContainer}>
        <Text style={Styles.filterPickerLabel}>{label}</Text>
        <Picker selectedValue={selectedValue || ""} onValueChange={onValueChange} style={Styles.filterPicker} mode="dropdown">
            <Picker.Item label={`-- Tous les ${label.toLowerCase()} --`} value="" />
            {items.map(item => ( <Picker.Item key={item[valueKey]} label={item[labelKey]} value={item[valueKey].toString()} /> ))}
        </Picker>
    </View>
  );

  return (
    <View style={Styles.filterContainer}>
      <TouchableOpacity style={localStyles.header} onPress={() => setIsExpanded(!isExpanded)}>
        <View style={localStyles.headerLeft}><FadersHorizontal size={24} color={Colors.darkGray} /><Text style={Styles.filterTitle}>Filtres</Text></View>
        <View>{isExpanded ? <CaretUp size={20} color={Colors.primary} /> : <CaretDown size={20} color={Colors.primary} />}</View>
      </TouchableOpacity>
      {isExpanded && (
        <ScrollView>

          {lockedMagasinID && (
            <View style={Styles.filterPickerContainer}>
              <Text style={Styles.filterPickerLabel}>Magasin</Text>
              <View style={localStyles.lockedInputContainer}>
                <Text style={localStyles.lockedInputText}>{lockedMagasinNom || `Magasin ID: ${lockedMagasinID}`}</Text>
              </View>
            </View>
          )}

          <View style={Styles.filterPickerContainer}>
              <Text style={Styles.filterPickerLabel}>Campagne</Text>
              <Picker selectedValue={filters.campagneID || ""} onValueChange={(v) => handleValueChange('campagneID', v)} style={Styles.filterPicker} mode="dropdown">
                  <Picker.Item label="-- Toutes les campagnes --" value="" />
                  {campagnes.map(c => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
          </View>

          {renderPicker("Exportateurs", filters.exportateurID, (v) => handleValueChange('exportateurID', v), exportateurs, 'nom', 'id')}
          {renderPicker("Produits", filters.produitID, (v) => handleValueChange('produitID', v), produits)}
          {renderPicker("Certifications", filters.certificationID, (v) => handleValueChange('certificationID', v), certifications)}
          {renderPicker("Types de Lot", filters.typeLotID, (v) => handleValueChange('typeLotID', v), lotTypes)}
          {renderPicker("Grades", filters.gradeLotID, (v) => handleValueChange('gradeLotID', v), grades, 'designation', 'id')}
          <View style={Styles.filterButtonContainer}>
            <Button title="Réinitialiser" onPress={handleResetFilters} color={Colors.danger} />
            <Button title="Appliquer" onPress={handleApplyFilters} color={Colors.primary}/>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    dateButtonContainer: { justifyContent: 'center' },
    dateText: { marginLeft: 10, color: '#333' },

    lockedInputContainer: {
    backgroundColor: '#e9ecef', // Couleur de fond pour indiquer que c'est désactivé
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  lockedInputText: {
    color: '#495057', // Couleur de texte
    fontSize: 16,
  },
});

export default StockFiltre;