import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, Button, Alert, ScrollView, StyleSheet,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Toast from 'react-native-toast-message';
import { Magasin, DropdownItem, StockLot, TransfertDto, LotDetail } from './type';
import { getMagasins, getMouvementStockTypes, getParametres } from '../Shared/route';
import { createTransfert, getLotById } from './routes';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import CustomTextInput from '../Shared/components/CustomTextInput';

/* ----------  TYPES  ---------- */
type TransfertScreenRouteParams = { item: StockLot };

/* ----------  CONSTANTES  ---------- */
const SACS_PAR_PALETTE = 40; // uniquement pour l’arrondi « palettes »

/* ----------  UTILITAIRES  ---------- */
// --- MODIFICATION: 'formatNumber' (qui gardait les décimales) est supprimé ---
// const formatNumber = (n: number) => parseFloat(n.toFixed(2)).toString();

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <View style={localStyles.infoRow}>
    <Text style={localStyles.infoLabel}>{label}</Text>
    <Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text>
  </View>
);

const FormLabel = ({ text }: { text: string }) => (
  <Text style={localStyles.formLabel}>{text}</Text>
);

/* ----------  COMPOSANT PRINCIPAL  ---------- */
const TransfertScreen = () => {
  const route = useRoute<RouteProp<{ params: TransfertScreenRouteParams }>>();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { item } = route.params;

  /* --- États formulaire --- */
  const [operationType, setOperationType] = useState<'transfert' | 'empotage' | 'export' | ''>('');
  const [transfertMode, setTransfertMode] = useState<'total' | 'partiel' | ''>('total');
  const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
  const [tracteur, setTracteur] = useState('');
  const [remorque, setRemorque] = useState('');
  const [numBordereau, setNumBordereau] = useState('');
  const [commentaire, setCommentaire] = useState('');

  /* --- Données référentielles --- */
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  // const [mouvementTypes, setMouvementTypes] = useState<DropdownItem[]>([]); // Masqué
  const [mouvementTypeID, setMouvementTypeID] = useState<string>(''); // Toujours utilisé
  const [campagneActuelle, setCampagneActuelle] = useState<string>('');
  const [detailedLot, setDetailedLot] = useState<LotDetail | null>(null);

  /* --- États UI --- */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* --- Champs calculés --- */
  const [nombreSacs, setNombreSacs] = useState<number | undefined>(item.quantite);
  const [nombrePalettes, setNombrePalettes] = useState<string>('0');
  const [poidsBrut, setPoidsBrut] = useState<string>('0');
  const [tareSacs, setTareSacs] = useState<string>('0');
  const [tarePalettes, setTarePalettes] = useState<string>('0');
  const [poidsNet, setPoidsNet] = useState<string>('0');

  /* =========================================================
   * 1. Chargement initial
   * ======================================================= */
  useEffect(() => {
    const load = async () => {
      try {
        // Ne charge plus les mouvementTypes, mais garde l'ID de sortie (30)
        const [mags, params, lot] = await Promise.all([
          getMagasins(),
          getParametres(),
          getLotById(item.lotID),
          // getMouvementStockTypes(), // Appel retiré
        ]);
        setMagasins(mags.filter((m: Magasin) => m.id !== user?.magasinID));
        setCampagneActuelle(params.campagne);
        setDetailedLot(lot);
        // setMouvementTypes(mvts); // Retiré
        
        // Définit l'ID du mouvement de sortie (30) en dur pour le système
        // const sortie = mvts.find((m: DropdownItem) => m.id === 30);
        // if (sortie) setMouvementTypeID(sortie.id.toString());
        setMouvementTypeID('30'); // ID pour 'Sortie'

      } catch (err: any) {
        Alert.alert('Erreur de chargement', err.message || 'Impossible de charger les données.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [item.lotID, user, navigation]);

  /* =========================================================
   * 2. Mode « TOTAL » → MÀJ du nombre de sacs
   * ======================================================= */
  useEffect(() => {
    // Si on est en mode 'total', on force le nombre de sacs à être la quantité en stock.
    // Le calcul (poids, tares) sera géré par l'autre useEffect qui écoute 'nombreSacs'.
    if (transfertMode !== 'total' || !detailedLot || !item) return;

    setNombreSacs(item.quantite);
    // Les autres calculs (poids, net, tares) sont retirés d'ici
    // pour centraliser la logique de calcul.
    
  }, [transfertMode, item, detailedLot]);

  /* =========================================================
   * 3. Mode « PARTIEL » ET CALCULS → Logique unifiée
   * ======================================================= */
  useEffect(() => {
    // Ce hook gère TOUS les calculs au pro rata.
    // Il se déclenche si 'detailedLot' charge, ou si 'nombreSacs' change
    // (soit par l'utilisateur en mode partiel, soit par le hook "Total").
    
    if (!detailedLot) return; // Ne pas calculer si les données de base ne sont pas là

    const q = nombreSacs ?? 0;
    
    // Q est la quantité *originale* du lot (source de vérité pour le pro rata)
    const Q_original = detailedLot.nombreSacs || 1; 
    const ratio = q / Q_original;

    // Tous les calculs sont basés sur 'detailedLot' (le lot original)
    const brut = ratio * detailedLot.poidsBrut;
    const tSacs = ratio * detailedLot.tareSacs;
    const tPal = ratio * detailedLot.tarePalettes;
    
    // --- MODIFICATION: Arrondir à l'entier le plus proche ---
    const brutArrondi = Math.round(brut);
    const tSacsArrondi = Math.round(tSacs);
    const tPalArrondi = Math.round(tPal);
    
    // Recalculer le net à partir des valeurs arrondies pour garantir la cohérence
    const netArrondi = brutArrondi - tSacsArrondi - tPalArrondi; 

    setPoidsBrut(brutArrondi.toString());
    setTareSacs(tSacsArrondi.toString());
    setTarePalettes(tPalArrondi.toString());
    setPoidsNet(netArrondi.toString());
    
    // Le nombre de palettes est purement indicatif
    setNombrePalettes(Math.ceil(q / SACS_PAR_PALETTE).toString());
    
  }, [nombreSacs, detailedLot]); // 'transfertMode' est retiré, ce hook écoute 'nombreSacs'

  /* =========================================================
   * 4. Gestion destination forcée export
   * ======================================================= */
  useEffect(() => {
    if (operationType === 'export') setDestinationMagasinId('1000');
    else if (operationType !== 'transfert' && operationType !== 'empotage') setDestinationMagasinId('');
  }, [operationType]);

  /* =========================================================
   * 5. Soumission
   * ======================================================= */
  const handleTransfert = async () => {
    /* ----- validations ----- */
    // Validation sur mouvementTypeID est toujours active, même si le champ est masqué
    if (!operationType || !transfertMode || !numBordereau.trim() || !mouvementTypeID) {
      Alert.alert('Validation', 'Veuillez remplir tous les champs obligatoires (*).');
      return;
    }
    if (!campagneActuelle || !detailedLot) {
      Alert.alert('Erreur', 'Les données du lot ne sont pas chargées.');
      return;
    }
    if ((operationType === 'transfert' || operationType === 'empotage') && !destinationMagasinId) {
      Alert.alert('Validation', 'Veuillez sélectionner un magasin de destination.');
      return;
    }
    const sacsATransferer = Number(nombreSacs);
    // La validation (q > item.quantite) est déjà gérée par handleSacsChange
    // mais on garde une sécurité
    if (!sacsATransferer || sacsATransferer <= 0 || sacsATransferer > item.quantite) {
      Alert.alert('Validation', `Le nombre de sacs doit être > 0 et ≤ ${item.quantite}.`);
      return;
    }
    if (!user?.magasinID || !user?.locationID || !user?.name) {
      Alert.alert('Erreur', 'Utilisateur non authentifié ou informations manquantes.');
      return;
    }

    /* ----- préparation DTO ----- */
    setIsSubmitting(true);
    const dto: TransfertDto = {
      campagneID: campagneActuelle,
      lotID: item.lotID,
      produitID: item.produitID,
      certificationID: detailedLot.certificationID ?? item.certificationID,
      numeroLot: detailedLot.numeroLot,
      exportateurID: detailedLot.exportateurID,
      siteID: user.locationID,
      magasinExpeditionID: user.magasinID,
      creationUtilisateur: user.name,
      numBordereauExpedition: numBordereau.trim(),
      nombreSacsExpedition: sacsATransferer,
      immTracteurExpedition: tracteur.trim(),
      immRemorqueExpedition: remorque.trim(),
      dateExpedition: new Date().toISOString(),
      commentaireExpedition: commentaire.trim(),
      magReceptionTheoID: parseInt(destinationMagasinId, 10) || 0,
      modeTransfertID: transfertMode === 'total' ? 1 : 2,
      typeOperationID: operationType === 'transfert' ? 1 : operationType === 'empotage' ? 2 : 3,
      mouvementTypeID: parseInt(mouvementTypeID, 10), // Toujours '30'
      statut: 'NA',
      sacTypeID: 1,
      // Les valeurs arrondies (format string) sont parsées
      nombrePaletteExpedition: parseInt(nombrePalettes, 10) || 0,
      poidsBrutExpedition: parseFloat(poidsBrut) || 0,
      poidsNetExpedition: parseFloat(poidsNet) || 0,
      tareSacsExpedition: parseFloat(tareSacs) || 0,
      tarePaletteExpedition: parseFloat(tarePalettes) || 0,
    };

    try {
      await createTransfert(dto);
      Toast.show({ type: 'success', text1: 'Opération réussie', text2: `Sortie du lot ${item.reference} validée.` });
      navigation.goBack(); // C'est ici que SortieScreen doit se rafraîchir
    } catch (err: any) {
      Alert.alert("Échec de l'opération", err.message || 'Erreur inattendue.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- MODIFICATION: Handler pour le champ NombreSacs ---
  const handleSacsChange = (txt: string) => {
    if (txt === '') {
        setNombreSacs(undefined);
        return;
    }
    let q = parseInt(txt.replace(/[^0-9]/g, ''), 10);
    const qMax = item.quantite; // Limite max (quantité en stock)

    if (isNaN(q)) {
        setNombreSacs(undefined);
    } else if (q > qMax) {
        q = qMax; // Plafonne à la quantité max
        Toast.show({
            type: 'info',
            text1: 'Quantité Maximale Atteinte',
            text2: `Il ne reste que ${qMax} sacs en stock.`,
            position: 'bottom'
        });
    }
    
    setNombreSacs(q);
  };


  /* =========================================================
   * 6. Rendu
   * ======================================================= */
  if (isLoading)
    return (
      <View style={[localStyles.pageContainer, localStyles.loaderContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={Styles.loadingText}>Chargement des détails...</Text>
      </View>
    );

  const isEditable = transfertMode === 'partiel';
  const modeIndex = transfertMode === 'total' ? 0 : transfertMode === 'partiel' ? 1 : -1;

  return (
    <SafeAreaView style={localStyles.pageContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={localStyles.scrollContainer} contentContainerStyle={localStyles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={Styles.modalTitle}>SORTIE DU LOT</Text>
          <Text style={localStyles.lotNumberHeader}>{item.reference}</Text>
          <Text style={localStyles.campagneHeader}>Campagne : {campagneActuelle}</Text>

          {/* ----------  CARTE 1 : Infos Lot ---------- */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Détails du Stock</Text>
            <InfoRow label="Produit" value={item.libelleProduit} />
            <InfoRow label="Certification" value={item.nomCertification} />
            <InfoRow label="Sacs Magasin" value={item.quantite} />
            <InfoRow label="Poids Net" value={`${item.poidsNetAccepte?.toFixed(2)} kg`} />
            <InfoRow label="Poids Brut" value={`${item.poidsBrut?.toFixed(2)} kg`} />
          </View>

          {/* ----------  CARTE 2 : Opération ---------- */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>

            <FormLabel text="Numéro du Bordereau *" />
            <CustomTextInput placeholder="Saisir le numéro..." value={numBordereau} onChangeText={setNumBordereau} style={localStyles.inputMargin} />

            <FormLabel text="Type d'opération *" />
            <View style={localStyles.pickerContainer}>
              <Picker selectedValue={operationType} onValueChange={setOperationType} style={localStyles.pickerText}>
                <Picker.Item label="Sélectionner un type..." value="" enabled={false} style={{ color: '#999999' }} />
                <Picker.Item label="Transfert inter-magasin" value="transfert" />
                <Picker.Item label="Sortie pour empotage" value="empotage" />
                <Picker.Item label="Sortie pour export" value="export" />
              </Picker>
            </View>
            
            {/* MODIFICATION: Champ "Type de Mouvement" masqué pour l'utilisateur.
              La valeur est gérée en interne (ID 30).
            */}
            {/*
            <FormLabel text="Type de Mouvement *" />
            <View style={localStyles.pickerContainer}>
              <Picker selectedValue={mouvementTypeID} onValueChange={setMouvementTypeID} style={localStyles.pickerText}>
                <Picker.Item label="Sélectionner un mouvement..." value="" enabled={false} style={{ color: '#999999' }} />
                {mouvementTypes.map((m) => (
                  <Picker.Item key={m.id} label={m.designation} value={m.id.toString()} />
                ))}
              </Picker>
            </View>
            */}

            <FormLabel text={operationType === 'export' ? 'Destination' : 'Destination *'} />
            {operationType === 'transfert' || operationType === 'empotage' ? (
              <View style={localStyles.pickerContainer}>
                <Picker selectedValue={destinationMagasinId} onValueChange={setDestinationMagasinId} style={localStyles.pickerText}>
                  <Picker.Item label="Sélectionner un magasin..." value="" enabled={false} style={{ color: '#999999' }} />
                  {magasins.map((mag) => (
                    <Picker.Item key={mag.id} label={mag.designation} value={mag.id.toString()} />
                  ))}
                </Picker>
              </View>
            ) : (
              <CustomTextInput
                placeholder="Destination"
                value={operationType === 'export' ? 'Sortie pour Export' : 'N/A'}
                editable={false}
                style={[localStyles.disabledInput, localStyles.inputMargin]}
              />
            )}

            <FormLabel text="Tracteur" />
            <CustomTextInput placeholder="N° immatriculation tracteur" value={tracteur} onChangeText={setTracteur} style={localStyles.inputMargin} />

            <FormLabel text="Remorque" />
            <CustomTextInput placeholder="N° immatriculation remorque" value={remorque} onChangeText={setRemorque} style={localStyles.inputMargin} />
          </View>

          {/* ----------  CARTE 3 : Quantités ---------- */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Quantités à sortir</Text>

            <FormLabel text="Mode de transfert *" />
            <SegmentedControl
              values={['Total', 'Partiel']}
              selectedIndex={modeIndex}
              onChange={(evt) => setTransfertMode(evt.nativeEvent.selectedSegmentIndex === 0 ? 'total' : 'partiel')}
              style={localStyles.inputMargin}
              tintColor={Colors.primary}
            />

            <FormLabel text="Nombre de sacs *" />
            <CustomTextInput
              placeholder="Saisir le nombre de sacs"
              value={nombreSacs?.toString() || ''}
              // --- MODIFICATION: Utilisation du handler ---
              onChangeText={handleSacsChange}
              editable={isEditable}
              keyboardType="numeric"
              style={[!isEditable ? localStyles.disabledInput : {}, localStyles.inputMargin]}
            />

            <FormLabel text="Nombre de palettes" />
            <CustomTextInput placeholder="Nombre de palettes" value={nombrePalettes} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />

            <FormLabel text="Poids Brut" />
            <CustomTextInput placeholder="Poids Brut" value={poidsBrut} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />

            <FormLabel text="Tare Sacs" />
            <CustomTextInput placeholder="Tare Sacs" value={tareSacs} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />

            <FormLabel text="Tare Palettes" />
            <CustomTextInput placeholder="Tare Palettes" value={tarePalettes} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />

            <FormLabel text="Poids Net" />
            <CustomTextInput placeholder="Poids Net" value={poidsNet} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />

            <FormLabel text="Commentaire" />
            <CustomTextInput placeholder="Ajouter un commentaire (optionnel)" value={commentaire} onChangeText={setCommentaire} multiline />
          </View>
        </ScrollView>

        {/* ----------  FOOTER ---------- */}
        <View style={localStyles.footerContainer}>
          <View style={localStyles.footerButtonWrapper}>
            <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
          </View>
          <View style={localStyles.footerButtonWrapper}>
            <Button title="Valider Sortie" onPress={handleTransfert} color={Colors.primary} disabled={isSubmitting || isLoading} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* =========================================================
 * STYLES
 * ======================================================= */
const localStyles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: Colors.background || '#f4f7f8' },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loaderContainer: { justifyContent: 'center', alignItems: 'center' },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButtonWrapper: { flex: 1, marginHorizontal: 8 },

  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  lotNumberHeader: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  campagneHeader: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 20,
  },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 15, color: Colors.darkGray },
  infoValue: { fontSize: 15, fontWeight: '500', color: Colors.dark, textAlign: 'right' },

  formLabel: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 2 },
  inputMargin: { marginBottom: 20 },
  disabledInput: { backgroundColor: '#e9ecef', color: '#6c757d', borderRadius: 5 },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  pickerText: { color: Colors.textDark },
});

export default TransfertScreen;