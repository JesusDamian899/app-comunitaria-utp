import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { MOCK_TOP_VECINOS_DEL_MES, MOCK_CONVOCATORIA, MOCK_MANTENIMIENTO, MOCK_ACTA } from '../mock/data';
import { CommunityBadge } from '../components/CommunityBadge';
import { useApp } from '../context/AppContext';

export const InicioScreen = () => {
  const { hasConfirmedAttendance, toggleAttendance, attendeesCount, showToast } = useApp();

  const first = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 1);
  const second = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 2);
  const third = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 3);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      {/* Saludo y Acción Rápida */}
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.welcomeSubtitle}>Comunidad Residencial</Text>
          <Text style={styles.welcomeTitle}>¡Hola, Carlos! 👋</Text>
        </View>
        <TouchableOpacity 
          style={styles.avisoButton} 
          onPress={() => showToast('Módulo de nuevo aviso en preparación')}
          activeOpacity={0.8}
        >
          <Ionicons name="megaphone-outline" size={16} color="#ffffff" />
          <Text style={styles.avisoButtonText}>Aviso</Text>
        </TouchableOpacity>
      </View>

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
            activeOpacity={0.8}
          >
            <Ionicons
              name={hasConfirmedAttendance ? "checkmark-circle" : "checkbox-outline"}
              size={18}
              color={hasConfirmedAttendance ? "#ffffff" : "#1e3a8a"}
            />
            <Text style={[styles.attendButtonText, hasConfirmedAttendance && styles.attendButtonTextActive]}>
              {hasConfirmedAttendance ? '✓ Asistencia Confirmada' : 'Confirmar Asistencia'}
            </Text>
            <Text style={[styles.attendeesCountText, hasConfirmedAttendance && styles.attendeesCountActive]}>
              ({attendeesCount} vecinos)
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

      {/* Margen final para no chocar con SOS flotante ni tab bar */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  boardCard: {
    backgroundColor: '#fffdf5',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  boardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  trophyIconBg: {
    backgroundColor: '#fef3c7',
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#451a03',
  },
  boardSubtitle: {
    fontSize: 10,
    color: '#78350f',
    fontWeight: '600',
  },
  mesBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  mesBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  podiumFirstCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#fbbf24',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  podiumFirstTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  championBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  championBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400e',
  },
  podiumNeighborRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  podiumAvatarFirst: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  podiumInfo: {
    flex: 1,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  podiumLocation: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  podiumCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d97706',
    marginTop: 2,
  },
  quoteBox: {
    backgroundColor: '#fafaf9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  podiumDescFirst: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#475569',
    lineHeight: 15,
  },
  podiumRow: {
    flexDirection: 'row',
    gap: 10,
  },
  podiumSecondaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  podiumSecondaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
  },
  rankSecondaryText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
  },
  podiumAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginBottom: 5,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  podiumNameSmall: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  podiumCountSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  convocatoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  officialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  convocatoriaTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1e3a8a',
    letterSpacing: 0.4,
  },
  publishedAt: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  convocatoriaImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e2e8f0',
  },
  convocatoriaBody: {
    padding: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 44,
  },
  dateMonth: {
    color: '#93c5fd',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dateDay: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginTop: -2,
  },
  convocatoriaText: {
    flex: 1,
  },
  convocatoriaTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 3,
  },
  convocatoriaTimeLoc: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  keyPointsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  keyPointsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 3,
  },
  keyPointBullet: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  keyPointText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 15,
  },
  attendButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  attendButtonActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  attendButtonText: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '800',
  },
  attendButtonTextActive: {
    color: '#ffffff',
  },
  attendeesCountText: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
  },
  attendeesCountActive: {
    color: '#bfdbfe',
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  mantIconBox: {
    backgroundColor: '#fef3c7',
    padding: 5,
    borderRadius: 6,
  },
  actaIconBox: {
    backgroundColor: '#eff6ff',
    padding: 5,
    borderRadius: 6,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mantTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  mantDesc: {
    fontSize: 11,
    color: '#64748b',
    paddingHorizontal: 14,
    marginBottom: 10,
    lineHeight: 16,
  },
  alertNoteBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  alertNoteText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '700',
  },
  actaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  actaDesc: {
    fontSize: 11,
    color: '#64748b',
    paddingHorizontal: 14,
    paddingBottom: 14,
    lineHeight: 16,
  },
});
