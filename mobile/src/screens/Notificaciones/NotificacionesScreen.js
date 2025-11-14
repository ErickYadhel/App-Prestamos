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

const NotificacionesScreen = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filteredNotificaciones, setFilteredNotificaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todas'); // 'todas', 'enviadas', 'pendientes'
  const [nuevaNotificacionModal, setNuevaNotificacionModal] = useState(false);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  useEffect(() => {
    filterNotificaciones();
  }, [searchTerm, notificaciones, activeFilter]);

  const fetchNotificaciones = async () => {
    try {
      // Datos mock
      const mockNotificaciones = [
        {
          id: '1',
          tipo: 'pago_recordatorio',
          destinatario: 'Juan Pérez',
          telefono: '809-123-4567',
          mensaje: 'Recordatorio EYS Inversiones: Sr. Juan Pérez, tiene un pago pendiente de RD$ 1,500. Fecha límite: 15/02/2024',
          enviada: true,
          fechaEnvio: '2024-02-10T10:30:00',
          fechaProgramada: '2024-02-10T10:00:00',
          intentos: 1,
          error: null,
          metadata: {
            clienteID: '1',
            monto: 1500,
            fechaLimite: '2024-02-15'
          }
        },
        {
          id: '2',
          tipo: 'mora',
          destinatario: 'María Rodríguez',
          telefono: '809-987-6543',
          mensaje: 'Alerta EYS Inversiones: Sra. María Rodríguez, su préstamo está en mora. Capital pendiente: RD$ 8,000. Contacte con nosotros.',
          enviada: false,
          fechaEnvio: null,
          fechaProgramada: '2024-02-12T09:00:00',
          intentos: 0,
          error: null,
          metadata: {
            clienteID: '2',
            capitalPendiente: 8000,
            diasMora: 5
          }
        },
        {
          id: '3',
          tipo: 'pago_confirmacion',
          destinatario: 'Carlos López',
          telefono: '809-555-7890',
          mensaje: 'Confirmación EYS Inversiones: Sr. Carlos López, hemos recibido su pago de RD$ 2,000. Nuevo saldo: RD$ 10,000. ¡Gracias!',
          enviada: true,
          fechaEnvio: '2024-02-08T14:20:00',
          fechaProgramada: '2024-02-08T14:15:00',
          intentos: 1,
          error: null,
          metadata: {
            clienteID: '3',
            montoPagado: 2000,
            nuevoSaldo: 10000
          }
        },
        {
          id: '4',
          tipo: 'solicitud_nueva',
          destinatario: 'Admin EYS',
          telefono: '809-111-2222',
          mensaje: 'Nueva solicitud de préstamo: Roberto Sánchez solicita RD$ 20,000 a 6 meses. Revisar en sistema.',
          enviada: true,
          fechaEnvio: '2024-02-12T08:45:00',
          fechaProgramada: '2024-02-12T08:30:00',
          intentos: 1,
          error: null,
          metadata: {
            solicitudID: '1',
            montoSolicitado: 20000,
            plazoMeses: 6
          }
        }
      ];
      setNotificaciones(mockNotificaciones);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterNotificaciones = () => {
    let filtered = notificaciones;

    // Filtrar por estado
    if (activeFilter === 'enviadas') {
      filtered = filtered.filter(n => n.enviada);
    } else if (activeFilter === 'pendientes') {
      filtered = filtered.filter(n => !n.enviada);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotificaciones(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificaciones();
  };

  const getTipoStyles = (tipo) => {
    switch (tipo) {
      case 'pago_recordatorio':
        return { backgroundColor: '#dbeafe', color: '#1e40af', icon: 'time' };
      case 'mora':
        return { backgroundColor: '#fecaca', color: '#dc2626', icon: 'warning' };
      case 'pago_confirmacion':
        return { backgroundColor: '#dcfce7', color: '#166534', icon: 'checkmark-circle' };
      case 'solicitud_nueva':
        return { backgroundColor: '#f3e8ff', color: '#7c3aed', icon: 'document-text' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280', icon: 'notifications' };
    }
  };

  const getTipoText = (tipo) => {
    const tipos = {
      pago_recordatorio: 'Recordatorio',
      mora: 'Alerta Mora',
      pago_confirmacion: 'Confirmación',
      solicitud_nueva: 'Nueva Solicitud',
      personalizado: 'Personalizado'
    };
    return tipos[tipo] || tipo;
  };

  const handleViewNotificacion = (notificacion) => {
    setSelectedNotificacion(notificacion);
    setModalVisible(true);
  };

  const handleReenviar = (notificacionId) => {
    Alert.alert(
      'Reenviar Notificación',
      '¿Estás seguro de que quieres reenviar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reenviar', 
          style: 'default',
          onPress: () => {
            // Lógica para reenviar
            setNotificaciones(prev =>
              prev.map(n =>
                n.id === notificacionId
                  ? { ...n, enviada: false, intentos: n.intentos + 1 }
                  : n
              )
            );
            Alert.alert('Éxito', 'Notificación programada para reenvío');
          }
        }
      ]
    );
  };

  const handleEnviarManual = (notificacionId) => {
    const notificacion = notificaciones.find(n => n.id === notificacionId);
    if (notificacion) {
      const mensajeCodificado = encodeURIComponent(notificacion.mensaje);
      const whatsappUrl = `https://wa.me/${notificacion.telefono}?text=${mensajeCodificado}`;
      
      Alert.alert(
        'Enviar por WhatsApp',
        `Se abrirá WhatsApp para enviar mensaje a ${notificacion.destinatario}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Abrir WhatsApp', 
            onPress: () => {
              // En una app real, aquí abriríamos el enlace
              Alert.alert('WhatsApp', `URL: ${whatsappUrl}\n\nEn una app real, esto abriría WhatsApp.`);
            }
          }
        ]
      );
    }
  };

  const NotificacionCard = ({ notificacion }) => {
    const tipoStyles = getTipoStyles(notificacion.tipo);

    return (
      <TouchableOpacity 
        style={styles.notificacionCard}
        onPress={() => handleViewNotificacion(notificacion)}
      >
        <View style={styles.notificacionHeader}>
          <View style={styles.notificacionInfo}>
            <View style={styles.destinatarioRow}>
              <Ionicons name={tipoStyles.icon} size={16} color={tipoStyles.color} />
              <Text style={styles.destinatarioNombre}>{notificacion.destinatario}</Text>
              <Text style={styles.destinatarioTelefono}>• {notificacion.telefono}</Text>
            </View>
            <Text style={styles.notificacionFecha}>
              {notificacion.fechaEnvio 
                ? new Date(notificacion.fechaEnvio).toLocaleString()
                : `Programada: ${new Date(notificacion.fechaProgramada).toLocaleString()}`
              }
            </Text>
          </View>
          <View style={[styles.tipoBadge, { backgroundColor: tipoStyles.backgroundColor }]}>
            <Text style={[styles.tipoText, { color: tipoStyles.color }]}>
              {getTipoText(notificacion.tipo)}
            </Text>
          </View>
        </View>

        <View style={styles.mensajeContainer}>
          <Text style={styles.mensajeText} numberOfLines={2}>
            {notificacion.mensaje}
          </Text>
        </View>

        <View style={styles.notificacionFooter}>
          <View style={styles.estadoContainer}>
            {notificacion.enviada ? (
              <View style={styles.estadoEnviada}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text style={styles.estadoTextEnviada}>Enviada</Text>
              </View>
            ) : (
              <View style={styles.estadoPendiente}>
                <Ionicons name="time" size={14} color="#d97706" />
                <Text style={styles.estadoTextPendiente}>Pendiente</Text>
              </View>
            )}
            {notificacion.intentos > 0 && (
              <Text style={styles.intentosText}>
                {notificacion.intentos} intento{notificacion.intentos !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          <View style={styles.actionsContainer}>
            {!notificacion.enviada && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleReenviar(notificacion.id)}
              >
                <Ionicons name="refresh" size={16} color="#3b82f6" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEnviarManual(notificacion.id)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const NotificacionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de Notificación</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedNotificacion && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Información General</Text>
                <InfoRow label="Destinatario" value={selectedNotificacion.destinatario} />
                <InfoRow label="Teléfono" value={selectedNotificacion.telefono} />
                <InfoRow label="Tipo" value={getTipoText(selectedNotificacion.tipo)} />
                <InfoRow 
                  label="Estado" 
                  value={selectedNotificacion.enviada ? 'Enviada' : 'Pendiente'} 
                />
                {selectedNotificacion.intentos > 0 && (
                  <InfoRow label="Intentos" value={selectedNotificacion.intentos.toString()} />
                )}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Mensaje</Text>
                <View style={styles.mensajeBox}>
                  <Text style={styles.mensajeModalText}>
                    {selectedNotificacion.mensaje}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Programación</Text>
                <InfoRow 
                  label="Fecha Programada" 
                  value={new Date(selectedNotificacion.fechaProgramada).toLocaleString()} 
                />
                {selectedNotificacion.fechaEnvio && (
                  <InfoRow 
                    label="Fecha de Envío" 
                    value={new Date(selectedNotificacion.fechaEnvio).toLocaleString()} 
                  />
                )}
              </View>

              {selectedNotificacion.metadata && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Metadatos</Text>
                  {Object.entries(selectedNotificacion.metadata).map(([key, value]) => (
                    <InfoRow 
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      value={typeof value === 'number' ? value.toLocaleString() : value.toString()}
                    />
                  ))}
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
            <TouchableOpacity 
              style={[styles.modalButton, styles.primaryButton]}
              onPress={() => {
                setModalVisible(false);
                handleEnviarManual(selectedNotificacion.id);
              }}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Enviar por WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const NuevaNotificacionModal = () => {
    const [formData, setFormData] = useState({
      tipo: 'pago_recordatorio',
      destinatario: '',
      telefono: '',
      mensaje: ''
    });

    const tiposNotificacion = [
      { value: 'pago_recordatorio', label: 'Recordatorio de Pago' },
      { value: 'mora', label: 'Alerta de Mora' },
      { value: 'pago_confirmacion', label: 'Confirmación de Pago' },
      { value: 'personalizado', label: 'Mensaje Personalizado' }
    ];

    const handleEnviar = () => {
      if (!formData.telefono || !formData.mensaje) {
        Alert.alert('Error', 'Por favor complete el teléfono y el mensaje');
        return;
      }

      const nuevaNotificacion = {
        id: Date.now().toString(),
        ...formData,
        enviada: false,
        fechaProgramada: new Date().toISOString(),
        intentos: 0,
        metadata: {}
      };

      setNotificaciones(prev => [nuevaNotificacion, ...prev]);
      setNuevaNotificacionModal(false);
      setFormData({
        tipo: 'pago_recordatorio',
        destinatario: '',
        telefono: '',
        mensaje: ''
      });

      Alert.alert('Éxito', 'Notificación creada y programada para envío');
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={nuevaNotificacionModal}
        onRequestClose={() => setNuevaNotificacionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Notificación</Text>
              <TouchableOpacity onPress={() => setNuevaNotificacionModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Tipo de Notificación</Text>
                <View style={styles.tiposContainer}>
                  {tiposNotificacion.map(tipo => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[
                        styles.tipoOption,
                        formData.tipo === tipo.value && styles.tipoOptionActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, tipo: tipo.value }))}
                    >
                      <Text style={[
                        styles.tipoOptionText,
                        formData.tipo === tipo.value && styles.tipoOptionTextActive
                      ]}>
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Destinatario</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del destinatario"
                  value={formData.destinatario}
                  onChangeText={text => setFormData(prev => ({ ...prev, destinatario: text }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="809-123-4567"
                  value={formData.telefono}
                  onChangeText={text => setFormData(prev => ({ ...prev, telefono: text }))}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Mensaje *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Escribe el mensaje que se enviará por WhatsApp..."
                  value={formData.mensaje}
                  onChangeText={text => setFormData(prev => ({ ...prev, mensaje: text }))}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setNuevaNotificacionModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleEnviar}
              >
                <Text style={styles.primaryButtonText}>Programar Notificación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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

  // Estadísticas
  const enviadasCount = notificaciones.filter(n => n.enviada).length;
  const pendientesCount = notificaciones.filter(n => !n.enviada).length;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por destinatario o mensaje..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{notificaciones.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{enviadasCount}</Text>
          <Text style={styles.statLabel}>Enviadas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#d97706' }]}>{pendientesCount}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton
          title="Todas"
          value="todas"
          isActive={activeFilter === 'todas'}
          onPress={setActiveFilter}
        />
        <FilterButton
          title="Enviadas"
          value="enviadas"
          isActive={activeFilter === 'enviadas'}
          onPress={setActiveFilter}
        />
        <FilterButton
          title="Pendientes"
          value="pendientes"
          isActive={activeFilter === 'pendientes'}
          onPress={setActiveFilter}
        />
      </View>

      {/* Notificaciones List */}
      <ScrollView
        style={styles.notificacionesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotificaciones.map(notificacion => (
          <NotificacionCard key={notificacion.id} notificacion={notificacion} />
        ))}
        
        {filteredNotificaciones.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              {searchTerm ? 'No se encontraron notificaciones' : 'No hay notificaciones'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setNuevaNotificacionModal(true)}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <NotificacionModal />
      <NuevaNotificacionModal />
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
  notificacionesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  notificacionCard: {
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
  notificacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  notificacionInfo: {
    flex: 1,
  },
  destinatarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  destinatarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 6,
  },
  destinatarioTelefono: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  notificacionFecha: {
    fontSize: 11,
    color: '#9ca3af',
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
  mensajeContainer: {
    marginBottom: 10,
  },
  mensajeText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  notificacionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estadoEnviada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estadoPendiente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estadoTextEnviada: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  estadoTextPendiente: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  intentosText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
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
    maxHeight: '90%',
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
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  tiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipoOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  tipoOptionActive: {
    backgroundColor: '#dc2626',
  },
  tipoOptionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tipoOptionTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  mensajeBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
  },
  mensajeModalText: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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

export default NotificacionesScreen;