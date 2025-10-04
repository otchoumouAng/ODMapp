import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FadersHorizontal, CaretUp, CaretDown, CalendarBlank } from 'phosphor-react-native';
import * as apiService from '../../Shared/route';
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

    const [exportateurs, setExportateurs] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [campagnes, setCampagnes] = useState<string[]>([]);

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
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
        // Pour Android, le picker se ferme automatiquement. Pour iOS, on gère la fermeture.
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate && datePickerTarget) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            onValueChange(datePickerTarget, formattedDate);
        }
        // Toujours réinitialiser la cible et fermer le picker après une action (ou une annulation)
        setDatePickerTarget(null);
        setShowDatePicker(false);
    };

    const showPickerFor = (target: 'dateDebut' | 'dateFin') => {
        setDatePickerTarget(target);
        setShowDatePicker(true);
    };

    // --- CORRECTION 1: Modification de la fonction générique renderPicker ---
    const renderPicker = (label: string, selectedValue: any, onValueChangeCallback: (value: any) => void, items: any[], labelKey: string, valueKey: string) => (
        <View style={Styles.filterPickerContainer}>
            <Text style={Styles.filterPickerLabel}>{label}</Text>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChangeCallback}
                // La prop "style" directe a été retirée pour la compatibilité Android
                mode="dropdown">
                {/* Le placeholder est maintenant désactivé et stylisé en gris */}
                <Picker.Item label={`Tous`} value="" style={{ color: '#999999' }} />
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
                    {/* Les Pickers génériques utilisent maintenant la fonction corrigée */}
                    {renderPicker("Exportateurs", filters.exportateurID, (val) => onValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
                    {renderPicker("Types", filters.mouvementTypeID, (val) => onValueChange('mouvementTypeID', val), types, 'designation', 'id')}

                    {/* --- CORRECTION 2: Application des correctifs sur les Pickers manuels --- */}
                    <View style={Styles.filterPickerContainer}>
                        <Text style={Styles.filterPickerLabel}>Sens</Text>
                        <Picker selectedValue={filters.sens} onValueChange={(val) => onValueChange('sens', val)} mode="dropdown">
                            <Picker.Item label="Tous" value="" style={{ color: '#999999' }} />
                            <Picker.Item label="Entrée" value="1" />
                            <Picker.Item label="Sortie" value="-1" />
                        </Picker>
                    </View>
                    
                    <View style={Styles.filterPickerContainer}>
                        <Text style={Styles.filterPickerLabel}>Campagnes</Text>
                        <Picker selectedValue={filters.campagneID} onValueChange={(val) => onValueChange('campagneID', val)} mode="dropdown">
                            <Picker.Item label="Toutes" value="" style={{ color: '#999999' }} />
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