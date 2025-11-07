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
    // 'filters' représente les filtres "actifs" (ceux appliqués)
    filters: MouvementStockFilters;
    // 'onReset' est appelé pour réinitialiser les filtres
    onReset: () => void;
    // --- NOUVELLE PROP ---
    // 'onApply' est appelé quand l'utilisateur clique sur "Appliquer"
    onApply: (filters: MouvementStockFilters) => void;
}

// --- LOGIQUE MISE À JOUR ---
const MouvementStockFilter: React.FC<MouvementStockFilterProps> = ({ filters, onReset, onApply }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [dropdownsLoaded, setDropdownsLoaded] = useState<boolean>(false);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [datePickerTarget, setDatePickerTarget] = useState<'dateDebut' | 'dateFin' | null>(null);

    // --- NOUVEL ÉTAT LOCAL ---
    // 'localFilters' stocke les changements avant qu'ils ne soient appliqués
    const [localFilters, setLocalFilters] = useState<MouvementStockFilters>(filters);

    const [exportateurs, setExportateurs] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [campagnes, setCampagnes] = useState<string[]>([]);

    // S'assure que l'état local est synchronisé avec les filtres actifs (ex: après un reset)
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

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

    // --- NOUVELLE FONCTION ---
    // Met à jour l'état local, SANS déclencher de rafraîchissement
    const handleLocalValueChange = (name: keyof MouvementStockFilters, value: any) => {
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    // --- NOUVELLE FONCTION ---
    // Appelée par le bouton "Appliquer"
    const handleApply = () => {
        onApply(localFilters); // Envoie les filtres locaux au parent
        setIsExpanded(false); // Ferme le panneau de filtres
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate && datePickerTarget) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            // Met à jour l'état local
            handleLocalValueChange(datePickerTarget, formattedDate);
        }
        setDatePickerTarget(null);
        setShowDatePicker(false);
    };

    const showPickerFor = (target: 'dateDebut' | 'dateFin') => {
        setDatePickerTarget(target);
        setShowDatePicker(true);
    };

    const renderPicker = (label: string, selectedValue: any, onValueChangeCallback: (value: any) => void, items: any[], labelKey: string, valueKey: string) => (
        <View style={Styles.filterPickerContainer}>
            <Text style={Styles.filterPickerLabel}>{label}</Text>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChangeCallback}
                mode="dropdown">
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
                    {/* Les Pickers appellent maintenant 'handleLocalValueChange' */}
                    {renderPicker("Exportateurs", localFilters.exportateurID, (val) => handleLocalValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
                    {renderPicker("Types", localFilters.mouvementTypeID, (val) => handleLocalValueChange('mouvementTypeID', val), types, 'designation', 'id')}

                    <View style={Styles.filterPickerContainer}>
                        <Text style={Styles.filterPickerLabel}>Sens</Text>
                        <Picker selectedValue={localFilters.sens} onValueChange={(val) => handleLocalValueChange('sens', val)} mode="dropdown">
                            <Picker.Item label="Tous" value="" style={{ color: '#999999' }} />
                            <Picker.Item label="Entrée" value="1" />
                            <Picker.Item label="Sortie" value="-1" />
                        </Picker>
                    </View>
                    
                    <View style={Styles.filterPickerContainer}>
                        <Text style={Styles.filterPickerLabel}>Campagnes</Text>
                        <Picker selectedValue={localFilters.campagneID} onValueChange={(val) => handleLocalValueChange('campagneID', val)} mode="dropdown">
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
                                    {localFilters.dateDebut || "Sélectionner une date"}
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
                                    {localFilters.dateFin || "Sélectionner une date"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* --- BOUTONS MIS À JOUR --- */}
                    <View style={Styles.filterButtonContainer}>
                        <Button title="Réinitialiser" onPress={onReset} color={Colors.secondary} />
                        {/* --- NOUVEAU BOUTON "APPLIQUER" --- */}
                        <Button title="Rafraichir" onPress={handleApply} color={Colors.primary} />
                    </View>
                </ScrollView>
            )}

            {showDatePicker && (
                <DateTimePicker
                    value={datePickerTarget && localFilters[datePickerTarget] ? new Date(localFilters[datePickerTarget]!) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

// ... (styles locaux inchangés) ...
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

