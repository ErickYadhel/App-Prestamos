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

const SolicitudesScreen = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('pendientes'); // 'pendientes', 'aprobadas', 'rechazadas'

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  useEffect(() => {
    filterSolicitudes();
  }, [searchTerm, solicitudes, activeFilter]);

  const fetchSolicitudes = async () => {
    try {
      // Datos mock
      const mockSolicitudes = [
        {
          id: '1',
          clienteNombre: 'Roberto Sánchez',
          telefono: '809-444-5566',
          email: 'roberto@email.com',
          montoSolicitado: 20000,
          plazoMeses: 6,
          frecuencia: 'quincenal',
          fechaSolicitud: '2024-02-12T09:30:00',
          estado: 'pendiente',
          empleadoNombre: 'Carlos Ruiz',
          cuentaCliente: '123-4567890-1',
          lugarTrabajo: 'Supermercado ABC',
          sueldoCliente: 28000,
          observaciones: 'Cliente referido por María'
        },
        {
          id: '2',
          clienteNombre: 'Laura Hernández',
          telefono: '809-777-8888',
          email: 'laura@email.com',
          montoSolicitado: 15000,
          plazoMeses: 12,
          frecuencia: 'mensual',
          fechaSolicitud: '2024-02-11T14:20:00',
          estado: 'aprobada',
          aprobadorPor: 'Admin EYS',
          fechaDecision: '2024-02-12T10:15:00',
          empleadoNombre: 'Ana García',
          cuentaCliente: '987-6543210-2',
          lugarTrabajo: 'Escuela Primaria',
          sueldoCliente: 32000,
          observaciones: 'Buena referencia laboral'
        },
        {
          id: '3',
          clienteNombre: 'Miguel Torres',
          telefono: '809-333-2222',
          email: 'miguel@email.com',
          montoSolicitado: 30000,
          plazoMeses: 8,
          frecuencia: 'semanal',
          fechaSolicitud: '2024-02-10T11:45:00',
          estado: 'rechazada',
          aprobadorPor: 'Admin EYS',
          fechaDecision: '2024-02-11T16:30:00',
          empleadoNombre: 'Pedro Martínez',
          cuentaCliente: '456-7890123-4',
          lugarTrabajo: 'Taxista independiente',
          sueldoCliente: 18000,
          observaciones: 'Ingresos insuficientes para el monto solicitado'
        }
      ];
      setSolicitudes(mockSolicitudes);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterSolicitudes = () => {
    let filtered = solicitudes;

    // Filtrar por estado
    if (activeFilter !== 'todas') {
      filtered = filtered.filter(s => s.estado === activeFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.empleadoNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSolicitudes(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const getEstadoStyles = (estado) => {
    switch (estado) {
      case 'pendiente':
        return { backgroundColor: '#fef3c7', color: '#d97706' };
      case 'aprobada':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'rechazada':
        return { backgroundColor: '#fecaca', color: '#dc2626' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getFrecuenciaText = (frecuencia) => {
    const frecuencias = {
      diario: 'Diario',
      semanal: 'Semanal',
      quincenal: 'Quincenal',
      mensual: 'Mensual'
    };
    return frecuencias[frecuencia] || frecuencia;
  };

  const handleViewSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalVisible(true);
  };

  const handleAprobar = (solicitudId) => {
    Alert.alert(
      'Aprobar Solicitud',
      '¿Estás seguro de que quieres aprobar esta solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aprobar', 
          style: 'default',
          onPress: () => {
            // Lógica para aprobar
            Alert.alert('Éxito', 'Solicitud aprobada correctamente');
          }
        }
      ]
    );
  };

  const handleRechazar = (solicitudId) => {
    Alert.alert(
      'Rechazar Solicitud',
      '¿Estás seguro de que quieres rechazar esta solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Rechazar', 
          style: 'destructive',
          onPress: () => {
            // Lógica para rechazar
            Alert.alert('Éxito', 'Solicitud rechazada correctamente');
          }
        }
      ]
    );
  };

  const SolicitudCard = ({ solicitud }) => {
    const estadoStyles = getEstadoStyles(solicitud.estado);

    return (
      <TouchableOpacity 
        style={styles.solicitudCard}
        onPress={() => handleViewSolicitud(solicitud)}
      >
        <View style={styles.solicitudHeader}>
          <View style={styles.solicitudInfo}>
            <Text style={styles.clienteNombre}>{solicitud.clienteNombre}</Text>
            <Text style={styles.empleadoNombre}>
              Por: {solicitud.empleadoNombre}
            </Text>
            <Text style={styles.solicitudFecha}>
              {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: estadoStyles.backgroundColor }]}>
            <Text style={[styles.statusText, { color: estadoStyles.color }]}>
              {solicitud.estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.solicitudDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Monto Solicitado</Text>
              <Text style={styles.detailValue}>RD$ {solicitud.montoSolicitado.toLocaleString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Plazo</Text>
              <Text style={styles.detailValue}>{solicitud.plazoMeses} meses</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Frecuencia</Text>
              <Text style={styles.detailValue}>{getFrecuenciaText(solicitud.frecuencia)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sueldo</Text>
              <Text style={styles.detailValue}>RD$ {solicitud.sueldoCliente.toLocaleString()}</Text>
            </View>
          </View>

          {solicitud.observaciones && (
            <View style={styles.observacionesContainer}>
              <Ionicons name="document-text-outline" size={14} color="#6b7280" />
              <Text style={styles.observacionesText} numberOfLines={2}>
                {solicitud.observaciones}
              </Text>
            </View>
          )}
        </View>

        {solicitud.estado === 'pendiente' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleAprobar(solicitud.id)}
            >
              <Ionicons name="checkmark" size={16} color="#ffffff" />
              <Text style={styles.approveButtonText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRechazar(solicitud.id)}
            >
              <Ionicons name="close" size={16} color="#ffffff" />
              <Text style={styles.rejectButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const SolicitudModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de la Solicitud</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedSolicitud && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información del Cliente</Text>
                <InfoRow label="Nombre" value={selectedSolicitud.clienteNombre} />
                <InfoRow label="Teléfono" value={selectedSolicitud.telefono} />
                <InfoRow label="Email" value={selectedSolicitud.email} />
                <InfoRow label="Cuenta Bancaria" value={selectedSolicitud.cuentaCliente} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información Laboral</Text>
                <InfoRow label="Lugar de Trabajo" value={selectedSolicitud.lugarTrabajo} />
                <InfoRow label="Sueldo" value={`RD$ ${selectedSolicitud.sueldoCliente.toLocaleString()}`} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Detalles del Préstamo</Text>
                <InfoRow label="Monto Solicitado" value={`RD$ ${selectedSolicitud.montoSolicitado.toLocaleString()}`} />
                <InfoRow label="Plazo" value={`${selectedSolicitud.plazoMeses} meses`} />
                <InfoRow label="Frecuencia de Pago" value={getFrecuenciaText(selectedSolicitud.frecuencia)} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información de la Solicitud</Text>
                <InfoRow label="Empleado" value={selectedSolicitud.empleadoNombre} />
                <InfoRow label="Fecha de Solicitud" value={new Date(selectedSolicitud.fechaSolicitud).toLocaleString()} />
                <InfoRow label="Estado" value={selectedSolicitud.estado.toUpperCase()} />
                
                {selectedSolicitud.fechaDecision && (
                  <InfoRow label="Fecha de Decisión" value={new Date(selectedSolicitud.fechaDecision).toLocaleString()} />
                )}
                {selectedSolicitud.aprobadorPor && (
                  <InfoRow label="Decidido por" value={selectedSolicitud.aprobadorPor} />
                )}
              </View>

              {selectedSolicitud.observaciones && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Observaciones</Text>
                  <View style={styles.observacionesBox}>
                    <Text style={styles.observacionesModalText}>
                      {selectedSolicitud.observaciones}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.secondaryButtonText}>Cerrar</Text>
            </TouchableOpacity>
            
            {selectedSolicitud?.estado === 'pendiente' && (
              <>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.rejectButton]}
                  onPress={() => handleRechazar(selectedSolicitud.id)}
                >
                  <Text style={styles.rejectButtonText}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.approveButton]}
                  onPress={() => handleAprobar(selectedSolicitud.id)}
                >
                  <Text style={styles.approveButtonText}>Aprobar</Text>
                </TouchableOpacity>
              </>
            )}
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

  const FilterButton = ({ title, value, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Estadísticas
  const pendientesCount = solicitudes.filter(s => s.estado === 'pendiente').length;
  const aprobadasCount = solicitudes.filter(s => s.estado === 'aprobada').length;
  const rechazadasCount = solicitudes.filter(s => s.estado === 'rechazada').length;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente o empleado..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{solicitudes.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#d97706' }]}>{pendientesCount}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#166534' }]}>{aprobadasCount}</Text>
          <Text style={styles.statLabel}>Aprobadas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#dc2626' }]}>{rechazadasCount}</Text>
          <Text style={styles.statLabel}>Rechazadas</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton
          title="Pendientes"
          value="pendientes"
          isActive={activeFilter === 'pendientes'}
          onPress={setActiveFilter}
        />
        <FilterButton
          title="Aprobadas"
          value="aprobadas"
          isActive={activeFilter === 'aprobadas'}
          onPress={setActiveFilter}
        />
        <FilterButton
          title="Rechazadas"
          value="rechazadas"
          isActive={activeFilter === 'rechazadas'}
          onPress={setActiveFilter}
        />
      </View>

      {/* Solicitudes List */}
      <ScrollView
        style={styles.solicitudesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredSolicitudes.map(solicitud => (
          <SolicitudCard key={solicitud.id} solicitud={solicitud} />
        ))}
        
        {filteredSolicitudes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes registradas'}
            </Text>
          </View>
        )}
      </ScrollView>

      <SolicitudModal />
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 5,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  solicitudesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  solicitudCard: {
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
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  solicitudInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  empleadoNombre: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  solicitudFecha: {
    fontSize: 11,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  solicitudDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  observacionesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  observacionesText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 5,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
  },
  approveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
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
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  observacionesBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
  },
  observacionesModalText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: 'bold',
  },
});

export default SolicitudesScreen;