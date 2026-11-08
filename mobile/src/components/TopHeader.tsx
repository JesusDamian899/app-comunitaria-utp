import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from './AuthGuard';
import { TutorialModal } from './TutorialModal';

export const TopHeader = () => {
  const radiusRef = useRef<any>(null);
  const {
    isCrisisRealActive,
    openSos,
    isTutorialOpen,
    openTutorial,
    closeTutorial,
    proximityRadius,
    setProximityRadius,
    isNetworkOnline,
    toggleNetworkOnline,
    registerTutorialTarget,
  } = useApp();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();

  const handleRadiusLayout = () => {
    radiusRef.current?.measureInWindow?.((x: number, y: number, width: number, height: number) => {
      if (width > 0 && height > 0) {
        registerTutorialTarget('step-radios', {
          x: x - 4,
          y: y - 3,
          width: width + 8,
          height: height + 6,
          borderRadius: 10,
          shape: 'rect',
        });
      }
    });
  };

  const topPadding = Math.max(insets.top, 10);
  const showVerifiedCheck = (currentUser.vistosBuenos ?? 0) >= 5 || currentUser.verified;

  return (
    <>
      <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
        {/* Fila Principal: Perfil y SOS */}
        <View style={styles.topRow}>
          <View style={styles.leftContainer}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
              {showVerifiedCheck && (
                <View style={styles.verifiedDot}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </View>

            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.urbanizacionTitle} numberOfLines={1}>
                  {currentUser.urbanizacion}
                </Text>
                <View style={styles.sectorBadge}>
                  <Text style={styles.sectorBadgeText}>{currentUser.sector}</Text>
                </View>
              </View>
              <Text style={styles.locationSubtitle} numberOfLines={1}>
                {currentUser.calle} {currentUser.numero}
              </Text>
            </View>
          </View>

          <View style={styles.rightActions}>
            {/* Botón Tutorial */}
            <TouchableOpacity
              style={styles.tutorialBtn}
              onPress={openTutorial}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle" size={14} color="#1d4ed8" />
              <Text style={styles.tutorialBtnText}>Tutorial</Text>
            </TouchableOpacity>

            {/* Indicador pasivo solo en Modo Crisis */}
            {isCrisisRealActive && (
              <View style={styles.crisisAlertBadge}>
                <Text style={styles.crisisAlertText}>🚨 CRISIS</Text>
              </View>
            )}
          </View>
        </View>

        {/* Fila Secundaria: Radios de Proximidad y Switch Online/Offline */}
        <View style={styles.subRow}>
          {/* Selector de Radios (500m, 2km, 5km) */}
          <View
            ref={radiusRef}
            onLayout={handleRadiusLayout}
            style={styles.radiusContainer}
          >
            <Text style={styles.radiusLabel}>Radio:</Text>
            {([500, 2000, 5000] as const).map((r) => {
              const active = proximityRadius === r;
              const label = r === 500 ? '500m' : r === 2000 ? '2km' : '5km';
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.radiusChip, active && styles.radiusChipActive]}
                  onPress={() => setProximityRadius(r)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>
                    {active ? `📍 ${label}` : label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Toggle de Red Simulado para Demostración */}
          <TouchableOpacity
            style={[
              styles.networkPill,
              isNetworkOnline ? styles.networkOnline : styles.networkOffline,
            ]}
            onPress={toggleNetworkOnline}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.networkDot,
                { backgroundColor: isNetworkOnline ? '#16a34a' : '#ea580c' },
              ]}
            />
            <Text
              style={[
                styles.networkText,
                { color: isNetworkOnline ? '#166534' : '#9a3412' },
              ]}
            >
              {isNetworkOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Tutorial Montado Globalmente */}
      <TutorialModal visible={isTutorialOpen} onClose={closeTutorial} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 9,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#2563eb',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  urbanizacionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectorBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  sectorBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  locationSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tutorialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tutorialBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  sosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sosPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#dc2626',
  },
  crisisAlertBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  crisisAlertText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radiusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 2,
  },
  radiusChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  radiusChipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  radiusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  radiusChipTextActive: {
    color: '#ffffff',
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  networkOnline: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  networkOffline: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
