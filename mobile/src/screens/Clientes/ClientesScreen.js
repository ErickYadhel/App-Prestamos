import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const ClientesScreen = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cedula.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes(clientes);
    }
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      // Datos mock - luego conectaremos con API
      const mockClientes = [
        {
          id: '1',
          nombre: 'Juan Pérez',
          cedula: '001-1234567-8',
          edad: 35,
          celular: '809-123-4567',
          email: 'juan@email.com',
          trabajo: 'Empresa XYZ',
          sueldo: 35000,
          direccion: 'Calle Principal #123',
          sector: 'Sector Norte',
          provincia: 'Santo Domingo',
          activo: true,
          fechaCreacion: '2024-01-15'
        },
        {
          id: '2',
          nombre: 'María Rodríguez',
          cedula: '002-7654321-9',
          edad: 28,
          celular: '809-987-6543',
          email: 'maria@email.com',
          trabajo: 'Comerciante',
          sueldo: 25000,
          direccion: 'Av. Independencia #456',
          sector: 'Sector Este',
          provincia: 'Santo Domingo',
          activo: true,
          fechaCreacion: '2024-01-20'
        },
        {
          id: '3',
          nombre: 'Carlos López',
          cedula: '003-4567890-1',
          edad: 42,
          celular: '809-555-7890',
          email: 'carlos@email.com',
          trabajo: 'Constructor',
          sueldo: 45000,
          direccion: 'Calle 27 de Febrero #789',
          sector: 'Sector Oeste',
          provincia: 'Santiago',
          activo: false,
          fechaCreacion: '2024-02-01'
        }
      ];
      setClientes(mockClientes);
      setFilteredClientes(mockClientes);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClientes();
  };

  const handleViewCliente = (cliente) => {
    setSelectedCliente(cliente);
    setModalVisible(true);
  };

  const ClienteCard = ({ cliente }) => (
    <TouchableOpacity 
      style={styles.clienteCard}
      onPress={() => handleViewCliente(cliente)}
    >
      <View style={styles.clienteHeader}>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
          <Text style={styles.clienteCedula}>{cliente.cedula}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: cliente.activo ? '#dcfce7' : '#fecaca' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: cliente.activo ? '#166534' : '#dc2626' }
          ]}>
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      
      <View style={styles.clienteDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{cliente.celular}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{cliente.trabajo}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{cliente.provincia}</Text>
        </View>
      </View>

      <View style={styles.clienteActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={20} color="#3b82f6" />
          <Text style={styles.actionText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#f59e0b" />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="cash-outline" size={20} color="#10b981" />
          <Text style={styles.actionText}>Préstamo</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const ClienteModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Cliente</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedCliente && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <InfoRow label="Nombre" value={selectedCliente.nombre} />
                <InfoRow label="Cédula" value={selectedCliente.cedula} />
                <InfoRow label="Edad" value={`${selectedCliente.edad} años`} />
                <InfoRow label="Teléfono" value={selectedCliente.celular} />
                <InfoRow label="Email" value={selectedCliente.email} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información Laboral</Text>
                <InfoRow label="Trabajo" value={selectedCliente.trabajo} />
                <InfoRow label="Sueldo" value={`RD$ ${selectedCliente.sueldo?.toLocaleString()}`} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Dirección</Text>
                <InfoRow label="Dirección" value={selectedCliente.direccion} />
                <InfoRow label="Sector" value={selectedCliente.sector} />
                <InfoRow label="Provincia" value={selectedCliente.provincia} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Estado</Text>
                <View style={styles.statusSection}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: selectedCliente.activo ? '#dcfce7' : '#fecaca' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: selectedCliente.activo ? '#166534' : '#dc2626' }
                    ]}>
                      {selectedCliente.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                  <Text style={styles.statusDescription}>
                    {selectedCliente.activo 
                      ? 'Puede recibir nuevos préstamos' 
                      : 'No puede recibir nuevos préstamos'}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.secondaryButtonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>Nuevo Préstamo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o cédula..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9ca3af"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredClientes.length}</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredClientes.filter(c => c.activo).length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredClientes.filter(c => !c.activo).length}
          </Text>
          <Text style={styles.statLabel}>Inactivos</Text>
        </View>
      </View>

      {/* Clients List */}
      <ScrollView
        style={styles.clientesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredClientes.map(cliente => (
          <ClienteCard key={cliente.id} cliente={cliente} />
        ))}
        
        {filteredClientes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <ClienteModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  clientesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  clienteCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  clienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  clienteCedula: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clienteDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  clienteActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 10,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statusDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#dc2626',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: 'bold',
  },
});

export default ClientesScreen;