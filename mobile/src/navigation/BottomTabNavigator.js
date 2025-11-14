import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ClientesScreen from '../screens/Clientes/ClientesScreen';
import PrestamosScreen from '../screens/Prestamos/PrestamosScreen';
import PagosScreen from '../screens/Pagos/PagosScreen';
import SolicitudesScreen from '../screens/Solicitudes/SolicitudesScreen';
import GarantesScreen from '../screens/Garantes/GarantesScreen';
import NotificacionesScreen from '../screens/Notificaciones/NotificacionesScreen';
import ConfiguracionScreen from '../screens/Configuracion/ConfiguracionScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Clientes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Préstamos') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Pagos') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Solicitudes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Garantes') {
            iconName = focused ? 'people-circle' : 'people-circle-outline';
          } else if (route.name === 'Notificaciones') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Configuración') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#dc2626',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Clientes" component={ClientesScreen} />
      <Tab.Screen name="Préstamos" component={PrestamosScreen} />
      <Tab.Screen name="Pagos" component={PagosScreen} />
      <Tab.Screen name="Solicitudes" component={SolicitudesScreen} />
      <Tab.Screen name="Garantes" component={GarantesScreen} />
      <Tab.Screen name="Notificaciones" component={NotificacionesScreen} />
      <Tab.Screen name="Configuración" component={ConfiguracionScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;