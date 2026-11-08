import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// /Fase4: En web se informa que el mapa nativo está disponible en la app móvil.
export const CrisisMap = () => (
  <View style={styles.container}>
    <View style={styles.icon}>
      <Ionicons name="map-outline" size={20} color="#1d4ed8" />
    </View>
    <View style={styles.text}>
      <Text style={styles.title}>Mapa de vulnerabilidad y recursos</Text>
      <Text style={styles.description}>El mapa interactivo está disponible en la app móvil.</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe3ec',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  text: {
    flex: 1,
  },
  title: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '900',
  },
  description: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 3,
  },
});