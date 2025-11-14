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

const PrestamosScreen = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [filteredPrestamos, setFilteredPrestamos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('activos'); // 'activos', 'completados', 'morosos'

  useEffect(() => {
    fetchPrestamos();
  }, []);

  useEffect(() => {
    filterPrestamos();
  }, [searchTerm, prestamos, activeTab]);

  const fetchPrestamos = async () => {
    try {
      // Datos mock
      const mockPrestamos = [
        {
          id: '1',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          montoPrestado: 50000,
          capitalRestante: 35000,
          interesPercent: 10,
          frecuencia: 'quincenal',
          fechaPrestamo: '2024-01-15',
          estado: 'activo',
          fechaUltimoPago: '2024-02-01',
          fechaProximoPago: '2024-02-15',
          pagosRealizados: 3,
          totalPagos: 10
        },
        {
          id: '2',
          clienteID: '2',
          clienteNombre: 'María Rodríguez',
          montoPrestado: 25000,
          capitalRestante: 15000,
          interesPercent: 8,
          frecuencia: 'mensual',
          fechaPrestamo: '2024-01-20',
          estado: 'activo',
          fechaUltimoPago: '2024-02-01',
          fechaProximoPago: '2024-03-01',
          pagosRealizados: 1,
          totalPagos: 6
        },
        {
          id: '3',
          clienteID: '3',
          clienteNombre: 'Carlos López',
          montoPrestado: 75000,
          capitalRestante: 0,
          interesPercent: 12,
          frecuencia: 'semanal',
          fechaPrestamo: '2023-12-01',
          estado: 'completado',
          fechaUltimoPago: '2024-02-10',
          fechaProximoPago: null,
          pagosRealizados: 12,
          totalPagos: 12
        },
        {
          id: '4',
          clienteID: '4',
          clienteNombre: 'Ana Martínez',
          montoPrestado: 30000,
          capitalRestante: 12000,
          interesPercent: 15,
          frecuencia: 'quincenal',
          fechaPrestamo: '2024-01-10',
          estado: 'moroso',
          fechaUltimoPago: '2024-01-25',
          fechaProximoPago: '2024-02-10',
          pagosRealizados: 2,
          totalPagos: 6,
          diasMora: 5
        }
      ];
      setPrestamos(mockPrestamos);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los préstamos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPrestamos = () => {
    let filtered = prestamos;

    // Filtrar por estado
    if (activeTab !== 'todos') {
      filtered = filtered.filter(p => p.estado === activeTab);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrestamos(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrestamos();
  };

  const calcularInteres = (prestamo) => {
    return (prestamo.capitalRestante * prestamo.interesPercent) / 100;
  };

  const getEstadoStyles = (estado) => {
    switch (estado) {
      case 'activo':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'completado':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'moroso':
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

  const handleViewPrestamo = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setModalVisible(true);
  };

  const PrestamoCard = ({ prestamo }) => {
    const estadoStyles = getEstadoStyles(prestamo.estado);
    const interesMensual = calcularInteres(prestamo);

    return (
      <TouchableOpacity 
        style={styles.prestamoCard}
        onPress={() => handleViewPrestamo(prestamo)}
      >
        <View style={styles.prestamoHeader}>
          <View style={styles.prestamoInfo}>
            <Text style={styles.clienteNombre}>{prestamo.clienteNombre}</Text>
            <Text style={styles.prestamoFecha}>
              Iniciado: {new Date(prestamo.fechaPrestamo).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: estadoStyles.backgroundColor }]}>
            <Text style={[styles.statusText, { color: estadoStyles.color }]}>
              {prestamo.estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.prestamoDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Monto Prestado</Text>
              <Text style={styles.detailValue}>RD$ {prestamo.montoPrestado.toLocaleString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Saldo Pendiente</Text>
              <Text style={styles.detailValue}>RD$ {prestamo.capitalRestante.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Interés</Text>
              <Text style={styles.detailValue}>{prestamo.interesPercent}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Interés Mensual</Text>
              <Text style={styles.detailValue}>RD$ {interesMensual.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Frecuencia</Text>
              <Text style={styles.detailValue}>{getFrecuenciaText(prestamo.frecuencia)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Próximo Pago</Text>
              <Text style={styles.detailValue}>
                {prestamo.fechaProximoPago 
                  ? new Date(prestamo.fechaProximoPago).toLocaleDateString()
                  : 'Completado'
                }
              </Text>
            </View>
          </View>
        </View>

        {prestamo.estado === 'moroso' && (
          <View style={styles.moraAlert}>
            <Ionicons name="warning" size={16} color="#dc2626" />
            <Text style={styles.moraText}>En mora: {prestamo.diasMora} días</Text>
          </View>
        )}

        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${(prestamo.pagosRealizados / prestamo.totalPagos) * 100}%`,
                backgroundColor: prestamo.estado === 'moroso' ? '#dc2626' : '#10b981'
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {prestamo.pagosRealizados} de {prestamo.totalPagos} pagos realizados
        </Text>
      </TouchableOpacity>
    );
  };

  const PrestamoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Préstamo</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedPrestamo && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información General</Text>
                <InfoRow label="Cliente" value={selectedPrestamo.clienteNombre} />
                <InfoRow label="Estado" value={selectedPrestamo.estado.toUpperCase()} />
                <InfoRow 
                  label="Fecha de Préstamo" 
                  value={new Date(selectedPrestamo.fechaPrestamo).toLocaleDateString()} 
                />
                <InfoRow label="Frecuencia" value={getFrecuenciaText(selectedPrestamo.frecuencia)} />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Montos</Text>
                <InfoRow 
                  label="Monto Prestado" 
                  value={`RD$ ${selectedPrestamo.montoPrestado.toLocaleString()}`} 
                />
                <InfoRow 
                  label="Capital Restante" 
                  value={`RD$ ${selectedPrestamo.capitalRestante.toLocaleString()}`} 
                />
                <InfoRow 
                  label="Interés" 
                  value={`${selectedPrestamo.interesPercent}%`} 
                />
                <InfoRow 
                  label="Interés Actual" 
                  value={`RD$ ${calcularInteres(selectedPrestamo).toLocaleString()}`} 
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Pagos</Text>
                <InfoRow 
                  label="Próximo Pago" 
                  value={
                    selectedPrestamo.fechaProximoPago 
                      ? new Date(selectedPrestamo.fechaProximoPago).toLocaleDateString()
                      : 'Completado'
                  } 
                />
                <InfoRow 
                  label="Último Pago" 
                  value={
                    selectedPrestamo.fechaUltimoPago 
                      ? new Date(selectedPrestamo.fechaUltimoPago).toLocaleDateString()
                      : 'No registrado'
                  } 
                />
                <InfoRow 
                  label="Progreso" 
                  value={`${selectedPrestamo.pagosRealizados} de ${selectedPrestamo.totalPagos} pagos`} 
                />
              </View>

              {selectedPrestamo.estado === 'moroso' && (
                <View style={styles.moraSection}>
                  <View style={styles.moraHeader}>
                    <Ionicons name="warning" size={20} color="#dc2626" />
                    <Text style={styles.moraTitle}>Préstamo en Mora</Text>
                  </View>
                  <Text style={styles.moraDescription}>
                    El préstamo lleva {selectedPrestamo.diasMora} días en mora. 
                    Se recomienda contactar al cliente.
                  </Text>
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
            <TouchableOpacity style={[styles.modalButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>Registrar Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const TabButton = ({ title, value, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Activos"
          value="activos"
          isActive={activeTab === 'activos'}
          onPress={setActiveTab}
        />
        <TabButton
          title="Completados"
          value="completados"
          isActive={activeTab === 'completados'}
          onPress={setActiveTab}
        />
        <TabButton
          title="Morosos"
          value="morosos"
          isActive={activeTab === 'morosos'}
          onPress={setActiveTab}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            RD$ {prestamos.reduce((sum, p) => sum + p.montoPrestado, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Prestado</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            RD$ {prestamos.reduce((sum, p) => sum + p.capitalRestante, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Por Cobrar</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {prestamos.filter(p => p.estado === 'activo').length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
      </View>

      {/* Préstamos List */}
      <ScrollView
        style={styles.prestamosList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPrestamos.map(prestamo => (
          <PrestamoCard key={prestamo.id} prestamo={prestamo} />
        ))}
        
        {filteredPrestamos.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              {searchTerm ? 'No se encontraron préstamos' : 'No hay préstamos registrados'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <PrestamoModal />
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#dc2626',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
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
  prestamosList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  prestamoCard: {
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
  prestamoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  prestamoInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  prestamoFecha: {
    fontSize: 12,
    color: '#6b7280',
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
  prestamoDetails: {
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
  moraAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  moraText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 5,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
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
    fontWeight: '600',
  },
  moraSection: {
    backgroundColor: '#fef2f2',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  moraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  moraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginLeft: 8,
  },
  moraDescription: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
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

export default PrestamosScreen;