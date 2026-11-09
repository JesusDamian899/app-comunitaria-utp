import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle as SvgCircle, Line, G, Text as SvgText } from 'react-native-svg';
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
  const { isCrisisRealActive, toggleCrisisRealMode, customServices, customFavores } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<AnyMapItem | null>(null);
  const [mapSize, setMapSize] = useState({ width: 340, height: 230 });

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
    latitude: -11.8665 + (idx * 0.0007),
    longitude: -77.0745 - (idx * 0.0005),
    icon: 'gift',
  }));

  const allItems: AnyMapItem[] = isCrisisRealActive
    ? [
        ...CRISIS_ITEMS.filter((item) => {
          if (item.type === 'vulnerable' && !canViewVulnerableLocations) {
            return false;
          }
          return true;
        }),
      ]
    : [
        ...COMMUNITY_ITEMS,
        ...dynamicServiceItems,
        ...dynamicFavorItems,
      ];

  const visibleItems = allItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const visibleClusters = visibleItems.filter((i) => i.type === 'cluster');

  const currentLabels = isCrisisRealActive ? CRISIS_LABELS : COMMUNITY_LABELS;

  const filters: { type: string; label: string; count?: number }[] = [
    { type: 'all', label: 'Todos' },
    ...Object.keys(currentLabels).map((key) => ({
      type: key,
      label: currentLabels[key],
      count: allItems.filter((i) => i.type === key).length,
    })),
  ];

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setMapSize({ width, height });
    }
  };

  // Conversión matemática de coordenadas geográficas (WGS84) al canvas SVG táctico
  const toX = (lon: number) => {
    const minLon = -77.0778;
    const maxLon = -77.0732;
    const norm = (lon - minLon) / (maxLon - minLon);
    return Math.max(22, Math.min(mapSize.width - 22, norm * mapSize.width));
  };

  const toY = (lat: number) => {
    const maxLat = -11.8655;
    const minLat = -11.8688;
    const norm = (maxLat - lat) / (maxLat - minLat);
    return Math.max(22, Math.min(mapSize.height - 22, norm * mapSize.height));
  };

  return (
    <View style={styles.container}>
      {/* Cabecera del Mapa */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name={isCrisisRealActive ? 'warning' : 'navigate-circle'}
            size={22}
            color={isCrisisRealActive ? '#dc2626' : '#2563eb'}
          />
          <View>
            <Text style={[styles.title, isCrisisRealActive && styles.titleCrisis]}>
              {isCrisisRealActive ? 'Mapa Táctico de Emergencia' : 'Mapa Barrial de Proximidad'}
            </Text>
            <Text style={styles.subtitle}>
              {isCrisisRealActive
                ? '📍 Clústeres IA (DBSCAN) y Puntos Seguros Activos'
                : 'Urb. Las Palmeras · Oficios y Recursos en tiempo real'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.evolveBtn, isCrisisRealActive && styles.evolveBtnCrisis]}
          onPress={toggleCrisisRealMode}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isCrisisRealActive ? 'shield-checkmark' : 'alert-circle'}
            size={16}
            color={isCrisisRealActive ? '#16a34a' : '#dc2626'}
          />
          <Text style={[styles.evolveBtnText, isCrisisRealActive && styles.evolveBtnTextCrisis]}>
            {isCrisisRealActive ? '☀️ Ver Normal' : '🚨 Simular SOS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros Horizontales */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
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

      {/* Canvas Táctico Vectorial Resiliente (100% Offline, Sin Caídas) */}
      <View style={styles.mapFrame} onLayout={onLayout}>
        <Svg width={mapSize.width} height={mapSize.height} style={StyleSheet.absoluteFill}>
          {/* Fondo */}
          <Rect
            x="0"
            y="0"
            width={mapSize.width}
            height={mapSize.height}
            fill={isCrisisRealActive ? '#090d16' : '#f8fafc'}
          />

          {/* Grilla y Calles Principales */}
          <G stroke={isCrisisRealActive ? '#1e293b' : '#e2e8f0'} strokeWidth="1">
            <Line x1="0" y1={mapSize.height * 0.35} x2={mapSize.width} y2={mapSize.height * 0.35} strokeDasharray="4 4" />
            <Line x1="0" y1={mapSize.height * 0.70} x2={mapSize.width} y2={mapSize.height * 0.70} strokeDasharray="4 4" />
            <Line x1={mapSize.width * 0.33} y1="0" x2={mapSize.width * 0.33} y2={mapSize.height} strokeDasharray="4 4" />
            <Line x1={mapSize.width * 0.66} y1="0" x2={mapSize.width * 0.66} y2={mapSize.height} strokeDasharray="4 4" />
          </G>

          {/* Anillos de Radar de Cobertura */}
          <G stroke={isCrisisRealActive ? 'rgba(220, 38, 38, 0.25)' : 'rgba(37, 99, 235, 0.18)'} strokeWidth="1.2">
            <SvgCircle cx={mapSize.width / 2} cy={mapSize.height / 2} r={mapSize.height * 0.22} fill="none" />
            <SvgCircle cx={mapSize.width / 2} cy={mapSize.height / 2} r={mapSize.height * 0.42} fill="none" strokeDasharray="3 3" />
          </G>

          {/* Zonas de Peligro Clúster DBSCAN (Rojo Traslúcido) */}
          {isCrisisRealActive &&
            visibleClusters.map((cluster) => {
              const cx = toX(cluster.longitude);
              const cy = toY(cluster.latitude);
              return (
                <G key={`${cluster.id}-halo`}>
                  <SvgCircle
                    cx={cx}
                    cy={cy}
                    r={36}
                    fill="rgba(220, 38, 38, 0.25)"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <SvgCircle cx={cx} cy={cy} r={46} fill="rgba(220, 38, 38, 0.08)" />
                </G>
              );
            })}

          {/* Nombres de Ejes Viales Urbanos */}
          <SvgText
            x={10}
            y={mapSize.height * 0.32}
            fontSize="8.5"
            fontWeight="bold"
            fill={isCrisisRealActive ? '#475569' : '#94a3b8'}
          >
            Calle Los Sauces
          </SvgText>
          <SvgText
            x={10}
            y={mapSize.height * 0.67}
            fontSize="8.5"
            fontWeight="bold"
            fill={isCrisisRealActive ? '#475569' : '#94a3b8'}
          >
            Av. Las Palmeras
          </SvgText>
          <SvgText
            x={mapSize.width - 90}
            y={14}
            fontSize="8"
            fontWeight="bold"
            fill={isCrisisRealActive ? '#64748b' : '#94a3b8'}
          >
            Radar PostGIS
          </SvgText>
        </Svg>

        {/* Marcadores Interactivos Táctiles */}
        {visibleItems.map((item) => {
          const posX = toX(item.longitude);
          const posY = toY(item.latitude);
          const isSelected = selectedItem?.id === item.id;
          const color = TYPE_COLORS[item.type] || '#2563eb';

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.pinMarker,
                {
                  left: posX - 15,
                  top: posY - 15,
                  backgroundColor: color,
                  borderColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                  transform: [{ scale: isSelected ? 1.25 : 1 }],
                  zIndex: isSelected ? 99 : 10,
                },
              ]}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon as any} size={14} color="#ffffff" />
              {'count' in item && item.count ? (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{item.count}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}

        {/* Centro del Radar: Tu Ubicación Actual */}
        <View
          pointerEvents="none"
          style={[
            styles.userBeacon,
            {
              left: mapSize.width / 2 - 8,
              top: mapSize.height / 2 - 8,
            },
          ]}
        >
          <View style={styles.userBeaconCore} />
        </View>

        {/* Badge Superior de Estado */}
        <View pointerEvents="none" style={styles.statusBadge}>
          <View style={[styles.statusDot, isCrisisRealActive ? styles.dotCrisis : styles.dotNormal]} />
          <Text style={styles.statusText}>
            {isCrisisRealActive ? 'ALERTA TÁCTICA ACTIVA' : 'LIMA NORTE · GPS ACTIVO'}
          </Text>
        </View>

        {/* Botón de Recentrado */}
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => setSelectedItem(null)}
          activeOpacity={0.85}
        >
          <Ionicons name="locate" size={16} color="#0f172a" />
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  titleCrisis: {
    color: '#dc2626',
  },
  subtitle: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  evolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  evolveBtnCrisis: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  evolveBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#dc2626',
  },
  evolveBtnTextCrisis: {
    color: '#16a34a',
  },
  filters: {
    gap: 6,
    paddingBottom: 10,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filterChipActiveNormal: {
    backgroundColor: '#2563eb',
  },
  filterChipActiveCrisis: {
    backgroundColor: '#dc2626',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  mapFrame: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pinMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  badgeCountText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#dc2626',
  },
  userBeacon: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  userBeaconCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotNormal: {
    backgroundColor: '#22c55e',
  },
  dotCrisis: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  recenterButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  selectedIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    flex: 1,
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
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
});
