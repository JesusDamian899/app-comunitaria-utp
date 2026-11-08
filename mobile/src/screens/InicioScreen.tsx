import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CURRENT_USER, MOCK_TOP_VECINOS_DEL_MES, MOCK_CONVOCATORIA, MOCK_MANTENIMIENTO, MOCK_ACTA } from '../mock/data';
import { CommunityBadge } from '../components/CommunityBadge';
import { CrisisMap } from '../components/CrisisMap';
import { AvisoModal } from '../components/AvisoModal';
import { useApp } from '../context/AppContext';
import { useAuth } from '../components/AuthGuard';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useGeolocation } from '../hooks/useGeolocation';

export const InicioScreen = () => {
  const {
    hasConfirmedAttendance,
    toggleAttendance,
    attendeesCount,
    showToast,
    isCrisisRealActive,
    toggleCrisisRealMode,
    userSafetyStatus,
    setUserSafetyStatus,
    openAvisoModal,
    customAvisos,
    isNetworkOnline,
  } = useApp();
  const { currentUser } = useAuth();
  const { saveToOfflineQueue } = useOfflineSync();
  const { requestLocation } = useGeolocation();

  const firstName = (currentUser?.name || CURRENT_USER.name).split(' ')[0];

  const first = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 1);
  const second = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 2);
  const third = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 3);

  const handleSafetyAction = async (status: 'safe' | 'needs_rescue') => {
    setUserSafetyStatus(status);
    const coords = await requestLocation();
    await saveToOfflineQueue({
      id: `safety-${Date.now()}`,
      type: status === 'safe' ? 'SAFE' : 'RESCUE',
      author: currentUser.name,
      address: `${currentUser.calle} ${currentUser.numero}`,
      latitude: coords?.latitude ?? -11.8675,
      longitude: coords?.longitude ?? -77.0754,
      timestamp: Date.now(),
    });

    showToast(
      status === 'safe'
        ? '✓ Marcado como: A Salvo. Se notificó a la Junta Vecinal.'
        : '🚨 Alerta de Rescate enviada a brigadas y vecinos cercanos.'
    );
  };

  return (
    <ScrollView 
      style={[styles.container, isCrisisRealActive && styles.containerCrisis]} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      {/* SI MODO CRISIS ESTÁ ACTIVO: RENDERIZAR TABLERO DE CRISIS COMUNITARIA Y MAPA */}
      {isCrisisRealActive ? (
        <View style={styles.crisisContainer}>
          {/* Banner de Crisis Multizona */}
          <View style={styles.crisisHeaderCard}>
            <View style={styles.crisisHeaderTop}>
              <View style={styles.crisisPulseDot} />
              <Text style={styles.crisisHeaderTitle}>TABLERO DE CRISIS COMUNITARIA</Text>
            </View>
            <Text style={styles.crisisHeaderSubtitle}>
              Urbanización Las Palmeras • Múltiples manzanas en emergencia
            </Text>
            <TouchableOpacity
              style={styles.crisisRestoreBtn}
              onPress={toggleCrisisRealMode}
              activeOpacity={0.8}
            >
              <Text style={styles.crisisRestoreBtnText}>Restaurar Modo Cotidiano</Text>
            </TouchableOpacity>
          </View>

          {/* Estado de Seguridad del Vecino (1 Clic) */}
          <View style={styles.safetyCard}>
            <Text style={styles.safetyTitle}>¿Cuál es tu estado actual?</Text>
            <View style={styles.safetyBtnRow}>
              <TouchableOpacity
                style={[
                  styles.safetyBtn,
                  styles.safetyBtnSafe,
                  userSafetyStatus === 'safe' && styles.safetyBtnSafeActive,
                ]}
                onPress={() => handleSafetyAction('safe')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
                <Text style={styles.safetyBtnText}>ESTOY A SALVO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.safetyBtn,
                  styles.safetyBtnRescue,
                  userSafetyStatus === 'needs_rescue' && styles.safetyBtnRescueActive,
                ]}
                onPress={() => handleSafetyAction('needs_rescue')}
                activeOpacity={0.8}
              >
                <Ionicons name="warning" size={18} color="#ffffff" />
                <Text style={styles.safetyBtnText}>REQUIERO RESCATE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mapa de Crisis y Recursos (Fase 4 react-native-maps) */}
          <View style={styles.mapCard}>
            <View style={styles.mapCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="map" size={17} color="#dc2626" />
                <Text style={styles.mapCardTitle}>Mapa de Puntos de Auxilio y Clústeres</Text>
              </View>
              <View style={styles.liveTag}>
                <Text style={styles.liveTagText}>EN VIVO</Text>
              </View>
            </View>
            <CrisisMap />
          </View>
        </View>
      ) : (
        /* MODO COTIDIANO (Inicio Vecinal Estándar) */
        <>
          {/* Saludo y Acción Rápida */}
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeLeft}>
              <Text style={styles.welcomeSubtitle}>{currentUser.urbanizacion}</Text>
              <Text style={styles.welcomeTitle}>¡Hola, {firstName}! 👋</Text>
            </View>
            <TouchableOpacity 
              style={styles.avisoButton} 
              onPress={openAvisoModal}
              activeOpacity={0.8}
            >
              <Ionicons name="megaphone-outline" size={16} color="#ffffff" />
              <Text style={styles.avisoButtonText}>+ Aviso</Text>
            </TouchableOpacity>
          </View>

          {/* Avisos Publicados Recientemente por Vecinos */}
          {customAvisos.map((aviso) => (
            <View key={aviso.id} style={styles.customAvisoCard}>
              <View style={styles.customAvisoHeader}>
                <View style={styles.customAvisoTag}>
                  <Ionicons name="megaphone" size={12} color="#1d4ed8" />
                  <Text style={styles.customAvisoTagText}>{aviso.category}</Text>
                </View>
                <Text style={styles.customAvisoTime}>{aviso.timeAgo}</Text>
              </View>
              <Text style={styles.customAvisoTitle}>{aviso.title}</Text>
              <Text style={styles.customAvisoDesc}>{aviso.description}</Text>
              <Text style={styles.customAvisoAuthor}>
                Por {aviso.authorName} ({aviso.authorRole})
              </Text>
            </View>
          ))}

          {/* Tablero: Vecino del Mes (Gamificación - Podio Top 3) */}
          <View style={styles.boardCard}>
            <View style={styles.boardHeader}>
              <View style={styles.boardHeaderLeft}>
                <View style={styles.trophyIconBg}>
                  <FontAwesome5 name="trophy" size={15} color="#854d0e" />
                </View>
                <View>
                  <Text style={styles.boardTitle}>Tablero: Vecino del Mes</Text>
                  <Text style={styles.boardSubtitle}>Top 3 con más favores en el barrio</Text>
                </View>
              </View>
              <View style={styles.mesBadge}>
                <Text style={styles.mesBadgeText}>OCTUBRE</Text>
              </View>
            </View>

            {/* 1º Lugar - Campeón Destacado */}
            {first && (
              <View style={styles.podiumFirstCard}>
                <View style={styles.podiumFirstTopRow}>
                  <View style={styles.championBadge}>
                    <Text style={styles.championBadgeText}>👑 #1 CAMPEÓN DEL MES</Text>
                  </View>
                  <CommunityBadge level={first.level} size="xs" />
                </View>

                <View style={styles.podiumNeighborRow}>
                  <Image source={{ uri: first.avatarUrl }} style={styles.podiumAvatarFirst} />
                  <View style={styles.podiumInfo}>
                    <Text style={styles.podiumName} numberOfLines={1}>{first.name}</Text>
                    <Text style={styles.podiumLocation} numberOfLines={1}>📍 {first.calle} {first.numero}</Text>
                    <Text style={styles.podiumCountText}>✨ {first.favoresCount} favores realizados</Text>
                  </View>
                </View>

                <View style={styles.quoteBox}>
                  <Text style={styles.podiumDescFirst}>"{first.destacadoPor}"</Text>
                </View>
              </View>
            )}

            {/* 2º y 3º Lugar en cuadrícula móvil */}
            <View style={styles.podiumRow}>
              {second && (
                <View style={styles.podiumSecondaryCard}>
                  <View style={styles.podiumSecondaryTop}>
                    <Text style={styles.rankSecondaryText}>🥈 2º Lugar</Text>
                    <CommunityBadge level={second.level} size="xs" />
                  </View>
                  <Image source={{ uri: second.avatarUrl }} style={styles.podiumAvatarSmall} />
                  <Text style={styles.podiumNameSmall} numberOfLines={1}>{second.name}</Text>
                  <Text style={styles.podiumCountSmall}>{second.favoresCount} favores</Text>
                </View>
              )}

              {third && (
                <View style={styles.podiumSecondaryCard}>
                  <View style={styles.podiumSecondaryTop}>
                    <Text style={styles.rankSecondaryText}>🥉 3º Lugar</Text>
                    <CommunityBadge level={third.level} size="xs" />
                  </View>
                  <Image source={{ uri: third.avatarUrl }} style={styles.podiumAvatarSmall} />
                  <Text style={styles.podiumNameSmall} numberOfLines={1}>{third.name}</Text>
                  <Text style={styles.podiumCountSmall}>{third.favoresCount} favores</Text>
                </View>
              )}
            </View>
          </View>

          {/* Convocatoria Oficial de Asamblea */}
          <View style={styles.card}>
            <View style={styles.convocatoriaHeader}>
              <View style={styles.officialTag}>
                <Ionicons name="megaphone" size={12} color="#1e3a8a" />
                <Text style={styles.convocatoriaTag}>CONVOCATORIA OFICIAL</Text>
              </View>
              <Text style={styles.publishedAt}>{MOCK_CONVOCATORIA.publishedAt}</Text>
            </View>

            <Image 
              source={{ uri: MOCK_CONVOCATORIA.imageUrl }} 
              style={styles.convocatoriaImage} 
              resizeMode="cover"
            />

            <View style={styles.convocatoriaBody}>
              <View style={styles.dateRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateMonth}>{MOCK_CONVOCATORIA.month}</Text>
                  <Text style={styles.dateDay}>{MOCK_CONVOCATORIA.day}</Text>
                </View>
                <View style={styles.convocatoriaText}>
                  <Text style={styles.convocatoriaTitle}>{MOCK_CONVOCATORIA.title}</Text>
                  <Text style={styles.convocatoriaTimeLoc}>
                    🕒 {MOCK_CONVOCATORIA.time} • 📍 {MOCK_CONVOCATORIA.location}
                  </Text>
                </View>
              </View>

              <View style={styles.keyPointsContainer}>
                <Text style={styles.keyPointsHeader}>Puntos de Agenda:</Text>
                {MOCK_CONVOCATORIA.keyPoints.map((point, idx) => (
                  <View key={idx} style={styles.keyPointRow}>
                    <Text style={styles.keyPointBullet}>•</Text>
                    <Text style={styles.keyPointText}>{point}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.attendButton, hasConfirmedAttendance && styles.attendButtonActive]}
                onPress={toggleAttendance}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={hasConfirmedAttendance ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={18}
                  color={hasConfirmedAttendance ? '#15803d' : '#1d4ed8'}
                />
                <Text style={[styles.attendButtonText, hasConfirmedAttendance && styles.attendButtonTextActive]}>
                  {hasConfirmedAttendance
                    ? `✓ Asistencia Confirmada (${attendeesCount} vecinos)`
                    : `Confirmar mi Asistencia (${attendeesCount} vecinos van)`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mantenimiento Urbano */}
          <View style={styles.card}>
            <View style={styles.cardHeaderSmall}>
              <View style={styles.mantIconBox}>
                <MaterialIcons name="build" size={15} color="#b45309" />
              </View>
              <Text style={styles.cardHeaderTitle}>Mantenimiento de Redes</Text>
            </View>
            <Text style={styles.mantTitle}>{MOCK_MANTENIMIENTO.title}</Text>
            <Text style={styles.mantDesc}>{MOCK_MANTENIMIENTO.description}</Text>
            <View style={styles.alertNoteBox}>
              <Text style={styles.alertNoteText}>⚠️ {MOCK_MANTENIMIENTO.alertNote}</Text>
            </View>
          </View>

          {/* Actas Vecinales */}
          <View style={styles.card}>
            <View style={styles.cardHeaderSmall}>
              <View style={styles.actaIconBox}>
                <Ionicons name="document-text" size={15} color="#1d4ed8" />
              </View>
              <Text style={styles.cardHeaderTitle}>Actas de Sesión</Text>
            </View>
            <Text style={styles.actaTitle}>{MOCK_ACTA.title}</Text>
            <Text style={styles.actaDesc}>{MOCK_ACTA.previewText}</Text>
          </View>
        </>
      )}

      {/* Modal Aviso Vecinal */}
      <AvisoModal />

      {/* Margen final */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerCrisis: {
    backgroundColor: '#fef2f2',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  avisoButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  avisoButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  customAvisoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    padding: 14,
    marginBottom: 14,
  },
  customAvisoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customAvisoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customAvisoTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  customAvisoTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  customAvisoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  customAvisoDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 6,
  },
  customAvisoAuthor: {
    fontSize: 10.5,
    color: '#64748b',
    fontStyle: 'italic',
  },
  crisisContainer: {
    gap: 12,
  },
  crisisHeaderCard: {
    backgroundColor: '#dc2626',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  crisisHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  crisisPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  crisisHeaderTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  crisisHeaderSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  crisisRestoreBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  crisisRestoreBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
  },
  safetyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 14,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    textAlign: 'center',
  },
  safetyBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  safetyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  safetyBtnSafe: {
    backgroundColor: '#16a34a',
  },
  safetyBtnSafeActive: {
    borderWidth: 3,
    borderColor: '#bbf7d0',
  },
  safetyBtnRescue: {
    backgroundColor: '#dc2626',
  },
  safetyBtnRescueActive: {
    borderWidth: 3,
    borderColor: '#fecaca',
  },
  safetyBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  mapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mapCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  liveTag: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#dc2626',
  },
  boardCard: {
    backgroundColor: '#fffdf5',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fef08a',
    padding: 16,
    marginBottom: 14,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  boardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trophyIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fef9c3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fde047',
  },
  boardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#713f12',
  },
  boardSubtitle: {
    fontSize: 11,
    color: '#a16207',
    fontWeight: '500',
  },
  mesBadge: {
    backgroundColor: '#fef08a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mesBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#854d0e',
    letterSpacing: 0.5,
  },
  podiumFirstCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  podiumFirstTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  championBadge: {
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  championBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#854d0e',
  },
  podiumNeighborRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  podiumAvatarFirst: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#eab308',
  },
  podiumInfo: {
    flex: 1,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  podiumLocation: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  podiumCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    marginTop: 2,
  },
  quoteBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#eab308',
  },
  podiumDescFirst: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#78350f',
  },
  podiumRow: {
    flexDirection: 'row',
    gap: 10,
  },
  podiumSecondaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  podiumSecondaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  rankSecondaryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  podiumAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 6,
  },
  podiumNameSmall: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  podiumCountSmall: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
  },
  convocatoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  officialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  convocatoriaTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1e3a8a',
    letterSpacing: 0.5,
  },
  publishedAt: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  convocatoriaImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  convocatoriaBody: {
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dateBox: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  dateMonth: {
    color: '#bfdbfe',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dateDay: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  convocatoriaText: {
    flex: 1,
  },
  convocatoriaTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 18,
  },
  convocatoriaTimeLoc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  keyPointsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  keyPointsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  keyPointRow: {
    flexDirection: 'row',
    gap: 6,
  },
  keyPointBullet: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '900',
  },
  keyPointText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 15,
  },
  attendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    paddingVertical: 10,
    borderRadius: 12,
  },
  attendButtonActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  attendButtonText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '800',
  },
  attendButtonTextActive: {
    color: '#15803d',
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  mantIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actaIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  mantTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  mantDesc: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 8,
  },
  alertNoteBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  alertNoteText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  actaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  actaDesc: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
  },
});
