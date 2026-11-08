import React from 'react';
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

export const SosModal = () => {
  const { 
    isSosOpen, 
    closeSos, 
    isCrisisRealActive, 
    toggleCrisisRealMode, 
    isSosAlertSent, 
    toggleSosAlert, 
    showToast 
  } = useApp();

  const insets = useSafeAreaInsets();

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
            {/* Switch: Crisis Comunitaria vs Emergencia Individual */}
            <View style={[styles.switchBox, isCrisisRealActive && styles.switchBoxCrisis]}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchTitle, isCrisisRealActive && styles.switchTitleCrisis]}>
                  {isCrisisRealActive ? '🚨 MODO CRISIS COMUNITARIA ACTIVO' : '🛡️ Modo Emergencia Individual'}
                </Text>
                <Text style={styles.switchSubtitle}>
                  {isCrisisRealActive
                    ? 'Activado por terremoto, incendio u otra crisis que afecta a múltiples calles y manzanas.'
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

            {/* Gran Botón de Pánico */}
            <View style={styles.panicContainer}>
              <TouchableOpacity
                style={[styles.panicButton, isSosAlertSent && styles.panicButtonActive]}
                onPress={toggleSosAlert}
                activeOpacity={0.8}
              >
                <MaterialIcons name="warning" size={42} color="#ffffff" />
                <Text style={styles.panicButtonText}>
                  {isSosAlertSent ? '¡ALERTA SOS ENVIADA!' : 'BOTÓN DE PÁNICO'}
                </Text>
                <Text style={styles.panicSubtext}>
                  {isSosAlertSent ? 'Presiona para cancelar alerta' : 'Toca para despachar auxilio inmediato'}
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  panicButton: {
    backgroundColor: '#dc2626',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 20,
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
