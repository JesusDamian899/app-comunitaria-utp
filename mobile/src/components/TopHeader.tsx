import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthGuard';
import { CURRENT_USER } from '../mock/data';

// /Fase4: El encabezado conserva identidad y ubicación; el acceso SOS está en el botón flotante.
export const TopHeader = () => {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const user = currentUser || CURRENT_USER;

  const topPadding = Math.max(insets.top, 10);

  return (
    <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
      <View style={styles.leftContainer}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: user.avatarUrl || CURRENT_USER.avatarUrl }} style={styles.avatar} />
          {user.verified && (
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark" size={10} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.urbanizacionTitle} numberOfLines={1}>
              {user.urbanizacion || 'Urb. Las Palmeras'}
            </Text>
            <View style={styles.sectorBadge}>
              <Text style={styles.sectorBadgeText}>{user.sector || 'Sector 2'}</Text>
            </View>
          </View>
          <Text style={styles.locationSubtitle} numberOfLines={1}>
            {user.calle || 'Calle Los Sauces'} {user.numero || 'S/N'}
          </Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    zIndex: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e2e8f0',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#2563eb',
    width: 16,
    height: 16,
    borderRadius: 8,
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
    gap: 6,
    flexWrap: 'wrap',
  },
  urbanizacionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectorBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  sectorBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  locationSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
});
