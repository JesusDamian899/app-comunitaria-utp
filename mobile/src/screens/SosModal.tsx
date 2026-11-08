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
  { type: 'caida', label: 'Me caí / Lesión', icon: 'walk-outline' as const },
  { type: 'atrapado', label: 'Estoy atrapada/o', icon: 'hand-left-outline' as const },
  { type: 'fuga_agua', label: 'Fuga o rotura', icon: 'water-outline' as const },
  { type: 'seguridad', label: 'Sospechoso / Robo', icon: 'shield-outline' as const },
  { type: 'otra', label: 'Otra urgencia', icon: 'alert-circle-outline' as const },
];

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

  const [selectedIncident, setSelectedIncident] = useState<string>('caida');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { isLoading: isLocationLoading, requestLocation } = useGeolocation();
  const { saveToOfflineQueue } = useOfflineSync();

  const handleCall = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      showToast(`Llamando a ${name} (${phone})`);
    });
  };

  const handlePanicAction = async () => {
    if (isSubmitting) return;

    if (isSosAlertSent) {
      toggleSosAlert();
      setUserSafetyStatus('none');
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

      // 2. Guardar SIEMPRE en SQLite local para resiliencia offline garantizada
      await saveToOfflineQueue({
        id: `sos-${Date.now()}`,
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

      toggleSosAlert();
      showToast(
        isNetworkOnline
          ? '🚨 ¡Alerta enviada a Central y vecinos cercanos con GPS!'
          : '📡 Guardado en cola SQLite local (Se enviará al conectar)'
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
            {/* Switch: Crisis Comunitaria vs Emergencia Individual */}
            <View style={[styles.switchBox, isCrisisRealActive && styles.switchBoxCrisis]}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchTitle, isCrisisRealActive && styles.switchTitleCrisis]}>
                  {isCrisisRealActive ? '🚨 MODO CRISIS COMUNITARIA ACTIVO' : '🛡️ Modo Emergencia Individual'}
                </Text>
                <Text style={styles.switchSubtitle}>
                  {isCrisisRealActive
                    ? 'Activado por terremoto, corte masivo u otra crisis. Toda la app evoluciona a ayuda humanitaria.'
                    : 'Uso personal para urgencia médica, sospechosos o incidente específico en tu lote.'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.switchButton, isCrisisRealActive && styles.switchButtonCrisisActive]}
                onPress={toggleCrisisRealMode}
                activeOpacity={0.8}
              >
                <Text style={[styles.switchButtonText, isCrisisRealActive && styles.switchButtonTextCrisis]}>
                  {isCrisisRealActive ? 'Desactivar Modo Crisis' : 'Activar Crisis Comunitaria'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selector de Motivo de Incidente (Fase 4) */}
            {!isSosAlertSent && (
              <View style={styles.incidentSelector}>
                <Text style={styles.incidentTitle}>Selecciona el motivo de auxilio:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.incidentScroll}>
                  {INCIDENT_OPTIONS.map((opt) => {
                    const isSelected = selectedIncident === opt.type;
                    return (
                      <TouchableOpacity
                        key={opt.type}
                        style={[styles.incidentChip, isSelected && styles.incidentChipActive]}
                        onPress={() => setSelectedIncident(opt.type)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={opt.icon}
                          size={15}
                          color={isSelected ? '#ffffff' : '#475569'}
                        />
                        <Text style={[styles.incidentChipText, isSelected && styles.incidentChipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Gran Botón de Pánico */}
            <View style={styles.panicContainer}>
              <TouchableOpacity
                style={[styles.panicButton, isSosAlertSent && styles.panicButtonActive]}
                onPress={handlePanicAction}
                activeOpacity={0.8}
                disabled={isSubmitting || isLocationLoading}
              >
                {isSubmitting || isLocationLoading ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="warning" size={42} color="#ffffff" />
                    <Text style={styles.panicButtonText}>
                      {isSosAlertSent ? '¡ALERTA SOS ENVIADA!' : 'BOTÓN DE PÁNICO'}
                    </Text>
                    <Text style={styles.panicSubtext}>
                      {isSosAlertSent
                        ? 'Presiona para cancelar alerta vecinal'
                        : 'Toca para despachar auxilio inmediato con GPS'}
                    </Text>
                  </>
                )}
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
    maxHeight: '90%',
    paddingTop: 10,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  closeButton: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  switchBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 14,
  },
  switchBoxCrisis: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  switchTextContainer: {
    marginBottom: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 3,
  },
  switchTitleCrisis: {
    color: '#dc2626',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  switchButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 9,
    borderRadius: 10,
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
  incidentSelector: {
    marginBottom: 12,
  },
  incidentTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  incidentScroll: {
    flexDirection: 'row',
  },
  incidentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
  },
  incidentChipActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  incidentChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  incidentChipTextActive: {
    color: '#ffffff',
  },
  panicContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  panicButton: {
    width: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  panicButtonActive: {
    backgroundColor: '#15803d',
    shadowColor: '#15803d',
  },
  panicButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  panicSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginTop: 16,
    marginBottom: 10,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  callIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  callSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  callNumberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  callNumberText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});
