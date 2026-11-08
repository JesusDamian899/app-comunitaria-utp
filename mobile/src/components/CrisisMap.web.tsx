import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENT_USER } from '../mock/data';
import { useApp } from '../context/AppContext';

// Puntos georreferenciados para el DÍA A DÍA (Economía Local y Cadena de Favores)
const COMMUNITY_ITEMS = [
  { id: 'serv-1', type: 'servicio', label: 'Gasfitero: Don Pedro Sánchez', detail: 'Mz. A Lt. 4 · ⭐ 4.9 · Emergencias y tuberías', latitude: -11.8671, longitude: -77.0761, icon: 'construct' },
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
  { id: 'resource-1', type: 'resource', label: 'Punto de agua potable', detail: 'Parque Central (Tanque Comunal 5,000L)', latitude: -11.8670, longitude: -77.0742, icon: 'water' },
  { id: 'resource-2', type: 'resource', label: 'Puesto primeros auxilios', detail: 'Local Comunal · Mz. B (Paramédico de turno)', latitude: -11.8662, longitude: -77.0750, icon: 'medkit' },
  { id: 'resource-3', type: 'resource', label: 'Zona segura y refugio', detail: 'Cancha deportiva vecinal techada sismorresistente', latitude: -11.8682, longitude: -77.0744, icon: 'shield-checkmark' },
  { id: 'resource-4', type: 'resource', label: 'Punto de energía y carga', detail: 'Sector Norte (Generador Solar Comunal)', latitude: -11.8660, longitude: -77.0763, icon: 'flash' },
  { id: 'resource-5', type: 'resource', label: 'Punto de agua', detail: 'Calle Los Sauces 310 (Grifo comunal)', latitude: -11.8674, longitude: -77.0770, icon: 'water' },
  { id: 'cluster-1', type: 'cluster', label: 'Clúster IA (DBSCAN)', detail: 'Sector 2 · 5 reportes activos de Falta de Agua', latitude: -11.8675, longitude: -77.0754, icon: 'warning', count: 5 },
  { id: 'cluster-2', type: 'cluster', label: 'Clúster de alertas', detail: 'Bloque Los Sauces · Gravedad alta', latitude: -11.8666, longitude: -77.0741, icon: 'warning', count: 3 },
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
  servicio: '#2563eb',
  favor: '#059669',
  comunidad: '#d97706',
  resource: '#0284c7',
  cluster: '#dc2626',
  vulnerable: '#7c3aed',
};

export const CrisisMap = () => {
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

  return (
    <View style={[styles.container, isCrisisRealActive && styles.containerCrisis]}>
      {/* Encabezado */}
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
              ? 'Mapa Táctico de Emergencia (Web Interactivo)'
              : 'Mapa Comunitario · Economía y Solidaridad (Web)'}
          </Text>
          <Text style={styles.subtitle}>
            Urb. Las Palmeras · {isCrisisRealActive ? 'Vista Táctica de Rescate' : 'Oficios locales y favores activos'}
          </Text>
        </View>

        {/* Switch Demostrativo */}
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

      {/* Filtros */}
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

      {/* Mapa OpenStreetMap Embed */}
      <View style={styles.mapFrame}>
        <iframe
          title="OpenStreetMap Urb Las Palmeras"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-77.0850%2C-11.8750%2C-77.0650%2C-11.8600&layer=mapnik&marker=-11.8675%2C-77.0754"
        />
        <View pointerEvents="none" style={styles.mapBadge}>
          <View style={[styles.liveDot, isCrisisRealActive ? styles.dotCrisis : styles.dotNormal]} />
          <Text style={styles.mapBadgeText}>
            {isCrisisRealActive ? '🚨 MODO CRISIS POSTGIS' : '📍 LIMA NORTE - POSTGIS'}
          </Text>
        </View>
      </View>

      {/* Lista Horizontal de Puntos Interactivos */}
      <Text style={styles.pointsTitle}>
        {isCrisisRealActive ? '🚨 Puntos Tácticos de Emergencia:' : '📍 Oficios y Recursos en el Barrio:'}
      </Text>
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
              <View style={[styles.pointIconBg, { backgroundColor: TYPE_COLORS[item.type] || '#2563eb' }]}>
                <Ionicons name={item.icon as any} size={14} color="#ffffff" />
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
          <View style={[styles.selectedIcon, { backgroundColor: TYPE_COLORS[selectedItem.type] || '#2563eb' }]}>
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
  },
  dotNormal: {
    backgroundColor: '#2563eb',
  },
  dotCrisis: {
    backgroundColor: '#dc2626',
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
    maxWidth: 220,
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
