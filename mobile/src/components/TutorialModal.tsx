import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

const renderStepIcon = (index: number) => {
  if (index === 0) {
    return (
      <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
        <Ionicons name="construct" size={38} color="#1d4ed8" />
      </View>
    );
  }
  if (index === 1) {
    return (
      <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5' }]}>
        <MaterialCommunityIcons name="hand-heart" size={42} color="#059669" />
      </View>
    );
  }
  return (
    <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
      <MaterialCommunityIcons name="shield-alert" size={42} color="#dc2626" />
    </View>
  );
};

const STEPS = [
  {
    title: '1. Servicios Locales & PIN de Confianza',
    badge: 'ECONOMÍA LOCAL',
    badgeColor: '#1d4ed8',
    description:
      'Encuentra gasfiteros, electricistas y enfermeras a pasos de tu casa. Para evitar recomendaciones falsas, cada vecino tiene un PIN de 4 dígitos único que entrega al finalizar el trabajo para validar el servicio con un "Visto Bueno".',
    tip: '💡 A los 5 vistos buenos ganas Check Azul ✓ y a los 15 el estatus de Confianza Ganada.',
  },
  {
    title: '2. Muro Solidario Sin Dinero',
    badge: 'ECONOMÍA SOLIDARIA',
    badgeColor: '#059669',
    description:
      '¿Necesitas una escalera, un taladro o apoyo con tus compras? Pide préstamos o dona sin dinero. Al colaborar, acumulas favores en tu perfil y asciendes de rango comunitario:',
    gamification: [
      { tag: '🥉 Bronce', desc: '1 a 4 favores (Vecino Nuevo)' },
      { tag: '🥈 Plata', desc: '5 a 9 favores (Vecino Solidario)' },
      { tag: '🥇 Oro', desc: '10 a 19 favores (Vecino Ejemplar)' },
      { tag: '🏆 Héroe', desc: '20+ favores (Héroe del Barrio)' },
    ],
    tip: '⚡ Publica pedidos o préstamos en solo 2 clics con las plantillas rápidas.',
  },
  {
    title: '3. Central SOS y Modo Crisis Offline',
    badge: 'RESILIENCIA Y PROTECCIÓN',
    badgeColor: '#dc2626',
    description:
      'El botón SOS despacha tu auxilio con coordenadas GPS en tiempo real. Si ocurre un terremoto o colapso general, activa el Modo Crisis Comunitaria: la app evoluciona a un Tablero de Ayuda Humanitaria con mapa de recursos críticos.',
    tip: '📡 Funciona 100% online y offline: las alertas se guardan en SQLite local y se sincronizan solas al recuperar señal.',
  },
];

export const TutorialModal = ({ visible, onClose }: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: step.badgeColor }]}>
              <Text style={styles.badgeText}>{step.badge}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Icono Principal */}
            <View style={styles.iconContainer}>{renderStepIcon(currentStep)}</View>

            {/* Título */}
            <Text style={styles.title}>{step.title}</Text>

            {/* Descripción */}
            <Text style={styles.description}>{step.description}</Text>

            {/* Gamificación si aplica */}
            {step.gamification && (
              <View style={styles.levelsCard}>
                {step.gamification.map((lvl, idx) => (
                  <View key={idx} style={styles.levelRow}>
                    <Text style={styles.levelTag}>{lvl.tag}</Text>
                    <Text style={styles.levelDesc}>{lvl.desc}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tip destacado */}
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>{step.tip}</Text>
            </View>
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.footer}>
            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentStep ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.btnRow}>
              {currentStep > 0 && (
                <TouchableOpacity style={styles.prevBtn} onPress={handlePrev} activeOpacity={0.8}>
                  <Text style={styles.prevBtnText}>Anterior</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.nextBtn, { flex: currentStep > 0 ? 1 : undefined, width: currentStep === 0 ? '100%' : undefined }]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>
                  {currentStep === STEPS.length - 1 ? '¡Comenzar ahora!' : 'Siguiente paso →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    marginBottom: 14,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  levelsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  levelDesc: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 10,
    width: '100%',
  },
  tipText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
  footer: {
    marginTop: 14,
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#1d4ed8',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#cbd5e1',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  prevBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  nextBtn: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
