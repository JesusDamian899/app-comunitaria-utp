import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppProvider } from './src/context/AppContext';
import { TopHeader } from './src/components/TopHeader';
import { Toast } from './src/components/Toast';
import { FloatingSosButton } from './src/components/FloatingSosButton';
import { SosModal } from './src/screens/SosModal';

import { InicioScreen } from './src/screens/InicioScreen';
import { ServiciosScreen } from './src/screens/ServiciosScreen';
import { MapaScreen } from './src/screens/MapaScreen';
import { SolidaridadScreen } from './src/screens/SolidaridadScreen';
import { PerfilScreen } from './src/screens/PerfilScreen';
import { AuthGuard } from './src/components/AuthGuard';

  

  
const Tab = createBottomTabNavigator();

function MainNavigator() {
  const insets = useSafeAreaInsets();
  const bottomBarPadding = insets.bottom > 0 ? insets.bottom : 8;
  const bottomBarHeight = 56 + bottomBarPadding;

  return (
    <View style={styles.mainContainer}>
      <TopHeader />
      <Toast />

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1d4ed8',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            height: bottomBarHeight,
            paddingBottom: bottomBarPadding,
            paddingTop: 6,
            elevation: 12,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.06,
            shadowRadius: 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: -2,
          },
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={InicioScreen}
          options={{
            tabBarLabel: 'Inicio',
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome5 name="home" size={focused ? 21 : 19} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Servicios"
          component={ServiciosScreen}
          options={{
            tabBarLabel: 'Servicios',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'construct' : 'construct-outline'} size={focused ? 23 : 21} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Mapa"
          component={MapaScreen}
          options={{
            tabBarLabel: 'Mapa',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'map' : 'map-outline'} size={focused ? 23 : 21} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Solidaridad"
          component={SolidaridadScreen}
          options={{
            tabBarLabel: 'Solidaridad',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'hand-heart' : 'hand-heart-outline'}
                size={focused ? 24 : 22}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={focused ? 23 : 21} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      <FloatingSosButton />
      <SosModal />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AuthGuard>
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        </AuthGuard>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
