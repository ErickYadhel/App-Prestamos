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

const GarantesScreen = () => {
  const [garantes, setGarantes] = useState([]);
  const [filteredGarantes, setFilteredGarantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGarante, setSelectedGarante] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchGarantes();
  }, []);

  useEffect(() => {
    filterGarantes();
  }, [searchTerm, garantes]);

  const fetchGarantes = async () => {
    try {
      // Datos mock
      const mockGarantes = [
        {
          id: '1',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          nombre: 'Roberto Sánchez',
          cedula: '001-1111111-1',
          edad: 45,
          celular: '809-111-2222',
          email: 'roberto@email.com',
          trabajo: 'Empresa ABC',
          sueldo: 40000,
          puesto: 'Gerente',
          direccion: 'Calle Principal #321',
          sector: 'Sector Norte',
          provincia: 'Santo Domingo',
          pais: 'República Dominicana',
          activo: true,
          fechaCreacion: '2024-01-15'
        },
        {
          id: '2',
          clienteID: '2',
          clienteNombre: 'María Rodríguez',
          nombre: 'Carlos Martínez',
          cedula: '002-2222222-2',
          edad: 38,
          celular: '809-333-4444',
          email: 'carlos@email.com',
          trabajo: 'Comerciante',
          sueldo: 35000,
          puesto: 'Dueño',
          direccion: 'Av. Central #654',
          sector: 'Sector Este',
          provincia: 'Santo Domingo',
          pais: 'República Dominicana',
          activo: true,
          fechaCreacion: '2024-01-20'
        },
        {
          id: '3',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          nombre: 'Ana López',
          cedula: '003-3333333-3',
          edad: 42,
          celular: '809-555-6666',
          email: 'ana@email.com',
          trabajo: 'Hospital Regional',
          sueldo: 45000,
          puesto: 'Enfermera',
          direccion: 'Calle 30 #789',
          sector: 'Sector Oeste',
          provincia: 'Santo Domingo',
          pais: 'República Dominicana',
          activo: false,
          fechaCreacion: '2024-02-01'
        }
      ];
      setGarantes(mockGarantes);
      setFilteredGarantes(mockGarantes);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los garantes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterGarantes = () => {
    if (searchTerm) {
      const filtered = garantes.filter(garante =>
        garante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garante.cedula.includes(searchTerm) ||
        garante.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGarantes(filtered);
    } else {
      setFilteredGarantes(garantes);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGarantes();
  };

  const handleViewGarante = (garante) => {
    setSelectedGarante(garante);
    setModalVisible(true);
  };

  const GaranteCard = ({ garante }) => (
    <TouchableOpacity 
      style={styles.garanteCard}
      onPress={() => handleViewGarante(garante)}
    >
      <View style={styles.garanteHeader}>
        <View style={styles.garanteInfo}>
          <Text style={styles.garanteNombre}>{garante.nombre}</Text>
          <Text style={styles.garanteCliente}>
            Garante de: {garante.clienteNombre}
          </Text>
          <Text style={styles.garanteCedula}>{garante.cedula}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: garante.activo ? '#dcfce7' : '#fecaca' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: garante.activo ? '#166534' : '#dc2626' }
          ]}>
            {garante.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      
      <View style={styles.garanteDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{garante.celular}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{garante.trabajo}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{garante.provincia}</Text>
        </View>
      </View>

      <View style={styles.garanteActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={20} color="#3b82f6" />
          <Text style={styles.actionText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#f59e0b" />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="person-outline" size={20} color="#10b981" />
          <Text style={styles.actionText}>Cliente</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const GaranteModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Garante</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedGarante && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <InfoRow label="Nombre" value={selectedGarante.nombre} />
                <InfoRow label="Cédula" value={selectedGarante.cedula} />
                <InfoRow label="Edad" value={`${selectedGarante.edad} años`} />
                <InfoRow label="Teléfono" value={selectedGarante.celular} />
                <InfoRow label="Email" value={selectedGarante.email} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información Laboral</Text>
                <InfoRow label="Trabajo" value={selectedGarante.trabajo} />
                <InfoRow label="Puesto" value={selectedGarante.puesto} />
                <InfoRow label="Sueldo" value={`RD$ ${selectedGarante.sueldo?.toLocaleString()}`} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Dirección</Text>
                <InfoRow label="Dirección" value={selectedGarante.direccion} />
                <InfoRow label="Sector" value={selectedGarante.sector} />
                <InfoRow label="Provincia" value={selectedGarante.provincia} />
                <InfoRow label="País" value={selectedGarante.pais} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Relación</Text>
                <InfoRow label="Cliente Principal" value={selectedGarante.clienteNombre} />
                <View style={styles.statusSection}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: selectedGarante.activo ? '#dcfce7' : '#fecaca' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: selectedGarante.activo ? '#166534' : '#dc2626' }
                    ]}>
                      {selectedGarante.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                  <Text style={styles.statusDescription}>
                    {selectedGarante.activo 
                      ? 'Puede ser garante de nuevos préstamos' 
                      : 'No puede ser garante de nuevos préstamos'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Préstamos Avalados</Text>
                <View style={styles.prestamosList}>
                  <View style={styles.prestamoItem}>
                    <Ionicons name="cash-outline" size={16} color="#10b981" />
                    <View style={styles.prestamoInfo}>
                      <Text style={styles.prestamoNombre}>Préstamo Juan Pérez</Text>
                      <Text style={styles.prestamoDetalle}>RD$ 50,000 • Activo</Text>
                    </View>
                  </View>
                  <View style={styles.prestamoItem}>
                    <Ionicons name="cash-outline" size={16} color="#10b981" />
                    <View style={styles.prestamoInfo}>
                      <Text style={styles.prestamoNombre}>Préstamo María Rodríguez</Text>
                      <Text style={styles.prestamoDetalle}>RD$ 25,000 • Completado</Text>
                    </View>
                  </View>
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
              <Text style={styles.primaryButtonText}>Ver Cliente</Text>
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
          placeholder="Buscar por nombre, cédula o cliente..."
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
          <Text style={styles.statNumber}>{filteredGarantes.length}</Text>
          <Text style={styles.statLabel}>Garantes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredGarantes.filter(g => g.activo).length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {new Set(filteredGarantes.map(g => g.clienteID)).size}
          </Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
      </View>

      {/* Garantes List */}
      <ScrollView
        style={styles.garantesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredGarantes.map(garante => (
          <GaranteCard key={garante.id} garante={garante} />
        ))}
        
        {filteredGarantes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              {searchTerm ? 'No se encontraron garantes' : 'No hay garantes registrados'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <GaranteModal />
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
  garantesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  garanteCard: {
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
  garanteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  garanteInfo: {
    flex: 1,
  },
  garanteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  garanteCliente: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  garanteCedula: {
    fontSize: 12,
    color: '#9ca3af',
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
  garanteDetails: {
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
  garanteActions: {
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
    maxHeight: '85%',
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
  prestamosList: {
    marginTop: 10,
  },
  prestamoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  prestamoInfo: {
    marginLeft: 10,
    flex: 1,
  },
  prestamoNombre: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  prestamoDetalle: {
    fontSize: 12,
    color: '#6b7280',
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

export default GarantesScreen;