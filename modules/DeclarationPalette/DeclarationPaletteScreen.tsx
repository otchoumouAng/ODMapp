import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import { DeclaredPalette, Palette } from './type';
import { getDeclaredPalettes, getPaletteByQRCode, validatePaletteDeclaration } from './routes';
import { Styles, Colors } from '../../styles/style';
import { Camera } from 'expo-camera';

const DeclarationPaletteScreen = () => {
  const [declaredPalettes, setDeclaredPalettes] = useState<DeclaredPalette[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCameraVisible, setCameraVisible] = useState<boolean>(false);
  const [scannedPalette, setScannedPalette] = useState<Palette | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isValidationLoading, setValidationLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const fetchDeclaredPalettes = async () => {
    setLoading(true);
    try {
      const palettes = await getDeclaredPalettes();
      setDeclaredPalettes(palettes);
    } catch (error) {
      console.error("Failed to fetch declared palettes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclaredPalettes();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setCameraVisible(false);
    setLoading(true);
    try {
      const palette = await getPaletteByQRCode(data);
      setScannedPalette(palette);
    } catch (error) {
      Alert.alert("Erreur", "Palette non trouvée ou erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
    if (!scannedPalette) return;

    setValidationLoading(true);
    try {
      await validatePaletteDeclaration(scannedPalette.id);

      // Refresh the list after successful validation
      fetchDeclaredPalettes();
      Alert.alert("Succès", "La palette a été déclarée avec succès.");

    } catch (error) {
      Alert.alert("Erreur", "La déclaration de la palette a échoué.");
    } finally {
      setValidationLoading(false);
      setScannedPalette(null);
    }
  };

  const handleCancelValidation = () => {
    setScannedPalette(null);
  };

  const renderItem = ({ item }: { item: DeclaredPalette }) => (
    <View style={localStyles.itemContainer}>
      <Text style={localStyles.itemText}><Text style={localStyles.bold}>Palette:</Text> {item.numeroPalette}</Text>
      <Text style={localStyles.itemText}><Text style={localStyles.bold}>Produit:</Text> {item.produitNom}</Text>
      <Text style={localStyles.itemText}><Text style={localStyles.bold}>Poids Net:</Text> {item.poidsNet} kg</Text>
      <Text style={localStyles.itemText}><Text style={localStyles.bold}>Déclarée le:</Text> {new Date(item.dateDeclaration).toLocaleString()}</Text>
    </View>
  );

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text style={Styles.container}>Pas d'accès à la caméra.</Text>;

  if (isCameraVisible) {
    return (
      <View style={{ flex: 1 }}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={handleBarCodeScanned}
          barCodeScannerSettings={{ barCodeTypes: ['qr'] }}
        />
        <View style={localStyles.cameraButtonContainer}>
            <Button
                title="Annuler"
                onPress={() => setCameraVisible(false)}
                color={Colors.danger}
            />
        </View>
      </View>
    );
  }

  return (
    <View style={Styles.container}>
      {loading && !scannedPalette ? (
         <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />
      ) : (
        <>
            <Modal
                transparent={true}
                visible={!!scannedPalette}
                animationType="slide"
                onRequestClose={handleCancelValidation}
            >
                <View style={localStyles.modalContainer}>
                <View style={localStyles.modalContent}>
                    <Text style={localStyles.modalTitle}>Valider la Palette</Text>
                    {scannedPalette && (
                    <>
                        <Text style={localStyles.itemText}><Text style={localStyles.bold}>Numéro:</Text> {scannedPalette.numeroPalette}</Text>
                        <Text style={localStyles.itemText}><Text style={localStyles.bold}>Produit:</Text> {scannedPalette.produitNom}</Text>
                        <Text style={localStyles.itemText}><Text style={localStyles.bold}>Poids Net:</Text> {scannedPalette.poidsNet} kg</Text>
                    </>
                    )}
                    {isValidationLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                    ) : (
                    <View style={localStyles.modalButtonContainer}>
                        <Button title="Annuler" onPress={handleCancelValidation} color={Colors.danger} />
                        <Button title="Valider" onPress={handleValidation} color={Colors.primary} />
                    </View>
                    )}
                </View>
                </View>
            </Modal>

            <View style={localStyles.buttonContainer}>
                <Button
                title="Déclarer une Palette"
                onPress={() => setCameraVisible(true)}
                color={Colors.primary}
                />
            </View>
            <FlatList
                data={declaredPalettes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={Styles.emptyText}>Aucune palette déclarée.</Text>}
                contentContainerStyle={Styles.list}
            />
        </>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  buttonContainer: { margin: 16, borderRadius: 8, overflow: 'hidden' },
  itemContainer: { ...Styles.card, padding: 16, marginBottom: 12 },
  itemText: { fontSize: 16, color: Colors.textDark, marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default DeclarationPaletteScreen;
