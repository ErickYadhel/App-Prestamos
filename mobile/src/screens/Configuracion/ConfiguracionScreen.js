import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const ConfiguracionScreen = () => {
  const { user, logout } = useAuth();
  const [configuracion, setConfiguracion] = useState({
    empresaNombre: 'EYS Inversiones',
    ubicacion: 'Santo Domingo, República Dominicana',
    numero: '809-123-4567',
    correo: 'info@eysinversiones.com',
    moneda: 'DOP',
    capitalDisponible: 300000,
    notificacionesActivas: true,
    recordatoriosAutomaticos: true,
    modoOscuro: false,
  });

  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState(configuracion);

  useEffect(() => {
    // Cargar configuración actual
    setFormData(configuracion);
  }, [configuracion]);

  const handleGuardar = () => {
    setConfiguracion(formData);
    setEditando(false);
    Alert.alert('Éxito', 'Configuración guardada correctamente');
  };

  const handleCancelar = () => {
    setFormData(configuracion);
    setEditando(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const ConfigItem = ({ icon, label, value, onPress, isEditable = true }) => (
    <TouchableOpacity 
      style={styles.configItem}
      onPress={isEditable ? onPress : null}
      disabled={!isEditable}
    >
      <View style={styles.configItemLeft}>
        <Ionicons name={icon} size={20} color="#dc2626" />
        <View style={styles.configItemText}>
          <Text style={styles.configLabel}>{label}</Text>
          <Text style={styles.configValue}>{value}</Text>
        </View>
      </View>
      {isEditable && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  const ConfigSwitch = ({ icon, label, value, onValueChange }) => (
    <View style={styles.configItem}>
      <View style={styles.configItemLeft}>
        <Ionicons name={icon} size={20} color="#dc2626" />
        <Text style={styles.configLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#dc2626' }}
        thumbColor={value ? '#ffffff' : '#f3f4f6'}
      />
    </View>
  );

  const EditarModal = () => (
    <View style={styles.editarContainer}>
      <Text style={styles.editarTitle}>Editar Configuración</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre de la Empresa</Text>
        <TextInput
          style={styles.input}
          value={formData.empresaNombre}
          onChangeText={text => setFormData(prev => ({ ...prev, empresaNombre: text }))}
          placeholder="Nombre de la empresa"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={formData.ubicacion}
          onChangeText={text => setFormData(prev => ({ ...prev, ubicacion: text }))}
          placeholder="Ubicación"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={formData.numero}
          onChangeText={text => setFormData(prev => ({ ...prev, numero: text }))}
          placeholder="Teléfono"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.correo}
          onChangeText={text => setFormData(prev => ({ ...prev, correo: text }))}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Capital Disponible (RD$)</Text>
        <TextInput
          style={styles.input}
          value={formData.capitalDisponible.toString()}
          onChangeText={text => setFormData(prev => ({ ...prev, capitalDisponible: parseInt(text) || 0 }))}
          placeholder="Capital disponible"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.botonesContainer}>
        <TouchableOpacity 
          style={[styles.boton, styles.botonCancelar]}
          onPress={handleCancelar}
        >
          <Text style={styles.botonCancelarText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.boton, styles.botonGuardar]}
          onPress={handleGuardar}
        >
          <Text style={styles.botonGuardarText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header de Usuario */}
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#dc2626" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.nombre || 'Administrador'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@eysinversiones.com'}</Text>
          <Text style={styles.userRole}>{user?.rol || 'Administrador'}</Text>
        </View>
      </View>

      {/* Información de la Empresa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Empresa</Text>
        
        {editando ? (
          <EditarModal />
        ) : (
          <>
            <ConfigItem
              icon="business"
              label="Nombre de la Empresa"
              value={configuracion.empresaNombre}
              onPress={() => setEditando(true)}
            />
            <ConfigItem
              icon="location"
              label="Ubicación"
              value={configuracion.ubicacion}
              onPress={() => setEditando(true)}
            />
            <ConfigItem
              icon="call"
              label="Teléfono"
              value={configuracion.numero}
              onPress={() => setEditando(true)}
            />
            <ConfigItem
              icon="mail"
              label="Email"
              value={configuracion.correo}
              onPress={() => setEditando(true)}
            />
            <ConfigItem
              icon="cash"
              label="Capital Disponible"
              value={`RD$ ${configuracion.capitalDisponible.toLocaleString()}`}
              onPress={() => setEditando(true)}
            />
            <ConfigItem
              icon="card"
              label="Moneda"
              value={configuracion.moneda}
              onPress={() => setEditando(true)}
            />
          </>
        )}
      </View>

      {/* Configuraciones de Notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        <ConfigSwitch
          icon="notifications"
          label="Notificaciones Activas"
          value={formData.notificacionesActivas}
          onValueChange={value => setFormData(prev => ({ ...prev, notificacionesActivas: value }))}
        />
        
        <ConfigSwitch
          icon="time"
          label="Recordatorios Automáticos"
          value={formData.recordatoriosAutomaticos}
          onValueChange={value => setFormData(prev => ({ ...prev, recordatoriosAutomaticos: value }))}
        />
      </View>

      {/* Configuraciones de la App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias de la App</Text>
        
        <ConfigSwitch
          icon="moon"
          label="Modo Oscuro"
          value={formData.modoOscuro}
          onValueChange={value => setFormData(prev => ({ ...prev, modoOscuro: value }))}
        />
        
        <ConfigItem
          icon="language"
          label="Idioma"
          value="Español"
          onPress={() => Alert.alert('Idioma', 'Funcionalidad en desarrollo')}
        />
        
        <ConfigItem
          icon="lock-closed"
          label="Seguridad"
          value="Configurar"
          onPress={() => Alert.alert('Seguridad', 'Funcionalidad en desarrollo')}
        />
      </View>

      {/* Información del Sistema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sistema</Text>
        
        <ConfigItem
          icon="information-circle"
          label="Versión de la App"
          value="1.0.0"
          isEditable={false}
        />
        
        <ConfigItem
          icon="hardware-chip"
          label="API"
          value="Conectado"
          isEditable={false}
        />
        
        <ConfigItem
          icon="cloud"
          label="Base de Datos"
          value="Firebase"
          isEditable={false}
        />
      </View>

      {/* Acciones Peligrosas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.dangerButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Información de Desarrollo */}
      <View style={styles.devInfo}>
        <Text style={styles.devText}>EYS Inversiones v1.0.0</Text>
        <Text style={styles.devText}>Desarrollado con ❤️ para tu negocio</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  userHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configItemText: {
    marginLeft: 12,
    flex: 1,
  },
  configLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  configValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  editarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  editarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 5,
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
  botonesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  boton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#f3f4f6',
  },
  botonGuardar: {
    backgroundColor: '#dc2626',
  },
  botonCancelarText: {
    color: '#374151',
    fontWeight: 'bold',
  },
  botonGuardarText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
    marginLeft: 12,
  },
  devInfo: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  devText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default ConfiguracionScreen;