import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Circle, Marker } from 'react-native-maps';
import { CURRENT_USER } from '../mock/data';
import { useApp } from '../context/AppContext';

// Puntos georreferenciados para el DÍA A DÍA (Economía Local y Cadena de Favores)
const COMMUNITY_ITEMS = [
  { id: 'serv-1', type: 'servicio', label: 'Gasfitero: Don Pedro Sánchez', detail: 'Mz. A Lt. 4 · ⭐ 4.9 · Emergencias de agua/tuberías', latitude: -11.8671, longitude: -77.0761, icon: 'construct' },
  { id: 'serv-2', type: 'servicio', label: 'Cerrajería: Doña Rosa Quispe', detail: 'Calle Los Pinos 142 · ⭐ 5.0 · Copias y cerraduras', latitude: -11.8667, longitude: -77.0748, icon: 'key' },
  { id: 'serv-3', type: 'servicio', label: 'Electricista: Carlos Méndez', detail: 'Sector Sur Mz. D · ⭐ 4.8 · Instalaciones y tableros', latitude: -11.8680, longitude: -77.0755, icon: 'flash' },
  { id: 'serv-4', type: 'servicio', label: 'Clases y Apoyo: Lucía Alarcón', detail: 'Mz. C Lt. 8 · ⭐ 4.9 · Matemáticas y lectura escolar', latitude: -11.8675, longitude: -77.0765, icon: 'school' },
  { id: 'serv-5', type: 'servicio', label: 'Paseador Canino: Marcos Peña', detail: 'Calle Los Sauces 310 · ⭐ 4.7 · Cuidado responsable', latitude: -11.8674, longitude: -77.0770, icon: 'paw' },
  { id: 'favor-1', type: 'favor', label: 'Préstamo: Escalera Telescópica 6m', detail: 'Don Mario · Mz. B Lt. 12 · Préstamo gratis fin de semana', latitude: -11.8662, longitude: -77.0750, icon: 'gift' },
  { id: 'favor-2', type: 'favor', label: 'Donación: Pintura blanca y cajas', detail: 'Elena Torres · Sector Norte · Material para vecinos', latitude: -11.8660, longitude: -77.0763, icon: 'cube' },
  { id: 'favor-3', type: 'favor', label: 'Préstamo: Taladro Percutor', detail: 'Juan Pablo · Cancha Vecinal · Con juego de brocas', latitude: -11.8682, longitude: -77.0744, icon: 'build' },
  { id: 'comun-1', type: 'comunidad', label: 'Local Comunal Las Palmeras', detail: 'Mz. B · Reuniones de Junta Vecinal y trámites', latitude: -11.8670, longitude: -77.0742, icon: 'business' },
] as const;

// Puntos georreferenciados para EMERGENCIAS / CRISIS
const CRISIS_ITEMS = [
  { id: 'resource-1', type: 'resource', label: 'Punto de agua potable', detail: 'Parque Central (Tanque 5,000L)', latitude: -11.8670, longitude: -77.0742, icon: 'water' },
  { id: 'resource-2', type: 'resource', label: 'Puesto de primeros auxilios', detail: 'Local comunal · Mz. B · Paramédico y botiquín', latitude: -11.8662, longitude: -77.0750, icon: 'medkit' },
  { id: 'resource-3', type: 'resource', label: 'Zona segura y albergue', detail: 'Cancha vecinal techada sismorresistente', latitude: -11.8682, longitude: -77.0744, icon: 'shield-checkmark' },
  { id: 'resource-4', type: 'resource', label: 'Punto de energía y recarga', detail: 'Sector Norte · Generador solar comunal', latitude: -11.8660, longitude: -77.0763, icon: 'flash' },
  { id: 'resource-5', type: 'resource', label: 'Punto de agua secundario', detail: 'Calle Los Sauces 310 · Grifo comunal', latitude: -11.8674, longitude: -77.0770, icon: 'water' },
  { id: 'cluster-1', type: 'cluster', label: 'Clúster IA (DBSCAN)', detail: 'Sector 2 · 5 reportes de Falta de Agua agrupados por IA', latitude: -11.8675, longitude: -77.0754, icon: 'warning', count: 5 },
  { id: 'cluster-2', type: 'cluster', label: 'Clúster de alertas IA', detail: 'Bloque Los Sauces · 3 alertas de riesgo estructural', latitude: -11.8666, longitude: -77.0741, icon: 'warning', count: 3 },
  { id: 'vulnerable-1', type: 'vulnerable', label: 'Persona vulnerable (Adulto Mayor)', detail: 'Sector Norte · Mz. A', latitude: -11.8671, longitude: -77.0761, icon: 'accessibility' },
  { id: 'vulnerable-2', type: 'vulnerable', label: 'Persona vulnerable (Movilidad Reducida)', detail: 'Calle Los Pinos · Mz. C', latitude: -11.8667, longitude: -77.0748, icon: 'accessibility' },
  { id: 'vulnerable-3', type: 'vulnerable', label: 'Persona vulnerable (Oxígeno Dependiente)', detail: 'Sector Sur · Mz. D', latitude: -11.8680, longitude: -77.0755, icon: 'accessibility' },
  { id: 'vulnerable-4', type: 'vulnerable', label: 'Persona vulnerable (Madre Gestante)', detail: 'Calle Los Sauces · Mz. B', latitude: -11.8675, longitude: -77.0765, icon: 'accessibility' },
] as const;

export interface MapPinItem {
  id: string;
  type: string;
  label: string;
  detail: string;
  latitude: number;
  longitude: number;
  icon: string;
  count?: number;
}

type AnyMapItem = MapPinItem;

const MAP_REGION = {
  latitude: -11.8675,
  longitude: -77.0754,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

const COMMUNITY_LABELS: Record<string, string> = {
  servicio: 'Oficios y Servicios',
  favor: 'Cadena de Favores',
  comunidad: 'Puntos de Encuentro',
};

const CRISIS_LABELS: Record<string, string> = {
  resource: 'Recursos Vitales',
  cluster: 'Clústeres IA',
  vulnerable: 'Vulnerables',
};

const TYPE_COLORS: Record<string, string> = {
  servicio: '#2563eb', // Azul
  favor: '#059669',    // Verde
  comunidad: '#d97706',// Ámbar
  resource: '#0284c7', // Celeste agua
  cluster: '#dc2626',  // Rojo emergencia
  vulnerable: '#7c3aed',// Púrpura protegido
};

export const CrisisMap = () => {
  const mapRef = useRef<MapView | null>(null);
  const { isCrisisRealActive, toggleCrisisRealMode, customServices, customFavores } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<AnyMapItem | null>(null);

  const canViewVulnerableLocations = CURRENT_USER.role === 'Junta Vecinal';

  // Convertir servicios y favores publicados dinámicamente en pines interactivos
  const dynamicServiceItems: AnyMapItem[] = (customServices || []).map((s, idx) => ({
    id: `dyn-serv-${s.id}`,
    type: 'servicio' as const,
    label: `${s.role} (${s.name})`,
    detail: `${s.location} · ${s.specialtyDetails}`,
    latitude: -11.8672 - (idx * 0.0006),
    longitude: -77.0758 + (idx * 0.0005),
    icon: s.category === 'salud_bienestar' ? 'medkit' : s.category === 'alimentacion' ? 'restaurant' : 'construct',
  }));

  const dynamicFavorItems: AnyMapItem[] = (customFavores || []).map((f, idx) => ({
    id: `dyn-fav-${f.id}`,
    type: 'favor' as const,
    label: `${f.title} (${f.ownerName})`,
    detail: `${f.location} · ${f.description}`,
    latitude: -11.8665 + (idx * 0.0005),
    longitude: -77.0746 - (idx * 0.0004),
    icon: f.categoria === 'donacion' ? 'cube' : f.categoria === 'acompanamiento' ? 'people' : 'gift',
  }));

  // Selección dinámica de datos según estado de crisis (evolución de la app)
  const currentItems = isCrisisRealActive
    ? CRISIS_ITEMS
    : [...dynamicServiceItems, ...dynamicFavorItems, ...COMMUNITY_ITEMS];
  const currentLabels = isCrisisRealActive ? CRISIS_LABELS : COMMUNITY_LABELS;

  const availableFilters: { type: string; label: string; count?: number }[] = [
    { type: 'all', label: 'Todos' },
    ...Object.keys(currentLabels).map((t) => ({
      type: t,
      label: currentLabels[t],
      count: (currentItems as readonly AnyMapItem[]).filter((i) => i.type === t).length,
    })),
  ];

  const filters = availableFilters.filter(
    (f) => canViewVulnerableLocations || f.type !== 'vulnerable'
  );

  const visibleItems = (currentItems as readonly AnyMapItem[]).filter(
    (item) =>
      (canViewVulnerableLocations || item.type !== 'vulnerable') &&
      (activeFilter === 'all' || item.type === activeFilter)
  );

  const visibleClusters = visibleItems.filter((i) => i.type === 'cluster') as MapPinItem[];

  const focusMap = (item: AnyMapItem) => {
    setSelectedItem(item);
    mapRef.current?.animateToRegion(
      {
        latitude: item.latitude,
        longitude: item.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },
      350
    );
  };

  return (
    <View style={[styles.container, isCrisisRealActive && styles.containerCrisis]}>
      {/* Encabezado Camaleónico */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, isCrisisRealActive && styles.headerIconCrisis]}>
          <Ionicons
            name={isCrisisRealActive ? 'warning' : 'map'}
            size={18}
            color={isCrisisRealActive ? '#dc2626' : '#1d4ed8'}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, isCrisisRealActive && styles.titleCrisis]}>
            {isCrisisRealActive
              ? 'Mapa Táctico de Emergencia y Rescate'
              : 'Mapa Comunitario · Economía y Solidaridad'}
          </Text>
          <Text style={styles.subtitle}>
            {isCrisisRealActive
              ? 'Zonas seguras, agua potable y clústeres IA de rescate'
              : 'Oficios locales avalados por vecinos y favores activos'}
          </Text>
        </View>

        {/* Switch Demostrativo para el Jurado */}
        <TouchableOpacity
          style={[styles.evolveBtn, isCrisisRealActive && styles.evolveBtnCrisis]}
          onPress={toggleCrisisRealMode}
          activeOpacity={0.8}
        >
          <Text style={[styles.evolveBtnText, isCrisisRealActive && styles.evolveBtnTextCrisis]}>
            {isCrisisRealActive ? '☀️ Ver Normal' : '🚨 Simular SOS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chips de Filtros dinámicos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.type;
          return (
            <TouchableOpacity
              key={filter.type}
              style={[
                styles.filterChip,
                isActive && (isCrisisRealActive ? styles.filterChipActiveCrisis : styles.filterChipActiveNormal),
              ]}
              onPress={() => {
                setActiveFilter(filter.type);
                if (selectedItem && filter.type !== 'all' && selectedItem.type !== filter.type) {
                  setSelectedItem(null);
                }
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {filter.label}{filter.count ? ` (${filter.count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Mapa Nativo (react-native-maps) */}
      <View style={styles.mapFrame}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={MAP_REGION}
          onPress={() => setSelectedItem(null)}
        >
          {/* Círculos de radio para clústeres DBSCAN en modo crisis */}
          {isCrisisRealActive &&
            visibleClusters.map((cluster) => (
              <Circle
                key={`${cluster.id}-radius`}
                center={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                radius={150}
                strokeColor="rgba(220, 38, 38, 0.8)"
                fillColor="rgba(220, 38, 38, 0.15)"
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
              <View style={[styles.marker, { backgroundColor: TYPE_COLORS[item.type] || '#2563eb' }]}>
                <Ionicons name={item.icon as any} size={15} color="#ffffff" />
                {'count' in item && <Text style={styles.markerCount}>{item.count}</Text>}
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Badge de Estado */}
        <View pointerEvents="none" style={styles.statusBadge}>
          <View style={[styles.statusDot, isCrisisRealActive ? styles.dotCrisis : styles.dotNormal]} />
          <Text style={styles.statusText}>
            {isCrisisRealActive ? 'MODO CRISIS' : 'ECONOMÍA BARRIAL'}
          </Text>
        </View>

        {/* Botón de Recentrado */}
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            mapRef.current?.animateToRegion(MAP_REGION, 350);
            setSelectedItem(null);
          }}
        >
          <Ionicons name="locate" size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Leyenda interactiva */}
      <View style={styles.legend}>
        {Object.keys(currentLabels).map((type) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[type] }]} />
            <Text style={styles.legendText}>{currentLabels[type]}</Text>
          </View>
        ))}
      </View>

      {/* Tarjeta de Detalle del Marcador Seleccionado */}
      {selectedItem && (
        <View style={styles.selectedItem}>
          <View style={[styles.selectedIcon, { backgroundColor: TYPE_COLORS[selectedItem.type] || '#2563eb' }]}>
            <Ionicons name={selectedItem.icon as any} size={18} color="#ffffff" />
          </View>
          <View style={styles.selectedText}>
            <Text style={styles.selectedTitle}>{selectedItem.label}</Text>
            <Text style={styles.selectedDetail}>{selectedItem.detail}</Text>
            <Text style={styles.selectedCoord}>
              📍 Coordenadas: {selectedItem.latitude.toFixed(4)}, {selectedItem.longitude.toFixed(4)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedItem(null)}>
            <Ionicons name="close-circle" size={20} color="#64748b" />
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
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  containerCrisis: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  headerIconCrisis: {
    backgroundColor: '#fee2e2',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '900',
  },
  titleCrisis: {
    color: '#991b1b',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  evolveBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  evolveBtnCrisis: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  evolveBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b91c1c',
  },
  evolveBtnTextCrisis: {
    color: '#1d4ed8',
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
  filterChipActiveNormal: {
    borderColor: '#1d4ed8',
    backgroundColor: '#1d4ed8',
  },
  filterChipActiveCrisis: {
    borderColor: '#b91c1c',
    backgroundColor: '#b91c1c',
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
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    gap: 3,
  },
  markerCount: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotNormal: {
    backgroundColor: '#2563eb',
  },
  dotCrisis: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0f172a',
  },
  recenterButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
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
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginTop: 10,
  },
  selectedIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  selectedDetail: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  selectedCoord: {
    fontSize: 9,
    color: '#1d4ed8',
    fontWeight: '700',
    marginTop: 2,
  },
});
