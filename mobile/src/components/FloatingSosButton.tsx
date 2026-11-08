import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const FloatingSosButton = () => {
  const sosRef = useRef<any>(null);
  const { openSos, isCrisisRealActive, registerTutorialTarget } = useApp();
  const insets = useSafeAreaInsets();

  // Se posiciona exactamente arriba de la barra de pestañas (tab bar: 58 + insets.bottom)
  const bottomPosition = (insets.bottom > 0 ? insets.bottom : 8) + 66;

  const handleSosLayout = () => {
    sosRef.current?.measureInWindow?.((x: number, y: number, width: number, height: number) => {
      if (width > 0 && height > 0) {
        registerTutorialTarget('step-sos', {
          x,
          y,
          width,
          height,
          borderRadius: width / 2,
          shape: 'circle',
        });
      }
    });
  };

  return (
    <TouchableOpacity
      ref={sosRef as any}
      onLayout={handleSosLayout}
      style={[
        styles.floatingButton,
        { bottom: bottomPosition },
        isCrisisRealActive && styles.floatingButtonCrisis,
      ]}
      onPress={openSos}
      activeOpacity={0.85}
      accessibilityLabel="Botón de emergencia SOS"
    >
      <MaterialIcons name="emergency" size={24} color="#ffffff" />
      <Text style={styles.text}>SOS</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 18,
    backgroundColor: '#dc2626',
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  floatingButtonCrisis: {
    backgroundColor: '#b91c1c',
    borderColor: '#fef08a',
    borderWidth: 3,
  },
  text: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    marginTop: -2,
    letterSpacing: 0.6,
  },
});
