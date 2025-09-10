import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FadersHorizontal, CaretUp, CaretDown, CalendarBlank } from 'phosphor-react-native';
import * as apiService from '../../Shared/route';
import { Styles, Colors } from '../../../styles/style';

export interface LotFilters {
  dateDebut?: string;
  dateFin?: string;
  exportateurID?: string;
  campagneID?: string;
  typeLotID?: string; // certificationID remplacé par typeLotID
  numeroLot?: string;
}

interface LotFiltreProps {
  onFilterChange: (filters: LotFilters) => void;
  onReset: () => void;
}

const Filtre: React.FC<LotFiltreProps> = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState<LotFilters>({});
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [dropdownsLoaded, setDropdownsLoaded] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'dateDebut' | 'dateFin' | null>(null);

  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<string[]>([]);
  const [lotTypes, setLotTypes] = useState<any[]>([]); // certifications remplacé par lotTypes

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setExportateurs(await apiService.getExportateurs());
        setCampagnes(await apiService.getCampagnes());
        setLotTypes(await apiService.getLotTypes()); // Appel à la nouvelle fonction
        setDropdownsLoaded(true);
      } catch (error) {
        console.error("Failed to load filter data", error);
      }
    };

    if (isExpanded && !dropdownsLoaded) {
        loadDropdownData();
    }
  }, [isExpanded, dropdownsLoaded]);

  const handleValueChange = (name: keyof LotFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [name]: String(value) }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setIsExpanded(false);
  };

  const handleResetFilters = () => {
    setFilters({});
    onReset();
    setIsExpanded(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && datePickerTarget) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleValueChange(datePickerTarget, formattedDate);
    }
  };

  const showPickerFor = (target: 'dateDebut' | 'dateFin') => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

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
                <Picker.Item key={item[valueKey]} label={item[labelKey]} value={item[valueKey].toString()} />
            ))}
        </Picker>
    </View>
  );

  return (
    <View style={Styles.filterContainer}>
      <TouchableOpacity style={localStyles.header} onPress={() => setIsExpanded(!isExpanded)}>
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
          <View style={Styles.filterPickerContainer}>
            <Text style={Styles.filterPickerLabel}>Numéro de Lot</Text>
            <TextInput
              style={Styles.filterInput}
              placeholder="Rechercher un numéro de lot..."
              value={filters.numeroLot}
              onChangeText={(val) => handleValueChange('numeroLot', val)}
            />
          </View>

          {renderPicker("Exportateurs", filters.exportateurID, (val) => handleValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
          {renderPicker("Types de Lot", filters.typeLotID, (val) => handleValueChange('typeLotID', val), lotTypes, 'designation', 'id')}

          <View style={Styles.filterPickerContainer}>
              <Text style={Styles.filterPickerLabel}>Campagnes</Text>
              <Picker selectedValue={filters.campagneID} onValueChange={(val) => handleValueChange('campagneID', val)} style={Styles.filterPicker} mode="dropdown">
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
            <Button title="Réinitialiser" onPress={handleResetFilters} color={Colors.danger} />
            <Button title="Appliquer" onPress={handleApplyFilters} color={Colors.primary}/>
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

export default Filtre;