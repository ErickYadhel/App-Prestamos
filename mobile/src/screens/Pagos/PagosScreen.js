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

const PagosScreen = () => {
  const [pagos, setPagos] = useState([]);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos', 'hoy', 'semana', 'mes'

  useEffect(() => {
    fetchPagos();
  }, []);

  useEffect(() => {
    filterPagos();
  }, [searchTerm, pagos, activeFilter]);

  const fetchPagos = async () => {
    try {
      // Datos mock
      const mockPagos = [
        {
          id: '1',
          prestamoID: '1',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          fechaPago: '2024-02-10T10:30:00',
          montoCapital: 1000,
          montoInteres: 500,
          tipoPago: 'normal',
          nota: 'Pago quincenal',
          capitalAnterior: 36000,
          capitalNuevo: 35000
        },
        {
          id: '2',
          prestamoID: '2',
          clienteID: '2',
          clienteNombre: 'María Rodríguez',
          fechaPago: '2024-02-01T14:20:00',
          montoCapital: 2000,
          montoInteres: 400,
          tipoPago: 'normal',
          nota: 'Pago mensual',
          capitalAnterior: 17000,
          capitalNuevo: 15000
        },
        {
          id: '3',
          prestamoID: '1',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          fechaPago: '2024-01-25T09:15:00',
          montoCapital: 1000,
          montoInteres: 500,
          tipoPago: 'normal',
          nota: 'Pago quincenal',
          capitalAnterior: 37000,
          capitalNuevo: 36000
        },
        {
          id: '4',
          prestamoID: '4',
          clienteID: '4',
          clienteNombre: 'Ana Martínez',
          fechaPago: '2024-01-25T16:45:00',
          montoCapital: 1500,
          montoInteres: 750,
          tipoPago: 'adelantado',
          nota: 'Pago adelantado',
          capitalAnterior: 13500,
          capitalNuevo: 12000
        }
      ];
      setPagos(mockPagos);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPagos = () => {
    let filtered = pagos;

    // Filtrar por período de tiempo
    const now = new Date();
    if (activeFilter === 'hoy') {
      filtered = filtered.filter(pago => {
        const pagoDate = new Date(pago.fechaPago);
        return pagoDate.toDateString() === now.toDateString();
      });
    } else if (activeFilter === 'semana') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(pago => new Date(pago.fechaPago) >= weekAgo);
    } else if (activeFilter === 'mes') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(pago => new Date(pago.fechaPago) >= monthAgo);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pago =>
        pago.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPagos(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPagos();
  };

  const getTipoPagoStyles = (tipoPago) => {
    switch (tipoPago) {
      case 'normal':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'adelantado':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'mora':
        return { backgroundColor: '#fecaca', color: '#dc2626' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getTipoPagoText = (tipoPago) => {
    const tipos = {
      normal: 'Normal',
      adelantado: 'Adelantado',
      mora: 'Mora'
    };
    return tipos[tipoPago] || tipoPago;
  };

  const handleViewPago = (pago) => {
    setSelectedPago(pago);
    setModalVisible(true);
  };

  const PagoCard = ({ pago }) => {
    const tipoStyles = getTipoPagoStyles(pago.tipoPago);
    const montoTotal = pago.montoCapital + pago.montoInteres;

    return (
      <TouchableOpacity 
        style={styles.pagoCard}
        onPress={() => handleViewPago(pago)}
      >
        <View style={styles.pagoHeader}>
          <View style={styles.pagoInfo}>
            <Text style={styles.clienteNombre}>{pago.clienteNombre}</Text>
            <Text style={styles.pagoFecha}>
              {new Date(pago.fechaPago).toLocaleDateString()} •{' '}
              {new Date(pago.fechaPago).toLocaleTimeString()}
            </Text>
          </View>
          <View style={[styles.tipoBadge, { backgroundColor: tipoStyles.backgroundColor }]}>
            <Text style={[styles.tipoText, { color: tipoStyles.color }]}>
              {getTipoPagoText(pago.tipoPago)}
            </Text>
          </View>
        </View>

        <View style={styles.pagoDetails}>
          <View style={styles.montoContainer}>
            <Text style={styles.montoTotal}>RD$ {montoTotal.toLocaleString()}</Text>
            <Text style={styles.montoDesglose}>
              Capital: RD$ {pago.montoCapital.toLocaleString()} •{' '}
              Interés: RD$ {pago.montoInteres.toLocaleString()}
            </Text>
          </View>

          <View style={styles.capitalProgress}>
            <Text style={styles.capitalText}>
              Capital: RD$ {pago.capitalAnterior.toLocaleString()} → RD$ {pago.capitalNuevo.toLocaleString()}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${((pago.capitalAnterior - pago.capitalNuevo) / pago.capitalAnterior) * 100}%`
                  }
                ]} 
              />
            </View>
          </View>

          {pago.nota && (
            <View style={styles.notaContainer}>
              <Ionicons name="document-text-outline" size={14} color="#6b7280" />
              <Text style={styles.notaText}>{pago.nota}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const PagoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Pago</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedPago && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información del Pago</Text>
                <InfoRow label="Cliente" value={selectedPago.clienteNombre} />
                <InfoRow 
                  label="Fecha y Hora" 
                  value={new Date(selectedPago.fechaPago).toLocaleString()} 
                />
                <InfoRow 
                  label="Tipo de Pago" 
                  value={getTipoPagoText(selectedPago.tipoPago)} 
                />
                {selectedPago.nota && (
                  <InfoRow label="Nota" value={selectedPago.nota} />
                )}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Montos</Text>
                <InfoRow 
                  label="Monto Total" 
                  value={`RD$ ${(selectedPago.montoCapital + selectedPago.montoInteres).toLocaleString()}`} 
                />
                <InfoRow 
                  label="Capital" 
                  value={`RD$ ${selectedPago.montoCapital.toLocaleString()}`} 
                />
                <InfoRow 
                  label="Interés" 
                  value={`RD$ ${selectedPago.montoInteres.toLocaleString()}`} 
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Evolución del Capital</Text>
                <View style={styles.capitalEvolution}>
                  <View style={styles.capitalStep}>
                    <Text style={styles.capitalLabel}>Anterior</Text>
                    <Text style={styles.capitalValue}>
                      RD$ {selectedPago.capitalAnterior.toLocaleString()}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#6b7280" />
                  <View style={styles.capitalStep}>
                    <Text style={styles.capitalLabel}>Nuevo</Text>
                    <Text style={styles.capitalValue}>
                      RD$ {selectedPago.capitalNuevo.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.reduction}>
                  <Text style={styles.reductionText}>
                    Reducción: RD$ {(selectedPago.capitalAnterior - selectedPago.capitalNuevo).toLocaleString()}
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
              <Text style={styles.primaryButtonText}>Compartir Recibo</Text>
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

  // Calcular estadísticas
  const totalHoy = pagos.filter(pago => {
    const pagoDate = new Date(pago.fechaPago);
    return pagoDate.toDateString() === new Date().toDateString();
  }).reduce((sum, pago) => sum + pago.montoCapital + pago.montoInteres, 0);

  const totalMes = pagos.filter(pago => {
    const pagoDate = new Date(pago.fechaPago);
    const monthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    return pagoDate >= monthAgo;
  }).reduce((sum, pago) => sum + pago.montoCapital + pago.montoInteres, 0);

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

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pagos.length}</Text>
          <Text style={styles.statLabel}>Total Pagos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>RD$ {totalHoy.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Hoy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>RD$ {totalMes.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Este Mes</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton
          title="Todos"
          value="todos"
          isActive={activeFilter === 'todos'}
          onPress={setActiveFilter}
        />
        <FilterButton
          title="Hoy"
          value="hoy"
          isActive={activeFilter === 'hoy'}
          onPress={setActiveFilter}
        />
        <FilterButton
          title="Semana"
          value="semana"
          isActive={activeFilter === 'semana'}
          onPress={setActiveFilter}
        />
        <FilterButton
          title="Mes"
          value="mes"
          isActive={activeFilter === 'mes'}
          onPress={setActiveFilter}
        />
      </View>

      {/* Pagos List */}
      <ScrollView
        style={styles.pagosList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPagos.map(pago => (
          <PagoCard key={pago.id} pago={pago} />
        ))}
        
        {filteredPagos.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              {searchTerm ? 'No se encontraron pagos' : 'No hay pagos registrados'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <PagoModal />
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
  pagosList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  pagoCard: {
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
  pagoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pagoInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  pagoFecha: {
    fontSize: 12,
    color: '#6b7280',
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipoText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pagoDetails: {
    marginBottom: 5,
  },
  montoContainer: {
    marginBottom: 10,
  },
  montoTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  montoDesglose: {
    fontSize: 12,
    color: '#6b7280',
  },
  capitalProgress: {
    marginBottom: 10,
  },
  capitalText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  notaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
  },
  notaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5,
    flex: 1,
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
  capitalEvolution: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  capitalStep: {
    alignItems: 'center',
    flex: 1,
  },
  capitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  capitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reduction: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  reductionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
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

export default PagosScreen;