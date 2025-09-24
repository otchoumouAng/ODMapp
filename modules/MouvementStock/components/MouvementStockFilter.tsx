import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FadersHorizontal, CaretUp, CaretDown, CalendarBlank } from 'phosphor-react-native';
import * as apiService from '../../Shared/route';
import { Magasin } from '../../Sortie/type';
import { Styles, Colors } from '../../../styles/style';

export interface MouvementStockFilters {
  dateDebut?: string;
  dateFin?: string;
  magasinID?: string;
  exportateurID?: string;
  campagneID?: string;
  mouvementTypeID?: string;
  sens?: string;
}

interface MouvementStockFilterProps {
  filters: MouvementStockFilters;
  onValueChange: (name: keyof MouvementStockFilters, value: any) => void;
  onReset: () => void;
}

const MouvementStockFilter: React.FC<MouvementStockFilterProps> = ({ filters, onValueChange, onReset }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [dropdownsLoaded, setDropdownsLoaded] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'dateDebut' | 'dateFin' | null>(null);

  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<string[]>([]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setMagasins(await apiService.getMagasins());
        setExportateurs(await apiService.getExportateurs());
        setTypes(await apiService.getMouvementStockTypes());
        setCampagnes(await apiService.getCampagnes());
        setDropdownsLoaded(true);
      } catch (error) {
        console.error("Failed to load filter data", error);
      }
    };

    if (isExpanded && !dropdownsLoaded) {
      loadDropdownData();
    }
  }, [isExpanded, dropdownsLoaded]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && datePickerTarget) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onValueChange(datePickerTarget, formattedDate);
      setDatePickerTarget(null); // Reset target after selection
    } else {
      setShowDatePicker(false); // Hide if no date is selected (e.g., user cancels)
    }
  };

  const showPickerFor = (target: 'dateDebut' | 'dateFin') => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const renderPicker = (label: string, selectedValue: any, onValueChange: (value: any) => void, items: any[], labelKey: string, valueKey: string) => (
    <View style={[Styles.filterPickerContainer, { marginTop: 40 }]}>
        <Text style={Styles.filterPickerLabel}>{label}</Text>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={Styles.filterPicker}
            mode="dropdown">
            <Picker.Item label={`-- Tous les ${label.toLowerCase()} --`} value="" />
            {items.map(item => (
                <Picker.Item key={item[valueKey]} label={item[labelKey]} value={item[valueKey].toString()} />
            ))}
        </Picker>
    </View>
  );

  return (
    <View style={Styles.filterContainer}>
      <TouchableOpacity style={[localStyles.header,{marginTop:35}]} onPress={() => setIsExpanded(!isExpanded)}>
        <View style={localStyles.headerLeft}>
          <FadersHorizontal size={24} color={Colors.darkGray} />
          <Text style={Styles.filterTitle}>Filtres</Text>
        </View>
        <View style={localStyles.headerRight}>
          <Text style={localStyles.toggleText}>{isExpanded ? 'Masquer' : 'Afficher'}</Text>
          {isExpanded ? <CaretUp size={20} color={Colors.primary} /> : <CaretDown size={20} color={Colors.primary} />}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView>
          {renderPicker("Magasins", filters.magasinID, (val) => onValueChange('magasinID', val), magasins, 'designation', 'id')}
          {renderPicker("Exportateurs", filters.exportateurID, (val) => onValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
          {renderPicker("Types", filters.mouvementTypeID, (val) => onValueChange('mouvementTypeID', val), types, 'designation', 'id')}

          <View style={Styles.filterPickerContainer}>
              <Text style={Styles.filterPickerLabel}>Sens</Text>
              <Picker selectedValue={filters.sens} onValueChange={(val) => onValueChange('sens', val)} style={Styles.filterPicker} mode="dropdown">
                  <Picker.Item label="-- Tous les sens --" value="" />
                  <Picker.Item label="Entrée" value="1" />
                  <Picker.Item label="Sortie" value="-1" />
              </Picker>
          </View>
          
          <View style={Styles.filterPickerContainer}>
              <Text style={Styles.filterPickerLabel}>Campagnes</Text>
              <Picker selectedValue={filters.campagneID} onValueChange={(val) => onValueChange('campagneID', val)} style={Styles.filterPicker} mode="dropdown">
                  <Picker.Item label="-- Toutes les campagnes --" value="" />
                  {campagnes.map(c => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
          </View>
          
          <View style={Styles.filterPickerContainer}>
            <Text style={Styles.filterPickerLabel}>Date de début</Text>
            <TouchableOpacity style={[Styles.filterInput, localStyles.dateButtonContainer]} onPress={() => showPickerFor('dateDebut')}>
                <View style={localStyles.dateButtonContent}>
                  <CalendarBlank size={20} color={Colors.darkGray} />
                  <Text style={localStyles.dateText}>
                      {filters.dateDebut || "Sélectionner une date"}
                  </Text>
                </View>
            </TouchableOpacity>
          </View>

          <View style={Styles.filterPickerContainer}>
            <Text style={Styles.filterPickerLabel}>Date de fin</Text>
            <TouchableOpacity style={[Styles.filterInput, localStyles.dateButtonContainer]} onPress={() => showPickerFor('dateFin')}>
                <View style={localStyles.dateButtonContent}>
                  <CalendarBlank size={20} color={Colors.darkGray} />
                  <Text style={localStyles.dateText}>
                      {filters.dateFin || "Sélectionner une date"}
                  </Text>
                </View>
            </TouchableOpacity>
          </View>

          <View style={Styles.filterButtonContainer}>
            <Button title="Réinitialiser" onPress={onReset} color={Colors.danger} />
          </View>
        </ScrollView>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={datePickerTarget && filters[datePickerTarget] ? new Date(filters[datePickerTarget]!) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleText: {
        marginRight: 5,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    dateButtonContainer: {
        justifyContent: 'center'
    },
    dateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 10,
        color: '#333',
    }
});

export default MouvementStockFilter;