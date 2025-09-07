import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  RefreshControl
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import ClientFormModal from './ClientFormModal';
import { getClients, createClient, updateClient } from '../routes';
import { Client, ModalMode } from '../types';

const ClientTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const handleRowPress = (id: number) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap
      const client = clients.find(c => c.id === id);
      if (client) {
        setCurrentClient(client);
        setModalMode('view');
        setModalVisible(true);
      }
    } else {
      // Single tap
      setSelectedId(id === selectedId ? null : id);
    }
    lastTapRef.current = now;
  };

  const handleCreate = () => {
    setCurrentClient(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleEdit = () => {
    if (selectedId) {
      const client = clients.find(c => c.id === selectedId);
      if (client) {
        setCurrentClient(client);
        setModalMode('edit');
        setModalVisible(true);
      }
    }
  };

  const handleSubmit = async (data: Partial<Client>) => {
    try {
      if (modalMode === 'create') {
        await createClient(data as Omit<Client, 'id'>);
      } else if (modalMode === 'edit' && selectedId) {
        await updateClient(selectedId, data);
      }
      fetchClients();
    } catch (err: any) {
      throw err;
    }
  };

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      onPress={() => handleRowPress(item.id)}
      style={[
        styles.clientCard,
        selectedId === item.id && styles.selectedClientCard
      ]}
    >
      <Text style={styles.clientName}>{item.nom}</Text>
      {item.adresse && <Text style={styles.clientInfo}>{item.adresse}</Text>}
      <View style={styles.phoneContainer}>
        {item.telephoneMobile && (
          <Text style={styles.clientPhone}>{item.telephoneMobile}</Text>
        )}
        {item.telephoneFixe && (
          <Text style={styles.clientPhone}>{item.telephoneFixe}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header amélioré */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="people" size={28} color="#3b82f6" style={styles.icon} />
          <Text style={styles.title}>Clients</Text>
        </View>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, styles.newButton]}
            onPress={handleCreate}
          >
            <Icon name="plus" size={18} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton, !selectedId && styles.disabledButton]}
            onPress={handleEdit}
            disabled={!selectedId}
          >
            <Icon name="edit" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchClients}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="users" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Aucun client trouvé</Text>
            </View>
          }
          contentContainerStyle={clients.length === 0 && styles.flatListContent}
        />
      )}

      {/* Modal */}
      <ClientFormModal
        visible={modalVisible}
        mode={modalMode}
        client={currentClient || undefined}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    paddingTop: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newButton: {
    backgroundColor: '#3b82f6',
  },
  editButton: {
    backgroundColor: '#64748b',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  clientCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  selectedClientCard: {
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    backgroundColor: '#f0f7ff',
  },
  clientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  clientInfo: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
    lineHeight: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  clientPhone: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 18,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
    marginTop: 16,
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default ClientTable;