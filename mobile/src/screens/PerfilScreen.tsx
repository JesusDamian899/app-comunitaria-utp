import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityBadge } from '../components/CommunityBadge';
import { useAuth, getCommunityStatusLevel } from '../components/AuthGuard';

export const PerfilScreen = () => {
  const { currentUser, logout } = useAuth();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const vistosBuenos = currentUser.vistosBuenos ?? 0;
  const favoresCount = currentUser.favoresCount ?? 1;

  // Regla de Niveles de Confianza (Nivel 1: 0-4, Nivel 2: 5-14, Nivel 3: 15+)
  const showVerifiedCheck = vistosBuenos >= 5 || currentUser.verified;
  const trustConfig =
    vistosBuenos >= 15
      ? {
          label: `Confianza Ganada (${vistosBuenos} Vistos Buenos)`,
          bg: '#f0fdf4',
          border: '#bbf7d0',
          color: '#15803d',
          icon: 'shield-checkmark' as const,
        }
      : vistosBuenos >= 5
      ? {
          label: `Vecino Confiable (${vistosBuenos} Vistos Buenos)`,
          bg: '#eff6ff',
          border: '#bfdbfe',
          color: '#1d4ed8',
          icon: 'checkmark-circle' as const,
        }
      : {
          label: `Vecino Nuevo (${vistosBuenos} Vistos Buenos)`,
          bg: '#f1f5f9',
          border: '#e2e8f0',
          color: '#475569',
          icon: 'person-outline' as const,
        };

  // Regla de Gamificación / Incentivos en Solidaridad (Bronce, Plata, Oro, Héroe del barrio)
  const badgeLevel = getCommunityStatusLevel(favoresCount);
  const nextGoal =
    badgeLevel === 'bronce'
      ? { target: 5, nextLabel: 'PLATA' }
      : badgeLevel === 'plata'
      ? { target: 10, nextLabel: 'ORO' }
      : badgeLevel === 'oro'
      ? { target: 20, nextLabel: 'HÉROE DEL BARRIO' }
      : null;

  const progressPercent = nextGoal
    ? Math.min(100, Math.round((favoresCount / nextGoal.target) * 100))
    : 100;
  const remainingFavores = nextGoal ? Math.max(0, nextGoal.target - favoresCount) : 0;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecera de Perfil */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
            {showVerifiedCheck && (
              <View style={styles.verifiedCheck}>
                <Ionicons name="checkmark" size={12} color="#ffffff" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userRole}>{currentUser.role}</Text>

            <View
              style={[
                styles.vistosBuenosChip,
                { backgroundColor: trustConfig.bg, borderColor: trustConfig.border },
              ]}
            >
              <Ionicons name={trustConfig.icon} size={13} color={trustConfig.color} />
              <Text style={[styles.vistosBuenosText, { color: trustConfig.color }]}>
                {trustConfig.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.addressBox}>
          <Text style={styles.addressText}>
            📍 {currentUser.urbanizacion} • {currentUser.calle} {currentUser.numero} ({currentUser.sector})
          </Text>
          <Text style={styles.phoneText}>📞 {currentUser.phone}</Text>
        </View>
      </View>

      {/* REQUISITO: PIN de 4 dígitos para validar servicios */}
      <View style={styles.pinCard}>
        <View style={styles.pinCardLeft}>
          <View style={styles.pinIconBg}>
            <Ionicons name="key" size={20} color="#854d0e" />
          </View>
          <View style={styles.pinTextContainer}>
            <Text style={styles.pinTitle}>Mi PIN de Servicios</Text>
            <Text style={styles.pinSubtitle}>
              Compártelo a tus vecinos para validar trabajos y recibir recomendaciones.
            </Text>
          </View>
        </View>

        <View style={styles.pinBadge}>
          <Text style={styles.pinDigits}>{currentUser.servicePin || '4826'}</Text>
        </View>
      </View>

      {/* Estatus Comunitario (Gamificación) */}
      <View style={styles.gamificationCard}>
        <View style={styles.gamificationHeader}>
          <View style={styles.gamificationHeaderLeft}>
            <MaterialCommunityIcons name="trophy-award" size={22} color="#b45309" />
            <Text style={styles.gamificationTitle}>Mi Estatus Comunitario</Text>
          </View>
          <CommunityBadge level={badgeLevel} size="sm" />
        </View>

        {nextGoal ? (
          <Text style={styles.gamificationScore}>
            Has completado <Text style={styles.boldScore}>{favoresCount} {favoresCount === 1 ? 'favor' : 'favores'}</Text> este mes. ¡Estás a {remainingFavores} {remainingFavores === 1 ? 'favor' : 'favores'} de alcanzar el nivel <Text style={styles.boldGold}>{nextGoal.nextLabel}</Text>!
          </Text>
        ) : (
          <Text style={styles.gamificationScore}>
            ¡Felicidades! Has completado <Text style={styles.boldScore}>{favoresCount} favores</Text> y alcanzaste el máximo rango de <Text style={styles.boldGold}>HÉROE DEL BARRIO</Text>.
          </Text>
        )}

        {/* Barra de Progreso */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        {/* Niveles oficiales de estatus */}
        <View style={styles.levelsList}>
          <View style={styles.levelRow}>
            <CommunityBadge level="bronce" size="xs" />
            <Text style={styles.levelDesc}>1 a 4 favores (Nivel Inicial)</Text>
          </View>
          <View style={styles.levelRow}>
            <CommunityBadge level="plata" size="xs" />
            <Text style={styles.levelDesc}>5 a 9 favores (Vecino Solidario)</Text>
          </View>
          <View style={styles.levelRow}>
            <CommunityBadge level="oro" size="xs" />
            <Text style={styles.levelDesc}>10 a 19 favores (Vecino Ejemplar)</Text>
          </View>
          <View style={styles.levelRow}>
            <CommunityBadge level="heroe_del_barrio" size="xs" />
            <Text style={styles.levelDesc}>20 o más favores (Máxima Insignia)</Text>
          </View>
        </View>
      </View>
         {/* Opciones de Cuenta Simplificadas: ¿Cómo funciona la app? y Cerrar sesión */}
   <View style={{
     backgroundColor: '#ffffff',
     borderRadius: 18,
     borderWidth: 1,
     borderColor: '#e2e8f0',
     marginTop: 14,
     overflow: 'hidden',
   }}>
     {/* 1. ¿Cómo funciona la app? */}
     <TouchableOpacity
       onPress={() => setShowGuideModal(true)}
       activeOpacity={0.75}
       style={{
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'space-between',
         padding: 15,
         backgroundColor: '#eff6ff',
         borderBottomWidth: 1,
         borderBottomColor: '#e2e8f0',
       }}
     >
       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
         <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
           <Ionicons name="help-circle" size={20} color="#1d4ed8" />
         </View>
         <View>
           <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e3a8a' }}>¿Cómo funciona la app?</Text>
           <Text style={{ fontSize: 11, color: '#2563eb', fontWeight: '500' }}>Ver guía rápida de módulos y niveles</Text>
         </View>
       </View>
       <Ionicons name="chevron-forward" size={18} color="#2563eb" />
     </TouchableOpacity>

     {/* 2. Cerrar sesión */}
     <TouchableOpacity
       onPress={logout}
       activeOpacity={0.75}
       style={{
         flexDirection: 'row',
         alignItems: 'center',
         gap: 12,
         padding: 15,
       }}
     >
       <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#ffe4e6', alignItems: 'center', justifyContent: 'center' }}>
         <Ionicons name="log-out-outline" size={19} color="#e11d48" />
       </View>
       <Text style={{ fontSize: 13, fontWeight: '800', color: '#e11d48' }}>Cerrar sesión</Text>
     </TouchableOpacity>
   </View>

   {/* Modal Guía de la App */}
   <Modal visible={showGuideModal} transparent animationType="fade">
     <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', padding: 20 }}>
       <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 20, gap: 10 }}>
         <Text style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}>Guía Rápida • Comunidad Vecinos</Text>
         <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18 }}>
           • <Text style={{ fontWeight: '800' }}>Inicio:</Text> Avisos oficiales, mantenimiento y Vecino del Mes.{'\n'}
           • <Text style={{ fontWeight: '800' }}>Servicios:</Text> Oficios y profesiones locales validados con tu PIN de 4 dígitos.{'\n'}
           • <Text style={{ fontWeight: '800' }}>Solidaridad:</Text> Préstamos, donaciones y apoyo vecinal para subir de Bronce a Héroe del Barrio.{'\n'}
           • <Text style={{ fontWeight: '800' }}>Botón SOS:</Text> Alerta individual o Modo Crisis Comunitaria por radios.
         </Text>
         <TouchableOpacity
           onPress={() => setShowGuideModal(false)}
           style={{ backgroundColor: '#1d4ed8', paddingVertical: 11, borderRadius: 12, alignItems: 'center', marginTop: 6 }}
         >
           <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>¡Entendido!</Text>
         </TouchableOpacity>
       </View>
     </View>
   </Modal>
      {/* Margen final para no chocar con tab bar */}
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
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2563eb',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  userRole: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  vistosBuenosChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  vistosBuenosText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  addressBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  addressText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  phoneText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  pinCard: {
    backgroundColor: '#fffdf5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pinCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  pinIconBg: {
    backgroundColor: '#fef3c7',
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTextContainer: {
    flex: 1,
  },
  pinTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#78350f',
  },
  pinSubtitle: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 14,
  },
  pinBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pinDigits: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  gamificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  gamificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gamificationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gamificationTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  gamificationScore: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  boldScore: {
    fontWeight: '900',
    color: '#1d4ed8',
  },
  boldGold: {
    fontWeight: '900',
    color: '#d97706',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  levelsList: {
    gap: 10,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelDesc: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
});
