import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import type { CommunityStatusLevel } from '../types';

interface CommunityBadgeProps {
  level: CommunityStatusLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const CommunityBadge = ({ level, size = 'sm' }: CommunityBadgeProps) => {
  const config = {
    bronce: {
      label: 'BRONCE',
      bg: '#fef3c7',
      border: '#fde68a',
      text: '#92400e',
      icon: <FontAwesome5 name="medal" size={size === 'xs' ? 9 : 11} color="#92400e" />,
    },
    plata: {
      label: 'PLATA',
      bg: '#e2e8f0',
      border: '#cbd5e1',
      text: '#334155',
      icon: <FontAwesome5 name="medal" size={size === 'xs' ? 9 : 11} color="#475569" />,
    },
    oro: {
      label: 'ORO',
      bg: '#fef08a',
      border: '#facc15',
      text: '#854d0e',
      icon: <FontAwesome5 name="trophy" size={size === 'xs' ? 9 : 11} color="#854d0e" />,
    },
    heroe_del_barrio: {
      label: 'HÉROE DEL BARRIO',
      bg: '#f59e0b',
      border: '#d97706',
      text: '#451a03',
      icon: <Ionicons name="sparkles" size={size === 'xs' ? 10 : 12} color="#451a03" />,
    },
  }[level] || {
    label: 'VECINO',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    text: '#475569',
    icon: null,
  };

  const isSmall = size === 'xs';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 8,
        },
      ]}
    >
      {config.icon && <View style={styles.iconContainer}>{config.icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? 9 : 10,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
