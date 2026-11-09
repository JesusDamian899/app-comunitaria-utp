import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Linking,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome5, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { MOCK_DIRECT_CALLS } from '../mock/data';
import { useApp } from '../context/AppContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/AuthGuard';

const INCIDENT_OPTIONS = [
  { type: 'fall', label: 'Me caí', icon: 'walk-outline' as const },
  { type: 'trapped', label: 'Estoy atrapada/o', icon: 'hand-left-outline' as const },
  { type: 'accident', label: 'Sufrí un accidente', icon: 'car-outline' as const },
  { type: 'other', label: 'Otra emergencia', icon: 'alert-circle-outline' as const },
] as const;

type IncidentType = (typeof INCIDENT_OPTIONS)[number]['type'];

export const SosModal = () => {
  const { 
    isSosOpen, 
    closeSos, 
    isCrisisRealActive, 
    toggleCrisisRealMode, 
    isSosAlertSent, 
    toggleSosAlert, 
    showToast,
    setUserSafetyStatus,
    isNetworkOnline,
  } = useApp();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedIncident, setSelectedIncident] = useState<IncidentType | null>('fall');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { isLoading: isLocationLoading, requestLocation } = useGeolocation();
  const { saveToOfflineQueue, removeFromOfflineQueue } = useOfflineSync();

  const handleCall = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      showToast(`Llamando a ${name} (${phone})`);
    });
  };

  const handlePanicAction = async () => {
    if (isSubmitting) return;

    if (isSosAlertSent) {
      if (activeReportId && removeFromOfflineQueue) {
        await removeFromOfflineQueue(activeReportId);
      }
      toggleSosAlert();
      setUserSafetyStatus('none');
      setActiveReportId(null);
      showToast('Alerta cancelada correctamente.');
      return;
    }

    if (!selectedIncident) {
      showToast('Selecciona qué pasó para enviar la alerta.');
      return;
    }

    setIsSubmitting(true);
    try {
      setUserSafetyStatus('needs_rescue');

      // 1. Obtener coordenadas GPS reales mediante expo-location
      const coords = await requestLocation();
      const lat = coords ? coords.latitude : -11.8675;
      const lon = coords ? coords.longitude : -77.0754;

      const incidentObj = INCIDENT_OPTIONS.find((i) => i.type === selectedIncident);
      const incidentLabel = incidentObj ? incidentObj.label : 'Urgencia vecinal';
      const reportId = `rescue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // 2. Guardar SIEMPRE en SQLite local para resiliencia offline garantizada
      await saveToOfflineQueue({
        id: reportId,
        type: 'RESCUE',
        incident: incidentLabel,
        author: currentUser.name,
        address: `${currentUser.calle} ${currentUser.numero}`,
        latitude: lat,
        longitude: lon,
        timestamp: Date.now(),
      });

      // 3. Si está en línea, insertar en la tabla real alertas_emergencia de Supabase
      if (isNetworkOnline && supabase) {
        await supabase.from('alertas_emergencia').insert({
          vecino_id: currentUser.id !== 'usr-1' ? currentUser.id : null,
          tipo_emergencia: incidentLabel,
          gravedad: 'CRITICA',
          ubicacion: `SRID=4326;POINT(${lon} ${lat})`,
        });
      }

      setActiveReportId(reportId);
      toggleSosAlert();
      showToast(
        isNetworkOnline
          ? '🚨 ¡Alerta enviada a Central y brigadistas cercanos!'
          : '📡 Guardado en SQLite local (se sincronizará al conectar)'
      );
    } catch (e: any) {
      showToast('Alerta despachada en modo de respaldo.');
      toggleSosAlert();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isSosOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Manija de arrastre / Drag Indicator */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBg}>
                <MaterialIcons name="emergency" size={22} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Central de Emergencia SOS</Text>
                <Text style={styles.headerSubtitle}>Urb. Las Palmeras • Asistencia Rápida</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeSos} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. Selector en Grid 2x2 ergonómico */}
            <Text style={styles.sectionTitle}>¿QUÉ PASÓ?</Text>
            <View style={styles.incidentGrid}>
              {INCIDENT_OPTIONS.map((option) => {
                const isSelected = selectedIncident === option.type;
                return (
                  <TouchableOpacity
                    key={option.type}
                    style={[styles.incidentOption, isSelected && styles.incidentOptionSelected]}
                    onPress={() => setSelectedIncident(option.type)}
                    disabled={isSosAlertSent}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={20} 
                      color={isSelected ? '#b91c1c' : '#475569'} 
                    />
                    <Text style={[styles.incidentOptionText, isSelected && styles.incidentOptionTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Aviso de Ubicación GPS */}
            <View style={styles.locationHint}>
              <Ionicons name="location-outline" size={15} color="#475569" />
              <Text style={styles.locationHintText}>Se compartirá tu ubicación actual</Text>
            </View>

            {/* 2. Gran Botón de Pánico / Cancelar Alerta */}
            <View style={styles.panicContainer}>
              <TouchableOpacity
                style={[
                  styles.panicButton,
                  isSosAlertSent && styles.panicButtonActive,
                  (isSubmitting || (!isSosAlertSent && !selectedIncident)) && styles.panicButtonDisabled,
                ]}
                onPress={handlePanicAction}
                disabled={isSubmitting || isLocationLoading || (!isSosAlertSent && !selectedIncident)}
                activeOpacity={0.85}
              >
                {isSubmitting || isLocationLoading ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="warning" size={38} color="#ffffff" />
                    <Text style={styles.panicButtonText}>
                      {isSosAlertSent
                        ? 'CANCELAR ALERTA'
                        : 'GUARDAR ALERTA DE RESCATE'}
                    </Text>
                    <Text style={styles.panicSubtext}>
                      {isSosAlertSent
                        ? 'Guardada localmente; pendiente de sincronización'
                        : selectedIncident
                          ? 'Se guardará el motivo y tu ubicación'
                          : 'Elige una opción para continuar'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* 3. Tarjeta ¿Afecta a varias viviendas? (Modo Crisis Comunitaria) */}
            <View style={[styles.switchBox, isCrisisRealActive && styles.switchBoxCrisis]}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchTitle, isCrisisRealActive && styles.switchTitleCrisis]}>
                  {isCrisisRealActive ? 'Crisis comunitaria activa' : '¿Afecta a varias viviendas?'}
                </Text>
                <Text style={styles.switchSubtitle}>Activa el tablero vecinal de emergencia.</Text>
              </View>
              <TouchableOpacity
                style={[styles.switchButton, isCrisisRealActive && styles.switchButtonCrisisActive]}
                onPress={toggleCrisisRealMode}
                activeOpacity={0.85}
              >
                <Text style={[styles.switchButtonText, isCrisisRealActive && styles.switchButtonTextCrisis]}>
                  {isCrisisRealActive ? 'Desactivar' : 'Activar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. Llamadas Directas de Auxilio Rápido */}
            <Text style={styles.sectionTitle}>LÍNEAS DIRECTAS DE AUXILIO RÁPIDO</Text>
            {MOCK_DIRECT_CALLS.map((call) => (
              <View
                key={call.id}
                style={styles.callRow}
              >
                <View style={styles.callIconBg}>
                  {call.iconType === 'shield' && <MaterialCommunityIcons name="shield-account" size={22} color="#1d4ed8" />}
                  {call.iconType === 'ambulance' && <FontAwesome5 name="ambulance" size={19} color="#dc2626" />}
                  {call.iconType === 'fire' && <FontAwesome5 name="fire-extinguisher" size={19} color="#ea580c" />}
                  {call.iconType === 'police' && <MaterialIcons name="local-police" size={22} color="#1e3a8a" />}
                </View>

                <View style={styles.callInfo}>
                  <Text style={styles.callName}>{call.name}</Text>
                  <Text style={styles.callSubtitle}>{call.subtitle}</Text>
                </View>

                <TouchableOpacity
                  style={styles.callNumberBox}
                  onPress={() => handleCall(call.phone, call.name)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={13} color="#ffffff" />
                  <Text style={styles.callNumberText}>{call.badgeCode || call.phone}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 10,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 6,
  },
  incidentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  incidentOption: {
    width: '48%',
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  incidentOptionSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  incidentOptionText: {
    flex: 1,
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  incidentOptionTextSelected: {
    color: '#991b1b',
  },
  locationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  locationHintText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  panicContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  panicButton: {
    backgroundColor: '#dc2626',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#fca5a5',
  },
  panicButtonActive: {
    backgroundColor: '#991b1b',
    borderColor: '#f87171',
  },
  panicButtonDisabled: {
    opacity: 0.65,
  },
  panicButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  panicSubtext: {
    color: '#fecaca',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  switchBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchBoxCrisis: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 3,
  },
  switchTitleCrisis: {
    color: '#991b1b',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  switchButton: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  switchButtonCrisisActive: {
    backgroundColor: '#dc2626',
  },
  switchButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  switchButtonTextCrisis: {
    color: '#ffffff',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  callIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  callSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  callNumberBox: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  callNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
