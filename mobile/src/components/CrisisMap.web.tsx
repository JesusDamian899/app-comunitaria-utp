import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENT_USER } from '../mock/data';

const MAP_ITEMS = [
  { id: 'vulnerable-1', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Sector Norte · Mz. A (Adulto Mayor)', latitude: -11.8671, longitude: -77.0761, icon: 'accessibility' },
  { id: 'vulnerable-2', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Calle Los Pinos · Mz. C (Movilidad Reducida)', latitude: -11.8667, longitude: -77.0748, icon: 'accessibility' },
  { id: 'vulnerable-3', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Sector Sur · Mz. D (Oxígeno Dependiente)', latitude: -11.8680, longitude: -77.0755, icon: 'accessibility' },
  { id: 'vulnerable-4', type: 'vulnerable', label: 'Persona vulnerable', detail: 'Calle Los Sauces · Mz. B (Madre Gestante)', latitude: -11.8675, longitude: -77.0765, icon: 'accessibility' },
  { id: 'resource-1', type: 'resource', label: 'Punto de agua potable', detail: 'Parque Central (Tanque Comunal 5,000L)', latitude: -11.8670, longitude: -77.0742, icon: 'water' },
  { id: 'resource-2', type: 'resource', label: 'Puesto primeros auxilios', detail: 'Local Comunal · Mz. B (Paramédico)', latitude: -11.8662, longitude: -77.0750, icon: 'medkit' },
  { id: 'resource-3', type: 'resource', label: 'Zona segura y refugio', detail: 'Cancha deportiva vecinal techada', latitude: -11.8682, longitude: -77.0744, icon: 'shield-checkmark' },
  { id: 'resource-4', type: 'resource', label: 'Punto de energía y carga', detail: 'Sector Norte (Generador Solar Comunal)', latitude: -11.8660, longitude: -77.0763, icon: 'flash' },
  { id: 'resource-5', type: 'resource', label: 'Punto de agua', detail: 'Calle Los Sauces 310 (Vecino Don Mario)', latitude: -11.8674, longitude: -77.0770, icon: 'water' },
  { id: 'cluster-1', type: 'cluster', label: 'Clúster IA (DBSCAN)', detail: 'Sector 2 · 5 reportes activos de Falta de Agua', latitude: -11.8675, longitude: -77.0754, icon: 'warning', count: 5 },
  { id: 'cluster-2', type: 'cluster', label: 'Clúster de alertas', detail: 'Bloque Los Sauces · Gravedad alta', latitude: -11.8666, longitude: -77.0741, icon: 'warning', count: 3 },
] as const;

type MapItem = (typeof MAP_ITEMS)[number];
type MapFilter = 'all' | MapItem['type'];

const TYPE_COLORS: Record<MapItem['type'], string> = {
  vulnerable: '#7c3aed',
  resource: '#0284c7',
  cluster: '#dc2626',
};

export const CrisisMap = () => {
  const [activeFilter, setActiveFilter] = useState<MapFilter>('all');
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

  const canViewVulnerableLocations = CURRENT_USER.role === 'Junta Vecinal';

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="map" size={17} color="#1d4ed8" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mapa de Recursos y Zonas Críticas (Web Interactivo)</Text>
          <Text style={styles.subtitle}>
            Urb. Las Palmeras · {canViewVulnerableLocations ? 'Vista Junta Vecinal' : 'Vista Vecinal Agregada'}
          </Text>
        </View>
      </View>

      {/* Filtros */}
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
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter.label}{filter.count ? ` (${filter.count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Mapa Visual con OpenStreetMap Interactivo */}
      <View style={styles.mapFrame}>
        <iframe
          title="OpenStreetMap Urb Las Palmeras"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src="https://www.openstreetmap.org/export/embed.html?bbox=-77.0820%2C-11.8720%2C-77.0680%2C-11.8620&amp;layer=mapnik&amp;marker=-11.8675%2C-77.0754"
          style={{ border: 0, width: '100%', height: '100%' }}
        />
        <View style={styles.mapBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.mapBadgeText}>GPS: -11.8675, -77.0754 (Urb. Las Palmeras)</Text>
        </View>
      </View>

      {/* Lista de Puntos y Marcadores Interactivos */}
      <Text style={styles.pointsTitle}>Puntos Activos ({visibleItems.length}):</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pointsScroll}>
        {visibleItems.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.pointCard, isSelected && styles.pointCardActive]}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.pointIconBg, { backgroundColor: TYPE_COLORS[item.type] }]}>
                <Ionicons name={item.icon as any} size={15} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pointLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.pointDetail} numberOfLines={1}>{item.detail}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detalle Seleccionado */}
      {selectedItem && (
        <View style={styles.selectedBox}>
          <View style={[styles.selectedIcon, { backgroundColor: TYPE_COLORS[selectedItem.type] }]}>
            <Ionicons name={selectedItem.icon as any} size={18} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedTitle}>{selectedItem.label}</Text>
            <Text style={styles.selectedDetail}>{selectedItem.detail}</Text>
            <Text style={styles.selectedCoord}>
              📍 Coordenadas: {selectedItem.latitude.toFixed(4)}, {selectedItem.longitude.toFixed(4)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedItem(null)}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginTop: 10,
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
    fontSize: 10.5,
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
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    position: 'relative',
  },
  mapBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16a34a',
  },
  mapBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
  },
  pointsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  pointsScroll: {
    flexDirection: 'row',
  },
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
  },
  pointCardActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  pointIconBg: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  pointDetail: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  selectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  selectedDetail: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 1,
  },
  selectedCoord: {
    fontSize: 9.5,
    color: '#1d4ed8',
    fontWeight: '700',
    marginTop: 2,
  },
});
