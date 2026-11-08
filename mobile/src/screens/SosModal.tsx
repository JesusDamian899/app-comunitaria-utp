import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Linking 
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

// /Fase4: Motivos de emergencia que se guardan junto con la ubicación.
const INCIDENT_OPTIONS = [
  { type: 'fall', label: 'Me caí', icon: 'walk-outline' },
  { type: 'trapped', label: 'Estoy atrapada/o', icon: 'hand-left-outline' },
  { type: 'accident', label: 'Sufrí un accidente', icon: 'car-outline' },
  { type: 'other', label: 'Otra emergencia', icon: 'alert-circle-outline' },
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
  } = useApp();

  const [selectedIncident, setSelectedIncident] = useState<IncidentType | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading: isLocationLoading, requestLocation } = useGeolocation();
  const { saveToOfflineQueue, removeFromOfflineQueue } = useOfflineSync();
  const insets = useSafeAreaInsets();

  // /Fase4: Bloquea dobles envíos y permite retirar de SQLite la alerta cancelada.
  const handlePanicAction = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isSosAlertSent) {
        const wasRemoved = activeReportId
          ? await removeFromOfflineQueue(activeReportId)
          : false;
        if (!wasRemoved) {
          showToast('No se pudo retirar la alerta de la cola local.');
          return;
        }

        toggleSosAlert();
        setUserSafetyStatus('none');
        setSelectedIncident(null);
        setActiveReportId(null);
        return;
      }

      if (!selectedIncident) return;

      setUserSafetyStatus('needs_rescue');

      const coords = await requestLocation();
      const reportId = `rescue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const wasSaved = await saveToOfflineQueue({
        id: reportId,
        type: 'RESCUE',
        incident: selectedIncident,
        location: coords
          ? `(${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
          : 'Ubicación no disponible',
        coordinates: coords,
        source: 'sos-modal',
        status: 'needs_rescue',
        createdAt: new Date().toISOString(),
      });

      if (!wasSaved) {
        setUserSafetyStatus('none');
        showToast('No se pudo guardar la alerta en el dispositivo.');
        return;
      }

      setActiveReportId(reportId);
      toggleSosAlert();
    } catch (error) {
      setUserSafetyStatus('none');
      showToast('Ocurrió un error al registrar la alerta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      showToast(`Llamando a ${name} (${phone})`);
    });
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
            <Text style={styles.sectionTitle}>¿Qué pasó?</Text>
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
                    <Ionicons name={option.icon} size={20} color={isSelected ? '#b91c1c' : '#475569'} />
                    <Text style={[styles.incidentOptionText, isSelected && styles.incidentOptionTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.locationHint}>
              <Ionicons name="location-outline" size={15} color="#475569" />
              <Text style={styles.locationHintText}>Se compartirá tu ubicación actual</Text>
            </View>

            <View style={styles.panicContainer}>
              <TouchableOpacity
                style={[
                  styles.panicButton,
                  isSosAlertSent && styles.panicButtonActive,
                  (isSubmitting || (!isSosAlertSent && !selectedIncident)) && styles.panicButtonDisabled,
                ]}
                onPress={handlePanicAction}
                disabled={isSubmitting || isLocationLoading || (!isSosAlertSent && !selectedIncident)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="warning" size={42} color="#ffffff" />
                <Text style={styles.panicButtonText}>
                  {isSosAlertSent
                    ? 'CANCELAR ALERTA'
                    : isSubmitting
                      ? isLocationLoading ? 'OBTENIENDO UBICACIÓN...' : 'GUARDANDO ALERTA...'
                      : 'GUARDAR ALERTA DE RESCATE'}
                </Text>
                <Text style={styles.panicSubtext}>
                  {isSosAlertSent
                    ? 'Guardada localmente; pendiente de sincronización'
                    : selectedIncident
                      ? 'Se guardará el motivo y tu ubicación'
                      : 'Elige una opción para continuar'}
                </Text>
              </TouchableOpacity>
            </View>

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
                activeOpacity={0.8}
              >
                <Text style={[styles.switchButtonText, isCrisisRealActive && styles.switchButtonTextCrisis]}>
                  {isCrisisRealActive ? 'Desactivar' : 'Activar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Llamadas de Emergencia Directas (1 toque) */}
            <Text style={styles.sectionTitle}>Líneas Directas de Auxilio Rápido</Text>
            {MOCK_DIRECT_CALLS.map((call) => (
              <TouchableOpacity
                key={call.id}
                style={styles.callRow}
                onPress={() => handleCall(call.phone, call.name)}
                activeOpacity={0.85}
              >
                <View style={styles.callIconBg}>
                  {call.iconType === 'shield' && <MaterialCommunityIcons name="shield-account" size={22} color="#1d4ed8" />}
                  {call.iconType === 'ambulance' && <FontAwesome5 name="ambulance" size={20} color="#dc2626" />}
                  {call.iconType === 'fire' && <FontAwesome5 name="fire-extinguisher" size={20} color="#ea580c" />}
                  {call.iconType === 'police' && <MaterialIcons name="local-police" size={22} color="#1e3a8a" />}
                </View>

                <View style={styles.callInfo}>
                  <Text style={styles.callName}>{call.name}</Text>
                  <Text style={styles.callSubtitle}>{call.subtitle}</Text>
                </View>

                <View style={styles.callNumberBox}>
                  <Ionicons name="call" size={13} color="#ffffff" />
                  <Text style={styles.callNumberText}>{call.badgeCode || call.phone}</Text>
                </View>
              </TouchableOpacity>
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
    maxHeight: '92%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
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
    backgroundColor: '#dc2626',
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 10,
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
    paddingVertical: 9,
    paddingHorizontal: 12,
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
    borderWidth: 3,
    borderColor: '#fca5a5',
  },
  panicButtonActive: {
    backgroundColor: '#991b1b',
    borderColor: '#f87171',
  },
  panicButtonDisabled: {
    opacity: 0.62,
  },
  incidentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  incidentOption: {
    width: '48%',
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 9,
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
    marginBottom: 10,
  },
  locationHintText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  panicButtonText: {
    color: '#ffffff',
    fontSize: 18,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
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
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
