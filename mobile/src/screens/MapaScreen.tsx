import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CrisisMap } from '../components/CrisisMap';
import { useApp } from '../context/AppContext';

export const MapaScreen = () => {
  const { proximityRadius, setProximityRadius, isNetworkOnline, isCrisisRealActive } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Informativo */}
      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="map" size={24} color="#1d4ed8" />
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={styles.mainTitle}>Mapa Comunitario Interactivo</Text>
            <Text style={styles.subTitle}>
              Urb. Las Palmeras · {isNetworkOnline ? '🟢 GPS y Base de Datos Sincronizados' : '📡 Modo Local Offline'}
            </Text>
          </View>
        </View>

        {/* Radios de cobertura comunitaria */}
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>Radio de visualización:</Text>
          <View style={styles.radiusButtons}>
            {[
              { label: '500m', value: 500 as const },
              { label: '2km', value: 2000 as const },
              { label: '5km', value: 5000 as const },
            ].map((rad) => {
              const active = proximityRadius === rad.value;
              return (
                <TouchableOpacity
                  key={rad.value}
                  style={[styles.radBtn, active && styles.radBtnActive]}
                  onPress={() => setProximityRadius(rad.value)}
                >
                  <Text style={[styles.radBtnText, active && styles.radBtnTextActive]}>
                    📍 {rad.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Métricas rápidas de seguridad y recursos */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Ionicons name="water" size={16} color="#0284c7" />
            <Text style={styles.metricVal}>2</Text>
            <Text style={styles.metricName}>Agua</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="shield-checkmark" size={16} color="#16a34a" />
            <Text style={styles.metricVal}>1</Text>
            <Text style={styles.metricName}>Refugio</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="medkit" size={16} color="#dc2626" />
            <Text style={styles.metricVal}>1</Text>
            <Text style={styles.metricName}>Auxilio</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="warning" size={16} color="#f59e0b" />
            <Text style={styles.metricVal}>1</Text>
            <Text style={styles.metricName}>Clúster IA</Text>
          </View>
        </View>
      </View>

      {/* Componente Central de Mapa Interactivo (Nativo en Móvil / OpenStreetMap en Web) */}
      <View style={styles.mapWrapper}>
        <CrisisMap />
      </View>

      {/* Nota de Resiliencia Offline */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="database-check" size={18} color="#0369a1" />
        <Text style={styles.infoBoxText}>
          {isCrisisRealActive
            ? '⚠️ MODO CRISIS ACTIVO: Mostrando corredores de evacuación rápida y puntos críticos de asistencia.'
            : '✅ Los datos de recursos y zonas seguras están respaldados en caché local (SQLite) para funcionar ante cortes de red eléctrica e internet.'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  radiusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  radBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  radBtnActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  radBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  radBtnTextActive: {
    color: '#ffffff',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  metricName: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  mapWrapper: {
    marginBottom: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 11,
    color: '#0369a1',
    lineHeight: 16,
    fontWeight: '600',
  },
});
