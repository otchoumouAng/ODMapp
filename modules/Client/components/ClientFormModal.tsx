import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  ScrollView
} from 'react-native';
import Modal from 'react-native-modal';
import { Feather as Icon } from '@expo/vector-icons';
import { Client, ModalMode } from '../types';

interface ClientFormModalProps {
  visible: boolean;
  mode: ModalMode;
  client?: Client;
  onClose: () => void;
  onSubmit: (data: Partial<Client>) => Promise<void>;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  visible,
  mode,
  client,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setFormData(client || {});
      setError(null);
    }
  }, [visible, client]);

  const handleChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation simplifiée - seul le nom est obligatoire
    if (mode === 'create' && !formData.nom) {
      setError('Le nom est obligatoire');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Préparer les données en fonction du mode
      let submitData: Partial<Client>;
      
      if (mode === 'create') {
        submitData = {
          ...formData,
          creationUtilisateur: 'admin',
          modificationUtilisateur: 'admin'
        };
      } else if (mode === 'edit') {
        submitData = {
          ...formData,
          modificationUtilisateur: 'admin'
        };
      } else {
        submitData = formData;
      }

      // Supprimer les propriétés non désirées
      delete submitData.rowVersionKey;
      
      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      backdropTransitionOutTiming={0}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {mode === 'view' ? 'Détails Client' : mode === 'edit' ? 'Modifier Client' : 'Nouveau Client'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderField('Nom', 'nom', true)}
          {renderField('Adresse', 'adresse')}
          {renderField('Téléphone Fixe', 'telephoneFixe')}
          {renderField('Téléphone Mobile', 'telephoneMobile')}
          {renderField('Fax', 'fax')}
        </ScrollView>

        {!isViewMode && (
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Icon 
                  name={mode === 'create' ? 'plus' : 'check'} 
                  size={20} 
                  color="white" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {mode === 'create' ? 'Créer Client' : 'Appliquer Modifications'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isViewMode && (
          <TouchableOpacity
            style={styles.closeButtonSecondary}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Fermer</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );

  function renderField(label: string, field: keyof Client, required = false) {

    if (field === 'creationUtilisateur' || 
      field === 'modificationUtilisateur' || 
      field === 'rowVersionKey') {
    return null;
  }

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, isViewMode && styles.inputDisabled]}
          value={formData[field]?.toString() || ''}
          onChangeText={(text) => handleChange(field, text)}
          editable={!isViewMode}
          placeholder={`Saisir ${label.toLowerCase()}`}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
    fontSize: 15,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputDisabled: {
    backgroundColor: '#f8fafc',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  closeButtonSecondary: {
    backgroundColor: '#64748b',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default ClientFormModal;