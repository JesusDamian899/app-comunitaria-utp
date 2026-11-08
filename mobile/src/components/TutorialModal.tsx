import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourStep {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  highlightText: string;
  description: string;
  actionHint: string;
  spotlight: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    width: number;
    height: number;
    borderRadius: number;
  };
  cardPosition: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
  };
  pointer: {
    type: 'down' | 'up' | 'right' | 'left';
    icon: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-radios',
    badge: 'PASO 1 DE 5 · HIPERLOCAL',
    badgeColor: '#1d4ed8',
    title: 'Radio de Barrio: Todo a 500m',
    highlightText: '📍 Pulsa aquí para filtrar por cercanía',
    description:
      'Encuentra gasfiteros, electricistas y favores a menos de 500 metros de tu casa. Resuelve tus problemas caminando, sin gastar en pasaje ni mototaxi.',
    actionHint: 'Toca "Siguiente" para continuar el recorrido',
    spotlight: {
      top: 68,
      left: 12,
      width: 230,
      height: 40,
      borderRadius: 12,
    },
    cardPosition: {
      top: 120,
      left: 16,
      right: 16,
    },
    pointer: {
      type: 'up',
      icon: '👆',
    },
  },
  {
    id: 'step-servicios',
    badge: 'PASO 2 DE 5 · CONFIANZA',
    badgeColor: '#0284c7',
    title: 'Oficios Validados con PIN',
    highlightText: '🔧 Pestaña Servicios & Oficios',
    description:
      'Para evitar recomendaciones falsas, cada vecino tiene un PIN secreto de 4 dígitos. Cuando el especialista termina el trabajo, tú le das tu PIN para certificar que el servicio fue 100% real.',
    actionHint: 'Toca "Siguiente" para descubrir el Muro Solidario',
    spotlight: {
      bottom: 8,
      left: SCREEN_WIDTH * 0.22 - 32,
      width: 64,
      height: 52,
      borderRadius: 16,
    },
    cardPosition: {
      bottom: 80,
      left: 16,
      right: 16,
    },
    pointer: {
      type: 'down',
      icon: '👇',
    },
  },
  {
    id: 'step-mapa',
    badge: 'PASO 3 DE 5 · GEOLOCALIZACIÓN',
    badgeColor: '#2563eb',
    title: 'Mapa Interactivo Camaleónico',
    highlightText: '🗺️ Pestaña Mapa Comunitario',
    description:
      'Mira en vivo los oficios y herramientas en Las Palmeras. Y ante un sismo o corte de agua, el mapa evoluciona automáticamente a vista táctica con albergues y zonas seguras.',
    actionHint: 'Toca "Siguiente" para ver la Cadena de Favores',
    spotlight: {
      bottom: 8,
      left: SCREEN_WIDTH * 0.5 - 32,
      width: 64,
      height: 52,
      borderRadius: 16,
    },
    cardPosition: {
      bottom: 80,
      left: 16,
      right: 16,
    },
    pointer: {
      type: 'down',
      icon: '👇',
    },
  },
  {
    id: 'step-solidaridad',
    badge: 'PASO 4 DE 5 · ECONOMÍA SOLIDARIA',
    badgeColor: '#059669',
    title: 'Resuelve Necesidades Sin Dinero',
    highlightText: '🤝 Muro Solidario & Favores',
    description:
      '¿Necesitas una escalera, un taladro o apoyo con tus compras? Pídelo prestado aquí. Ayudar a tus vecinos te suma puntos para subir de rango comunitario (🥉 Bronce a 🏆 Héroe).',
    actionHint: 'Toca "Siguiente" para conocer el botón de auxilio',
    spotlight: {
      bottom: 8,
      left: SCREEN_WIDTH * 0.76 - 32,
      width: 64,
      height: 52,
      borderRadius: 16,
    },
    cardPosition: {
      bottom: 80,
      left: 16,
      right: 16,
    },
    pointer: {
      type: 'down',
      icon: '👇',
    },
  },
  {
    id: 'step-sos',
    badge: 'PASO 5 DE 5 · AUXILIO Y RESCATE',
    badgeColor: '#dc2626',
    title: 'Botón Flotante SOS Inmediato',
    highlightText: '🚨 Botón de Pánico con GPS Offline',
    description:
      'En caso de robo, incendio, fuga de gas o terremoto, pulsa este botón. Despacha una alerta de emergencia a la central y a los brigadistas, ¡incluso si te quedas sin conexión a internet!',
    actionHint: '¡Excelente! Ya conoces cómo proteger y colaborar en tu comunidad.',
    spotlight: {
      bottom: 74,
      right: 16,
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    cardPosition: {
      bottom: 155,
      left: 16,
      right: 16,
    },
    pointer: {
      type: 'right',
      icon: '👉',
    },
  },
];

export const TutorialModal = ({ visible, onClose }: TutorialModalProps) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Animaciones continuas
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Animación de entrada de tarjeta
  const cardSlideAnim = useRef(new Animated.Value(20)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Loop de pulso expansivo sobre el foco (efecto radar/radar beacon)
  useEffect(() => {
    if (!visible) return;

    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.35,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    bounceLoop.start();

    return () => {
      pulseLoop.stop();
      bounceLoop.stop();
    };
  }, [visible, pulseAnim, pulseOpacity, bounceAnim]);

  // Transición suave de tarjeta al cambiar de paso
  useEffect(() => {
    cardSlideAnim.setValue(18);
    cardOpacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStepIdx, cardSlideAnim, cardOpacityAnim]);

  if (!visible) return null;

  const step = TOUR_STEPS[currentStepIdx];
  const isLast = currentStepIdx === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setCurrentStepIdx(0);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStepIdx(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.overlay}>
        {/* Barra Superior de Controles: Saltar Tour */}
        <View style={styles.topControlBar}>
          <View style={styles.tourProgressBadge}>
            <Text style={styles.tourProgressText}>
              GUÍA INTERACTIVA DEL VECINO
            </Text>
          </View>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipButtonText}>Saltar tour ✕</Text>
          </TouchableOpacity>
        </View>

        {/* Halo de Foco Animado (Spotlight / Ring de Atención) */}
        <View
          pointerEvents="box-none"
          style={[
            styles.spotlightContainer,
            {
              top: step.spotlight.top !== undefined ? (step.spotlight.top as number) : undefined,
              bottom: step.spotlight.bottom !== undefined ? (step.spotlight.bottom as number) : undefined,
              left: step.spotlight.left !== undefined ? (step.spotlight.left as number) : undefined,
              right: step.spotlight.right !== undefined ? (step.spotlight.right as number) : undefined,
              width: step.spotlight.width,
              height: step.spotlight.height,
            },
          ]}
        >
          {/* Onda Expansiva Pulsante */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderRadius: step.spotlight.borderRadius + 6,
                borderColor: step.badgeColor,
                transform: [{ scale: pulseAnim }],
                opacity: pulseOpacity,
              },
            ]}
          />

          {/* Marco Resaltado Central */}
          <TouchableOpacity
            style={[
              styles.spotlightCutout,
              {
                borderRadius: step.spotlight.borderRadius,
                borderColor: step.badgeColor,
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <View style={[styles.innerGlow, { backgroundColor: step.badgeColor }]} />
          </TouchableOpacity>

          {/* Indicador con Manito Rebotando */}
          <Animated.View
            style={[
              styles.pointerBox,
              step.pointer.type === 'down' && styles.pointerDown,
              step.pointer.type === 'up' && styles.pointerUp,
              step.pointer.type === 'right' && styles.pointerRight,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Text style={styles.pointerEmoji}>{step.pointer.icon}</Text>
          </Animated.View>
        </View>

        {/* Tarjeta Explicativa Flotante (Coachmark Dialog) */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              top: step.cardPosition.top !== undefined ? (step.cardPosition.top as number) : undefined,
              bottom: step.cardPosition.bottom !== undefined ? (step.cardPosition.bottom as number) : undefined,
              left: step.cardPosition.left !== undefined ? (step.cardPosition.left as number) : undefined,
              right: step.cardPosition.right !== undefined ? (step.cardPosition.right as number) : undefined,
              opacity: cardOpacityAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          <View style={[styles.coachCard, { borderTopColor: step.badgeColor }]}>
            {/* Cabecera de la Tarjeta */}
            <View style={styles.cardHeader}>
              <View style={[styles.stepBadge, { backgroundColor: step.badgeColor }]}>
                <Text style={styles.stepBadgeText}>{step.badge}</Text>
              </View>
              <View style={styles.stepCounter}>
                <Text style={styles.stepCounterText}>
                  {currentStepIdx + 1} / {TOUR_STEPS.length}
                </Text>
              </View>
            </View>

            {/* Título y Tag de Enfoque */}
            <Text style={styles.cardTitle}>{step.title}</Text>
            <View style={styles.highlightRow}>
              <Ionicons name="sparkles" size={13} color={step.badgeColor} />
              <Text style={[styles.highlightText, { color: step.badgeColor }]}>
                {step.highlightText}
              </Text>
            </View>

            {/* Explicación en Lenguaje Sencillo */}
            <Text style={styles.cardDescription}>{step.description}</Text>

            {/* Pista de Acción */}
            <View style={styles.actionHintBox}>
              <Ionicons name="bulb-outline" size={14} color="#0369a1" />
              <Text style={styles.actionHintText}>{step.actionHint}</Text>
            </View>

            {/* Progreso en Puntos */}
            <View style={styles.dotsRow}>
              {TOUR_STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentStepIdx
                      ? [styles.dotActive, { backgroundColor: step.badgeColor }]
                      : styles.dotInactive,
                  ]}
                />
              ))}
            </View>

            {/* Botones de Navegación */}
            <View style={styles.buttonsRow}>
              {currentStepIdx > 0 && (
                <TouchableOpacity style={styles.backBtn} onPress={handlePrev} activeOpacity={0.8}>
                  <Text style={styles.backBtnText}>← Anterior</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: step.badgeColor, flex: currentStepIdx > 0 ? 1 : undefined, width: currentStepIdx === 0 ? '100%' : undefined },
                ]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  {isLast ? '🎉 ¡Entendido, empezar ahora!' : 'Siguiente paso →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    position: 'relative',
  },
  topControlBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 26,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  tourProgressBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  tourProgressText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  spotlightContainer: {
    position: 'absolute',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  spotlightCutout: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  pointerBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerDown: {
    top: -34,
  },
  pointerUp: {
    bottom: -34,
  },
  pointerRight: {
    left: -34,
  },
  pointerEmoji: {
    fontSize: 28,
  },
  cardWrapper: {
    position: 'absolute',
    zIndex: 200,
    maxWidth: 440,
    alignSelf: 'center',
  },
  coachCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderTopWidth: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  stepBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  stepCounter: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stepCounterText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 12,
  },
  actionHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 14,
  },
  actionHintText: {
    flex: 1,
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#cbd5e1',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
