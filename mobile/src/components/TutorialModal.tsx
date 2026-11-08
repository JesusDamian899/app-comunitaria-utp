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
  Easing,
} from 'react-native';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, TutorialTargetLayout } from '../context/AppContext';

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
  pointerEmoji: string;
  pointerPlacement: 'above-target' | 'below-target' | 'above-sos';
  cardPlacement: 'below' | 'above';
  getFallbackLayout: (insets: { top: number; bottom: number }) => TutorialTargetLayout;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-radios',
    badge: 'PASO 1 DE 5 · HIPERLOCAL',
    badgeColor: '#1d4ed8',
    title: 'Selector de Radio: Todo a 500m',
    highlightText: '📍 Filtra por cercanía a tu casa',
    description:
      'Encuentra gasfiteros, electricistas y favores a menos de 500 metros. Resuelve tus necesidades caminando en tu misma manzana, sin gastar en transporte.',
    actionHint: 'Toca "Siguiente" para conocer la validación de servicios',
    pointerEmoji: '👆',
    pointerPlacement: 'below-target',
    cardPlacement: 'below',
    getFallbackLayout: (insets) => {
      const topPadding = Math.max(insets.top, 10) + 6;
      return {
        x: 14,
        y: topPadding + 52,
        width: SCREEN_WIDTH * 0.64,
        height: 38,
        borderRadius: 10,
        shape: 'rect',
      };
    },
  },
  {
    id: 'step-servicios',
    badge: 'PASO 2 DE 5 · CONFIANZA',
    badgeColor: '#0284c7',
    title: 'Oficios Validados con PIN',
    highlightText: '🔧 Pestaña Servicios & Oficios',
    description:
      'Cada vecino tiene un PIN secreto de 4 dígitos. Cuando el especialista concluye su labor, tú le das tu PIN para confirmar que el trabajo fue real y dejarle un Visto Bueno auténtico.',
    actionHint: 'Toca "Siguiente" para ver el Mapa Comunitario',
    pointerEmoji: '👇',
    pointerPlacement: 'above-target',
    cardPlacement: 'above',
    getFallbackLayout: (insets) => {
      const tabWidth = SCREEN_WIDTH / 5;
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      return {
        x: tabWidth * 1 + 2,
        y: SCREEN_HEIGHT - bottomPadding - 48,
        width: tabWidth - 4,
        height: 52,
        borderRadius: 14,
        shape: 'rect',
      };
    },
  },
  {
    id: 'step-mapa',
    badge: 'PASO 3 DE 5 · GEOLOCALIZACIÓN',
    badgeColor: '#2563eb',
    title: 'Mapa Interactivo Camaleónico',
    highlightText: '🗺️ Pestaña Mapa en Vivo',
    description:
      'En el día a día ves oficios y herramientas en el barrio. Y ante un sismo o contingencia, el mapa evoluciona para guiarte a albergues, agua potable y rescate.',
    actionHint: 'Toca "Siguiente" para descubrir el Muro Solidario',
    pointerEmoji: '👇',
    pointerPlacement: 'above-target',
    cardPlacement: 'above',
    getFallbackLayout: (insets) => {
      const tabWidth = SCREEN_WIDTH / 5;
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      return {
        x: tabWidth * 2 + 2,
        y: SCREEN_HEIGHT - bottomPadding - 48,
        width: tabWidth - 4,
        height: 52,
        borderRadius: 14,
        shape: 'rect',
      };
    },
  },
  {
    id: 'step-solidaridad',
    badge: 'PASO 4 DE 5 · ECONOMÍA SOLIDARIA',
    badgeColor: '#059669',
    title: 'Muro Solidario: Sin Dinero',
    highlightText: '🤝 Pestaña Solidaridad & Favores',
    description:
      '¿Necesitas una escalera de 6m o un taladro? Pídelo prestado sin costo. Al ayudar a tus vecinos acumulas favores en tu perfil y ganas rangos de honor en el barrio.',
    actionHint: 'Toca "Siguiente" para conocer el botón de pánico SOS',
    pointerEmoji: '👇',
    pointerPlacement: 'above-target',
    cardPlacement: 'above',
    getFallbackLayout: (insets) => {
      const tabWidth = SCREEN_WIDTH / 5;
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      return {
        x: tabWidth * 3 + 2,
        y: SCREEN_HEIGHT - bottomPadding - 48,
        width: tabWidth - 4,
        height: 52,
        borderRadius: 14,
        shape: 'rect',
      };
    },
  },
  {
    id: 'step-sos',
    badge: 'PASO 5 DE 5 · AUXILIO Y RESCATE',
    badgeColor: '#dc2626',
    title: 'Botón Flotante SOS Inmediato',
    highlightText: '🚨 Auxilio Inmediato con GPS Offline',
    description:
      'En caso de robo, incendio, fuga de gas o sismo, presiona este botón rojo. Enviará tu auxilio a la central y brigadistas, ¡incluso si te quedas sin internet!',
    actionHint: '¡Listo! Ya conoces las herramientas para proteger y colaborar.',
    pointerEmoji: '👇',
    pointerPlacement: 'above-sos',
    cardPlacement: 'above',
    getFallbackLayout: (insets) => {
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      const bottomPosition = bottomPadding + 66;
      return {
        x: SCREEN_WIDTH - 18 - 58,
        y: SCREEN_HEIGHT - bottomPosition - 58,
        width: 58,
        height: 58,
        borderRadius: 29,
        shape: 'circle',
      };
    },
  },
];

export const TutorialModal = ({ visible, onClose }: TutorialModalProps) => {
  const insets = useSafeAreaInsets();
  const { tutorialTargets } = useApp();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Animaciones: pulso sobre el elemento, rebote del puntero y entrada de la tarjeta
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(16)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  // Reiniciar estado cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setCurrentStepIdx(0);
      triggerCardAnimation();
    }
  }, [visible]);

  // Transición suave al cambiar de paso
  useEffect(() => {
    if (visible) {
      triggerCardAnimation();
    }
  }, [currentStepIdx]);

  const triggerCardAnimation = () => {
    cardSlideAnim.setValue(14);
    cardFadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Pulso y rebote continuos en loop a 60 FPS
  useEffect(() => {
    if (!visible) return;

    // Pulso del anillo luminoso
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Rebote del puntero táctil
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
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
  }, [visible]);

  if (!visible) return null;

  const step = TOUR_STEPS[currentStepIdx];
  const isLast = currentStepIdx === TOUR_STEPS.length - 1;

  // Obtener dimensiones reales del target (prioriza la medición nativa en ventana)
  const measured = tutorialTargets[step.id];
  const target: TutorialTargetLayout = measured && measured.width > 0 && measured.height > 0
    ? measured
    : step.getFallbackLayout(insets);

  const isCircle = target.shape === 'circle';
  const circleRadius = isCircle ? Math.max(target.width, target.height) / 2 + 3 : 0;
  const circleCenterX = target.x + target.width / 2;
  const circleCenterY = target.y + target.height / 2;

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

  // Posicionamiento dinámico adaptativo de la tarjeta
  const cardWidth = Math.min(SCREEN_WIDTH - 28, 420);
  const cardStyle = step.cardPlacement === 'below'
    ? { top: Math.min(target.y + target.height + 20, SCREEN_HEIGHT - 320) }
    : { bottom: Math.min(SCREEN_HEIGHT - target.y + 44, SCREEN_HEIGHT - 120) };

  // Posicionamiento dinámico del puntero emoji
  const renderPointer = () => {
    if (step.pointerPlacement === 'below-target') {
      return (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pointerBox,
            {
              top: target.y + target.height + 6,
              left: target.x + Math.min(target.width / 2, 70) - 15,
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          <Text style={styles.pointerEmoji}>{step.pointerEmoji}</Text>
        </Animated.View>
      );
    }

    if (step.pointerPlacement === 'above-sos') {
      return (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pointerBox,
            {
              top: target.y - 36,
              left: target.x + target.width / 2 - 15,
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          <Text style={styles.pointerEmoji}>{step.pointerEmoji}</Text>
        </Animated.View>
      );
    }

    // Por defecto: 'above-target' (para pestañas inferiores)
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pointerBox,
          {
            top: target.y - 34,
            left: target.x + target.width / 2 - 15,
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        <Text style={styles.pointerEmoji}>{step.pointerEmoji}</Text>
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.fullContainer}>
        {/* =========================================================================
            1. MÁSCARA SVG: Recorte matemático perfecto (Círculos y Píldoras sin esquinas)
           ========================================================================= */}
        <Svg
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <Mask id={`spotlight-mask-${currentStepIdx}`} x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
              {/* Capa blanca completa: define dónde el fondo oscuro ES VISIBLE */}
              <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="#ffffff" />

              {/* Hueco negro recortado: define dónde el fondo oscuro se vuelve 100% TRANSPARENTE */}
              {isCircle ? (
                <Circle
                  cx={circleCenterX}
                  cy={circleCenterY}
                  r={circleRadius}
                  fill="#000000"
                />
              ) : (
                <Rect
                  x={target.x}
                  y={target.y}
                  width={target.width}
                  height={target.height}
                  rx={target.borderRadius || 12}
                  ry={target.borderRadius || 12}
                  fill="#000000"
                />
              )}
            </Mask>
          </Defs>

          {/* Velo oscuro translúcido con la máscara aplicada */}
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="rgba(15, 23, 42, 0.78)"
            mask={`url(#spotlight-mask-${currentStepIdx})`}
          />
        </Svg>

        {/* =========================================================================
            2. ANILLO PULSANTE LUMINOSO: Resalta el contorno exacto sin esquinas cuadradas
           ========================================================================= */}
        {isCircle ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.circleHalo,
              {
                left: circleCenterX - (circleRadius + 4),
                top: circleCenterY - (circleRadius + 4),
                width: (circleRadius + 4) * 2,
                height: (circleRadius + 4) * 2,
                borderRadius: circleRadius + 4,
                borderColor: step.badgeColor,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        ) : (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.rectHalo,
              {
                left: target.x - 4,
                top: target.y - 3,
                width: target.width + 8,
                height: target.height + 6,
                borderRadius: (target.borderRadius || 12) + 3,
                borderColor: step.badgeColor,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}

        {/* =========================================================================
            3. PUNTERO TÁCTIL ANIMADO: Indica con precisión dónde pulsar
           ========================================================================= */}
        {renderPointer()}

        {/* =========================================================================
            4. BARRA SUPERIOR FLOTANTE: Indicador de la guía y botón para saltar
           ========================================================================= */}
        <View style={[styles.topBar, { top: Math.max(insets.top, 10) + 4 }]}>
          <View style={styles.topPill}>
            <Ionicons name="sparkles" size={13} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={styles.topPillText}>GUÍA INTERACTIVA DEL VECINO</Text>
          </View>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipBtnText}>Saltar tour ✕</Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            5. TARJETA EXPLICATIVA ADAPTATIVA (Diseño Antidesborde con Flex elástico)
           ========================================================================= */}
        <Animated.View
          style={[
            styles.cardContainer,
            cardStyle,
            {
              width: cardWidth,
              opacity: cardFadeAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          <View style={[styles.card, { borderTopColor: step.badgeColor }]}>
            {/* Cabecera con Insignia de Paso y Contador */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.stepBadge, { backgroundColor: step.badgeColor }]}>
                <Text style={styles.stepBadgeText}>{step.badge}</Text>
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>
                  {currentStepIdx + 1} de {TOUR_STEPS.length}
                </Text>
              </View>
            </View>

            {/* Título del Elemento Resaltado */}
            <Text style={styles.titleText}>{step.title}</Text>

            {/* Subtítulo con Icono de Resalte */}
            <View style={styles.highlightRow}>
              <Ionicons name="sparkles" size={13} color={step.badgeColor} />
              <Text style={[styles.highlightText, { color: step.badgeColor }]}>
                {step.highlightText}
              </Text>
            </View>

            {/* Explicación en lenguaje sencillo para el vecino */}
            <Text style={styles.descText}>{step.description}</Text>

            {/* Beneficio clave o instrucción de acción */}
            <View style={styles.hintBox}>
              <Ionicons name="bulb-outline" size={15} color="#0284c7" />
              <Text style={styles.hintText}>{step.actionHint}</Text>
            </View>

            {/* Indicador de Progreso con Puntos Interactivos */}
            <View style={styles.dotsRow}>
              {TOUR_STEPS.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setCurrentStepIdx(i)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <View
                    style={[
                      styles.dot,
                      i === currentStepIdx
                        ? [styles.dotActive, { backgroundColor: step.badgeColor }]
                        : styles.dotInactive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Fila de Botones: Totalmente protegida contra desbordes */}
            <View style={styles.btnRow}>
              {currentStepIdx > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handlePrev}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText} numberOfLines={1}>
                    ← Atrás
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: step.badgeColor,
                    flex: currentStepIdx > 0 ? 1.4 : undefined,
                    width: currentStepIdx === 0 ? '100%' : undefined,
                  },
                ]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextButtonText} numberOfLines={1}>
                  {isLast ? '¡Comenzar! 🚀' : 'Siguiente →'}
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
  fullContainer: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  topPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  skipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  skipBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  circleHalo: {
    position: 'absolute',
    borderWidth: 2.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 150,
  },
  rectHalo: {
    position: 'absolute',
    borderWidth: 2.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 150,
  },
  pointerBox: {
    position: 'absolute',
    zIndex: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerEmoji: {
    fontSize: 32,
  },
  cardContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 350,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderTopWidth: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  stepBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  counterBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 21,
    marginBottom: 2,
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
  descText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 10,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 10.5,
    color: '#0369a1',
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 18,
  },
  dotInactive: {
    width: 5,
    backgroundColor: '#cbd5e1',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  backButton: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    flexShrink: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
});
