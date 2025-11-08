import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, Button, Alert, ScrollView, StyleSheet,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Toast from 'react-native-toast-message';
// --- MODIFICATION ---
// 'LotDetail' n'est plus nécessaire. 'DropdownItem' est utilisé pour les types d'op.
import { Magasin, DropdownItem, StockLot, TransfertDto } from './type';
// --- MODIFICATION ---
// Ajout de 'getOperationType'
import { getMagasins, getMouvementStockTypes, getParametres, getOperationType } from '../Shared/route';
// --- MODIFICATION ---
// 'getLotById' n'est plus nécessaire
import { createTransfert } from './routes';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import CustomTextInput from '../Shared/components/CustomTextInput';

/* ----------  TYPES  ---------- */
type TransfertScreenRouteParams = { item: StockLot };

/* ----------  CONSTANTES  ---------- */
const SACS_PAR_PALETTE = 40; // uniquement pour l’arrondi « palettes »

/* ----------  UTILITAIRES  ---------- */
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
  
  // 'item' EST LE STOCK DANS LE MAGASIN ACTUEL (Source de vérité pour TOUT)
  const { item } = route.params;

  /* --- États formulaire --- */
  // --- MODIFICATION ---
  // Stocke l'ID du type d'opération (ex: '1', '2', '3') au lieu de la clé (ex: 'transfert')
  const [operationTypeId, setOperationTypeId] = useState<string>('');
  const [transfertMode, setTransfertMode] = useState<'total' | 'partiel' | ''>('total');
  const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
  const [tracteur, setTracteur] = useState('');
  const [remorque, setRemorque] = useState('');
  const [numBordereau, setNumBordereau] = useState('');
  const [commentaire, setCommentaire] = useState('');

  /* --- Données référentielles --- */
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  // --- MODIFICATION ---
  // Nouvel état pour stocker la liste des types d'opération (ex: [{id: 1, designation: 'Transfert'}])
  const [operationTypes, setOperationTypes] = useState<DropdownItem[]>([]);
  const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
  const [campagneActuelle, setCampagneActuelle] = useState<string>('');
  
  /* --- États UI --- */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* --- Champs calculés --- */
  // Initialisés avec les valeurs de 'item' (mode total par défaut)
  const [nombreSacs, setNombreSacs] = useState<number | undefined>(item.quantite);
  const [nombrePalettes, setNombrePalettes] = useState<string>('0');
  const [poidsBrut, setPoidsBrut] = useState<string>(Math.round(item.poidsBrut ?? 0).toString());
  const [tareSacs, setTareSacs] = useState<string>(Math.round(item.tareSac ?? 0).toString());
  const [tarePalettes, setTarePalettes] = useState<string>(Math.round(item.tarePalette ?? 0).toString());
  const [poidsNet, setPoidsNet] = useState<string>(Math.round(item.poidsNetAccepte ?? 0).toString());

  // --- MODIFICATION : NOUVEL ÉTAT ---
  // Ajout d'un état pour suivre l'erreur de saisie sur le nombre de sacs
  const [sacsInputError, setSacsInputError] = useState<boolean>(false);
  // --- FIN MODIFICATION ---


  /* =========================================================
   * 1. Chargement initial
   * ======================================================= */
  useEffect(() => {
    const load = async () => {
      try {
        // --- MODIFICATION ---
        // Ajout de 'getOperationType()' au chargement
        const [mags, params, opTypes] = await Promise.all([
          getMagasins(),
          getParametres(),
          getOperationType(), // Appel de la nouvelle route
        ]);
        
        setMagasins(mags.filter((m: Magasin) => m.id !== user?.magasinID));
        setCampagneActuelle(params.campagne);
        // --- MODIFICATION ---
        // Stockage des types d'opération dans l'état
        setOperationTypes(opTypes);
        //setMouvementTypeID('30'); // ID pour 'Sortie'

      } catch (err: any) {
        Alert.alert('Erreur de chargement', err.message || 'Impossible de charger les données.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, navigation]);


  /* =========================================================
   * 2. CALCULS DE QUANTITÉ (CORRECTION DU BUG DE BASCULE)
   * ======================================================= */
  useEffect(() => {
    if (!item) return;

    let q_transfert: number;

    // Étape 1: Déterminer le nombre de sacs
    if (transfertMode === 'total') {
      // Mode Total: Forcer la quantité à être le total du stock
      q_transfert = item.quantite ?? 0;
      // Mettre à jour l'état si ce n'est pas déjà fait (évite boucle infinie)
      if (nombreSacs !== q_transfert) {
        setNombreSacs(q_transfert);
        // On ne fait pas les calculs ici, on attend que le 'useEffect' 
        // se redéclenche avec la nouvelle valeur de 'nombreSacs'
        
        // --- MODIFICATION ---
        // S'assurer que l'erreur est réinitialisée en mode total
        setSacsInputError(false);
        // --- FIN MODIFICATION ---
        return; 
      }
    } else {
      // Mode Partiel: Utiliser la valeur de l'état (saisie utilisateur)
      q_transfert = nombreSacs ?? 0;
    }
    
    // Étape 2: Calculer le prorata
    const Q_stock = item.quantite || 1; // Quantité totale en stock (éviter division par 0)
    
    // Si la quantité de stock est 0, tout est 0
    if (Q_stock === 0) {
        setPoidsBrut('0');
        setTareSacs('0');
        setTarePalettes('0');
        setPoidsNet('0');
        setNombrePalettes('0');
        return;
    }

    // --- MODIFICATION ---
    // Ne pas calculer le prorata si la quantité est invalide (pour éviter des valeurs négatives ou > 100%)
    // Le calcul se fait uniquement si la quantité est valide (<= Q_stock)
    // Si q_transfert > Q_stock, les champs calculés garderont leur dernière valeur valide
    // ou seront basés sur la saisie (ce qui est ok, car la validation est bloquée)
    
    // On vérifie seulement si q_transfert est un nombre positif
    if (q_transfert < 0) {
      q_transfert = 0;
    }
    
    // On ne recalcule que si la quantité n'est pas en erreur
    // (ou on laisse le calcul se faire, mais le bouton est bloqué)
    // Gardons le calcul pour que l'utilisateur voie l'impact, même si c'est invalide.
    // --- FIN MODIFICATION ---

    const ratio_transfert = q_transfert / Q_stock;

    // Étape 3: Appliquer le ratio à TOUTES les valeurs (y compris le Poids Net)
    const brut_a_sortir = Math.round(ratio_transfert * (item.poidsBrut ?? 0));
    const tSacs_a_sortir = Math.round(ratio_transfert * (item.tareSac ?? 0));
    const tPal_a_sortir = Math.round(ratio_transfert * (item.tarePalette ?? 0));
    const net_a_sortir = Math.round(ratio_transfert * (item.poidsNetAccepte ?? 0));

    // Étape 4: Mettre à jour l'état
    setPoidsBrut(brut_a_sortir.toString());
    setTareSacs(tSacs_a_sortir.toString());
    setTarePalettes(tPal_a_sortir.toString());
    setPoidsNet(net_a_sortir.toString()); // Utilise le net calculé au prorata
    setNombrePalettes(Math.ceil(q_transfert / SACS_PAR_PALETTE).toString());
    
  }, [transfertMode, nombreSacs, item]); // Ce hook gère tout


  /* =========================================================
   * 3. Gestion destination
   * ======================================================= */
  useEffect(() => {
    // '1' = Transfert
    if (operationTypeId === '1') {
        setDestinationMagasinId('');
        setMouvementTypeID('30');
    }
    // '2' = sortie pour reusinage
    else if(operationTypeId === '2'){
      setDestinationMagasinId('');
      setMouvementTypeID('32');
    }
    // '3' = Empotage
    else if (operationTypeId === '3') {
        setDestinationMagasinId('-2');
        setMouvementTypeID('33');
    }
    
    
  }, [operationTypeId]); 

  /* =========================================================
   * 4. Soumission
   * ======================================================= */
  const handleTransfert = async () => {
    /* ----- validations ----- */
    // --- MODIFICATION ---
    // Valide 'operationTypeId'
    if (!operationTypeId || !transfertMode || !numBordereau.trim() || !mouvementTypeID) {
      Alert.alert('Validation', 'Veuillez remplir tous les champs obligatoires (*).');
      return;
    }
    if (!campagneActuelle) {
      Alert.alert('Erreur', 'Les données de la campagne ne sont pas chargées.');
      return;
    }
    // --- MODIFICATION ---
    // Utilise les ID (ex: '1' pour transfert, '2' pour empotage)
    if ((operationTypeId === '1' || operationTypeId === '2') && !destinationMagasinId) {
      Alert.alert('Validation', 'Veuillez sélectionner un magasin de destination.');
      return;
    }
    const sacsATransferer = Number(nombreSacs);

    // Cette validation est la sauvegarde finale. La validation UI (bouton) est gérée par 'sacsInputError'
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
    
    // Le DTO est maintenant construit uniquement à partir de 'item' et des états.
    const dto: TransfertDto = {
      campagneID: campagneActuelle,
      lotID: item.lotID,
      produitID: item.produitID,
      certificationID: item.certificationID,
      numeroLot: item.numeroLot, // Utilisation de item.numeroLot
      exportateurID: item.exportateurID,
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
      // --- MODIFICATION ---
      // Utilise directement l'ID de l'état
      typeOperationID: parseInt(operationTypeId, 10),
      mouvementTypeID: parseInt(mouvementTypeID, 10), // Toujours '30'
      statut: 'NA',
      sacTypeID: 1, // TODO: A remplacer par le vrai SacTypeID si disponible
      // Les valeurs arrondies (format string) sont parsées
      nombrePaletteExpedition: parseInt(nombrePalettes, 10) || 0,
      poidsBrutExpedition: parseFloat(poidsBrut) || 0,
      poidsNetExpedition: parseFloat(poidsNet) || 0,
      tareSacsExpedition: parseFloat(tareSacs) || 0,
      tarePaletteExpedition: parseFloat(tarePalettes) || 0,
    };

    try {
      //console.log(dto)
      await createTransfert(dto);
      Toast.show({ type: 'success', text1: 'Opération réussie', text2: `Sortie du lot ${item.numeroLot} validée.` });
      navigation.goBack(); 
    } catch (err: any) {
      Alert.alert("Échec de l'opération", err.message || 'Erreur inattendue.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // --- MODIFICATION : LOGIQUE DE SAISIE DES SACS ---
  const handleSacsChange = (txt: string) => {
    // Si on est en mode 'total', on ne peut pas changer les sacs
    if (transfertMode === 'total') return;

    if (txt === '') {
        setNombreSacs(undefined);
        setSacsInputError(false); // Réinitialiser l'erreur
        return;
    }
    
    let q = parseInt(txt.replace(/[^0-9]/g, ''), 10);
    const qMax = item.quantite; // Limite max (quantité en stock)

    if (isNaN(q)) {
        setNombreSacs(undefined);
        setSacsInputError(false); // Pas une erreur de "dépassement"
    } else if (q > qMax) {
        // --- MODIFICATION ---
        // Ne plus plafonner. Afficher l'erreur et mettre à jour l'état.
        setSacsInputError(true); 
        // --- MODIFICATION : Toast supprimé ---
        /*
        Toast.show({
            type: 'error', // Changer en 'error'
            text1: 'Quantité Invalide',
            text2: `Le stock maximum est de ${qMax} sacs.`,
            position: 'top'
        });
        */
        // --- FIN MODIFICATION ---
    } else {
        // Quantité valide (q <= qMax)
        setSacsInputError(false);
    }
    
    // Met à jour l'état avec la valeur saisie (même si elle est > qMax)
    // Le bouton de validation sera bloqué par 'sacsInputError'
    setNombreSacs(q);
  };
  // --- FIN MODIFICATION ---


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
          <Text style={localStyles.lotNumberHeader}>{item.numeroLot}</Text>
          <Text style={localStyles.campagneHeader}>Campagne : {campagneActuelle}</Text>

          {/* ----------  CARTE 1 : Infos Lot ---------- */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Détails du Stock</Text>
            <InfoRow label="Produit" value={item.libelleProduit} />
            <InfoRow label="Certification" value={item.nomCertification} />
            <InfoRow label="Sacs Magasin" value={item.quantite} />
            <InfoRow label="Poids Net" value={`${item.poidsNetAccepte?.toFixed(2)} kg`} />
            <InfoRow label="Poids Brut" value={`${item.poidsBrut?.toFixed(2)} kg`} />
            {/*<InfoRow label="Tare Sacs Stock" value={`${item.tareSac?.toFixed(2)} kg`} />
            <InfoRow label="Tare Palettes Stock" value={`${item.tarePalette?.toFixed(2)} kg`} />*/}
          </View>

          {/* ----------  CARTE 2 : Opération ---------- */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>

            <FormLabel text="Numéro du Bordereau *" />
            <CustomTextInput placeholder="Saisir le numéro..." value={numBordereau} onChangeText={setNumBordereau} style={localStyles.inputMargin} />

            <FormLabel text="Type d'opération *" />
            {/* --- MODIFICATION --- */}
            {/* Le Picker est maintenant dynamique */}
            <View style={localStyles.pickerContainer}>
              <Picker 
                selectedValue={operationTypeId} 
                onValueChange={setOperationTypeId} 
                style={localStyles.pickerText}
              >
                <Picker.Item label="Sélectionner un type..." value="" enabled={false} style={{ color: '#999999' }} />
                {operationTypes.map((op) => (
                  // 'designation' est supposé venir de 'DropdownItem'. Ajustez si le champ s'appelle 'libelle'
                  <Picker.Item key={op.id} label={op.designation} value={op.id.toString()} />
                ))}
              </Picker>
            </View>

            {/* Logique conditionnelle basée sur 'operationTypeId' */}
            <FormLabel text={operationTypeId === '3' ? 'Destination' : 'Destination *'} />

            {operationTypeId === '1' || operationTypeId === '2' ? (
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
                value={operationTypeId === '3' ? 'Réusinage' : 'N/A'}
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
              onChangeText={handleSacsChange}
              editable={isEditable}
              keyboardType="numeric"
              // --- MODIFICATION : STYLE CONDITIONNEL ---
              style={[
                !isEditable ? localStyles.disabledInput : {}, 
                localStyles.inputMargin,
                sacsInputError ? localStyles.inputError : null // Ajoute le style d'erreur
              ]}
              // --- FIN MODIFICATION ---
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
            {/* --- MODIFICATION : BOUTON DÉSACTIVÉ --- */}
            <Button 
              title="Valider" 
              onPress={handleTransfert} 
              color={Colors.primary} 
              // Ajout de 'sacsInputError' à la condition disabled
              disabled={isSubmitting || isLoading || sacsInputError} 
            />
            {/* --- FIN MODIFICATION --- */}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* =========================================================
 * STYLES (modifiés)
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
  
  // --- MODIFICATION : NOUVEAU STYLE ---
  // Style pour le champ de saisie en erreur (bordure rouge)
  inputError: {
    borderColor: '#dc3545', // On force le rouge vif pour l'erreur
    borderWidth: 1,
    backgroundColor: 'rgba(220,53,69,0.1)',
  },
  // --- FIN MODIFICATION ---

  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    color: '#212529',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  pickerText: { color: Colors.textDark },
});

export default TransfertScreen;