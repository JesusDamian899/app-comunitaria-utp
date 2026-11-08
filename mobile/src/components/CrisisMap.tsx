import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useAuth } from './AuthGuard';
import { CURRENT_USER } from '../mock/data';

// /Fase4: Marcadores ficticios para la demo; reemplazar al conectar datos georreferenciados reales.
const MAP_ITEMS = [
  { id: 'vulnerable-1', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Sector Norte · Mz. A', latitude: -8.1858, longitude: -77.0761, icon: 'accessibility' },
  { id: 'vulnerable-2', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Calle Los Pinos · Mz. C', latitude: -8.1867, longitude: -77.0748, icon: 'accessibility' },
  { id: 'vulnerable-3', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Sector Sur · Mz. D', latitude: -8.1849, longitude: -77.0755, icon: 'accessibility' },
  { id: 'vulnerable-4', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Calle Los Sauces · Mz. B', latitude: -8.1871, longitude: -77.0765, icon: 'accessibility' },
  { id: 'resource-1', type: 'resource', label: 'Punto de agua', detail: 'Parque Central', latitude: -8.1854, longitude: -77.0742, icon: 'water' },
  { id: 'resource-2', type: 'resource', label: 'Puesto de primeros auxilios', detail: 'Local comunal', latitude: -8.1862, longitude: -77.075, icon: 'medkit' },
  { id: 'resource-3', type: 'resource', label: 'Zona segura', detail: 'Cancha vecinal', latitude: -8.187, longitude: -77.0744, icon: 'shield-checkmark' },
  { id: 'resource-4', type: 'resource', label: 'Punto de energía', detail: 'Sector Norte', latitude: -8.1849, longitude: -77.0763, icon: 'flash' },
  { id: 'resource-5', type: 'resource', label: 'Punto de agua', detail: 'Calle Los Sauces', latitude: -8.1864, longitude: -77.077, icon: 'water' },
  { id: 'cluster-1', type: 'cluster', label: 'Clúster de alertas', detail: 'Sector Norte · Gravedad crítica', latitude: -8.1857, longitude: -77.0758, icon: 'warning', count: 6 },
  { id: 'cluster-2', type: 'cluster', label: 'Clúster de alertas', detail: 'Bloque Los Sauces · Gravedad alta', latitude: -8.1866, longitude: -77.0741, icon: 'warning', count: 3 },
] as const;

type MapItem = (typeof MAP_ITEMS)[number];
type MapFilter = 'all' | MapItem['type'];

const MAP_REGION = {
  latitude: -8.186,
  longitude: -77.0754,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

const TYPE_LABELS: Record<MapItem['type'], string> = {
  vulnerable: 'Vulnerable',
  resource: 'Recurso',
  cluster: 'SOS / Clúster',
};

const TYPE_COLORS: Record<MapItem['type'], string> = {
  vulnerable: '#7c3aed',
  resource: '#0284c7',
  cluster: '#dc2626',
};

export const CrisisMap = () => {
  const mapRef = useRef<MapView | null>(null);
  const { currentUser } = useAuth();
  const user = currentUser || CURRENT_USER;
  const [activeFilter, setActiveFilter] = useState<MapFilter>('all');
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  // /Fase4: Vecinos ven capas agregadas; las ubicaciones vulnerables se reservan para la Junta.
  const canViewVulnerableLocations = user.role === 'Junta Vecinal';

  const availableFilters: { type: MapFilter; label: string; count?: number }[] = [
    { type: 'all', label: 'Todos' },
    { type: 'vulnerable', label: 'Vulnerables', count: MAP_ITEMS.filter((item) => item.type === 'vulnerable').length },
    { type: 'resource', label: 'Recursos', count: MAP_ITEMS.filter((item) => item.type === 'resource').length },
    { type: 'cluster', label: 'SOS / Clúster', count: MAP_ITEMS.filter((item) => item.type === 'cluster').length },
  ];
  const filters = availableFilters.filter((filter) =>
    canViewVulnerableLocations || filter.type !== 'vulnerable'
  );
  const visibleItems = MAP_ITEMS.filter((item) =>
    (canViewVulnerableLocations || item.type !== 'vulnerable') &&
    (activeFilter === 'all' || item.type === activeFilter)
  );
  const visibleClusters = visibleItems.filter((item) => item.type === 'cluster');

  const focusMap = (item: MapItem) => {
    setSelectedItem(item);
    mapRef.current?.animateToRegion({
      latitude: item.latitude,
      longitude: item.longitude,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    }, 350);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="map" size={17} color="#1d4ed8" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mapa de vulnerabilidad y recursos</Text>
          <Text style={styles.subtitle}>
            {canViewVulnerableLocations ? 'Vista Junta Vecinal' : 'Vista comunitaria agregada'} · Datos de demostración
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.type;
          return (
            <TouchableOpacity
              key={filter.type}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => {
                setActiveFilter(filter.type);
                if (selectedItem && filter.type !== 'all' && selectedItem.type !== filter.type) {
                  setSelectedItem(null);
                }
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter.label}{filter.count ? ` (${filter.count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.mapFrame}>
        {Platform.OS === 'web' ? (
          <View style={[styles.map, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', padding: 20 }]}>
            <Ionicons name="map-outline" size={40} color="#64748b" />
            <Text style={{ marginTop: 10, fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
              Mapa Comunitario Interactivo
            </Text>
            <Text style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 4 }}>
              Visualización con capas geográficas activa en dispositivos móviles Android e iOS con Expo Go.
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={MAP_REGION}
            onPress={() => setSelectedItem(null)}
            accessibilityLabel="Mapa comunitario de vulnerabilidad y recursos, con datos de demostración"
          >
            {visibleClusters.map((cluster) => (
              <Circle
                key={`${cluster.id}-radius`}
                center={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                radius={150}
                strokeColor="rgba(220, 38, 38, 0.8)"
                fillColor="rgba(220, 38, 38, 0.12)"
                strokeWidth={2}
              />
            ))}
            {visibleItems.map((item) => (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                title={item.label}
                description={item.detail}
                onPress={() => setSelectedItem(item)}
              >
                <View style={[styles.marker, { backgroundColor: TYPE_COLORS[item.type] }]}>
                  <Ionicons name={item.icon} size={16} color="#ffffff" />
                  {'count' in item && <Text style={styles.markerCount}>{item.count}</Text>}
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        <View pointerEvents="none" style={styles.demoBadge}>
          <View style={styles.demoDot} />
          <Text style={styles.demoText}>MUESTRA</Text>
        </View>
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            mapRef.current?.animateToRegion(MAP_REGION, 350);
            setSelectedItem(null);
          }}
          accessibilityLabel="Centrar mapa"
          accessibilityRole="button"
        >
          <Ionicons name="locate" size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        {(Object.keys(TYPE_LABELS) as MapItem['type'][]).map((type) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[type] }]} />
            <Text style={styles.legendText}>{TYPE_LABELS[type]}</Text>
          </View>
        ))}
      </View>

      {selectedItem && (
        <View style={styles.selectedItem}>
          <View style={[styles.selectedIcon, { backgroundColor: TYPE_COLORS[selectedItem.type] }]}>
            <Ionicons name={selectedItem.icon} size={16} color="#ffffff" />
          </View>
          <View style={styles.selectedText}>
            <Text style={styles.selectedTitle}>{selectedItem.label}</Text>
            <Text style={styles.selectedDetail}>{selectedItem.detail}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedItem(null)} accessibilityLabel="Cerrar detalle">
            <Ionicons name="close-circle" size={21} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.disclaimer}>Los marcadores son ficticios; no representan alertas reales.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3ec',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '900',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  filters: {
    gap: 6,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbe3ec',
    backgroundColor: '#f8fafc',
  },
  filterChipActive: {
    borderColor: '#0f172a',
    backgroundColor: '#0f172a',
  },
  filterText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  mapFrame: {
    height: 290,
    overflow: 'hidden',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#e2e8f0',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  demoBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  demoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d97706',
  },
  demoText: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '900',
  },
  recenterButton: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  marker: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    elevation: 4,
  },
  markerCount: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 52,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  selectedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    flex: 1,
  },
  selectedTitle: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '900',
  },
  selectedDetail: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  disclaimer: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 8,
  },
});