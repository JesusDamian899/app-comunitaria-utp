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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StepConfig {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  highlightText: string;
  description: string;
  actionHint: string;
  pointerEmoji: string;
  pointerPlacement: 'above-target' | 'below-target';
  getSpotlight: (insets: { top: number; bottom: number }) => {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
  };
  cardPlacement: 'below' | 'above';
}

const STEPS: StepConfig[] = [
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
    getSpotlight: (insets) => {
      const topPadding = Math.max(insets.top, 10) + 6;
      return {
        x: 14,
        y: topPadding + 46,
        w: SCREEN_WIDTH * 0.65,
        h: 40,
        r: 10,
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
      'Cada vecino tiene un PIN secreto de 4 dígitos. Cuando el especialista termina su labor, tú le das tu PIN para confirmar que el trabajo fue real y dejarle un Visto Bueno auténtico.',
    actionHint: 'Toca "Siguiente" para ver el Mapa Comunitario',
    pointerEmoji: '👇',
    pointerPlacement: 'above-target',
    cardPlacement: 'above',
    getSpotlight: (insets) => {
      const tabWidth = SCREEN_WIDTH / 5;
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      return {
        x: tabWidth * 1 + 2,
        y: SCREEN_HEIGHT - bottomPadding - 54,
        w: tabWidth - 4,
        h: 50,
        r: 12,
      };
    },
  },
  {
    id: 'step-mapa',
    badge: 'PASO 3 DE 5 · GEOLOCALIZACIÓN',
    badgeColor: '#2563eb',
    title: 'Mapa Interactivo Camaleónico',
    highlightText: '🗺️ Pestaña Mapa Comunitario',
    description:
      'Ubica en vivo los oficios y favores del barrio. Y si ocurre un sismo o corte de agua, el mapa evoluciona automáticamente a vista táctica con albergues y zonas seguras.',
    actionHint: 'Toca "Siguiente" para descubrir la Cadena de Favores',
    pointerEmoji: '👇',
    pointerPlacement: 'above-target',
    cardPlacement: 'above',
    getSpotlight: (insets) => {
      const tabWidth = SCREEN_WIDTH / 5;
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      return {
        x: tabWidth * 2 + 2,
        y: SCREEN_HEIGHT - bottomPadding - 54,
        w: tabWidth - 4,
        h: 50,
        r: 12,
      };
    },
  },
  {
    id: 'step-solidaridad',
    badge: 'PASO 4 DE 5 · ECONOMÍA SOLIDARIA',
    badgeColor: '#059669',
    title: 'Cadena de Favores Sin Dinero',
    highlightText: '🤝 Muro Solidario & Préstamos',
    description:
      '¿Necesitas una escalera, un taladro o apoyo con tus compras? Pídelo prestado sin costo. Colaborar te suma puntos para subir de rango (🥉 Bronce hasta 🏆 Héroe del Barrio).',
    actionHint: 'Toca "Siguiente" para conocer el botón de auxilio',
    pointerEmoji: '👇',
    pointerPlacement: 'above-target',
    cardPlacement: 'above',
    getSpotlight: (insets) => {
      const tabWidth = SCREEN_WIDTH / 5;
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      return {
        x: tabWidth * 3 + 2,
        y: SCREEN_HEIGHT - bottomPadding - 54,
        w: tabWidth - 4,
        h: 50,
        r: 12,
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
      'En caso de robo, incendio, fuga de gas o sismo, mantén presionado este botón rojo. Enviará tu auxilio a la central y brigadistas, ¡incluso si te quedas sin internet!',
    actionHint: '¡Listo! Ya conoces las herramientas para proteger y colaborar.',
    pointerEmoji: '👉',
    pointerPlacement: 'above-target',
    cardPlacement: 'above',
    getSpotlight: (insets) => {
      const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
      return {
        x: SCREEN_WIDTH - 16 - 58,
        y: SCREEN_HEIGHT - bottomPadding - 56 - 66,
        w: 58,
        h: 58,
        r: 29,
      };
    },
  },
];

export const TutorialModal = ({ visible, onClose }: TutorialModalProps) => {
  const insets = useSafeAreaInsets();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Animaciones
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(16)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Reiniciar estado siempre que el modal se abra
  useEffect(() => {
    if (visible) {
      setCurrentStepIdx(0);
      cardOpacityAnim.setValue(0);
      cardSlideAnim.setValue(16);

      Animated.parallel([
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Transición suave entre pasos
  useEffect(() => {
    if (!visible) return;

    cardOpacityAnim.setValue(0);
    cardSlideAnim.setValue(14);

    Animated.parallel([
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStepIdx]);

  // Loop de pulso y rebote del puntero
  useEffect(() => {
    if (!visible) return;

    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.25,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.1,
            duration: 1000,
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
          toValue: -6,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
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

  const step = STEPS[currentStepIdx];
  const isLast = currentStepIdx === STEPS.length - 1;
  const spot = step.getSpotlight(insets);

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

  // Dimensiones del recorte / ventana transparente real
  const topBoxHeight = Math.max(0, spot.y);
  const bottomBoxTop = spot.y + spot.h;
  const bottomBoxHeight = Math.max(0, SCREEN_HEIGHT - bottomBoxTop);
  const leftBoxWidth = Math.max(0, spot.x);
  const rightBoxLeft = spot.x + spot.w;
  const rightBoxWidth = Math.max(0, SCREEN_WIDTH - rightBoxLeft);

  const cardWidth = Math.min(SCREEN_WIDTH - 28, 400);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.container}>
        {/* ============================================================ */}
        {/* RECORTE REAL CON 4 PANELES OSCUROS (La app abajo queda 100% clara) */}
        {/* ============================================================ */}
        {/* Panel Superior */}
        <View style={[styles.darkPanel, { top: 0, left: 0, right: 0, height: topBoxHeight }]} />

        {/* Panel Inferior */}
        <View style={[styles.darkPanel, { top: bottomBoxTop, left: 0, right: 0, height: bottomBoxHeight }]} />

        {/* Panel Izquierdo */}
        <View style={[styles.darkPanel, { top: spot.y, left: 0, width: leftBoxWidth, height: spot.h }]} />

        {/* Panel Derecho */}
        <View style={[styles.darkPanel, { top: spot.y, left: rightBoxLeft, width: rightBoxWidth, height: spot.h }]} />

        {/* ============================================================ */}
        {/* BARRA SUPERIOR: TÍTULO Y BOTÓN SALTAR */}
        {/* ============================================================ */}
        <View style={[styles.topBar, { top: Math.max(insets.top, 12) + 4 }]}>
          <View style={styles.guideBadge}>
            <Ionicons name="compass" size={13} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.guideBadgeText}>GUÍA DEL VECINO</Text>
          </View>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipBtnText}>Saltar tour ✕</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================ */}
        {/* FOCO LUMINOSO / MARCO BRILLANTE SOBRE EL ELEMENTO DESTACADO */}
        {/* ============================================================ */}
        <View
          pointerEvents="box-none"
          style={[
            styles.spotlightFrame,
            {
              top: spot.y,
              left: spot.x,
              width: spot.w,
              height: spot.h,
            },
          ]}
        >
          {/* Anillo de pulso expansivo */}
          <Animated.View
            style={[
              styles.pulseAura,
              {
                borderRadius: spot.r + 4,
                borderColor: step.badgeColor,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />

          {/* Borde brillante del recorte (Tocar aquí también avanza) */}
          <TouchableOpacity
            style={[
              styles.cutoutBorder,
              {
                borderRadius: spot.r,
                borderColor: step.badgeColor,
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.9}
          />

          {/* Manito señalizadora animada */}
          <Animated.View
            style={[
              styles.pointerEmojiBox,
              step.pointerPlacement === 'above-target' ? styles.pointerAbove : styles.pointerBelow,
              step.id === 'step-sos' && styles.pointerSosOffset,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Text style={styles.pointerEmojiText}>{step.pointerEmoji}</Text>
          </Animated.View>
        </View>

        {/* ============================================================ */}
        {/* TARJETA EXPLICATIVA COACHMARK (Posicionada arriba o abajo) */}
        {/* ============================================================ */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              width: cardWidth,
              opacity: cardOpacityAnim,
              transform: [{ translateY: cardSlideAnim }],
              ...(step.cardPlacement === 'below'
                ? { top: spot.y + spot.h + 14 }
                : { bottom: SCREEN_HEIGHT - spot.y + 14 }),
            },
          ]}
        >
          <View style={[styles.card, { borderTopColor: step.badgeColor }]}>
            {/* Cabecera del paso */}
            <View style={styles.cardHeader}>
              <View style={[styles.stepBadge, { backgroundColor: step.badgeColor }]}>
                <Text style={styles.stepBadgeText}>{step.badge}</Text>
              </View>
              <View style={styles.stepCounterPill}>
                <Text style={styles.stepCounterText}>
                  {currentStepIdx + 1} / {STEPS.length}
                </Text>
              </View>
            </View>

            {/* Título y elemento enfocado */}
            <Text style={styles.titleText}>{step.title}</Text>
            <View style={styles.highlightRow}>
              <Ionicons name="sparkles" size={13} color={step.badgeColor} />
              <Text style={[styles.highlightText, { color: step.badgeColor }]}>
                {step.highlightText}
              </Text>
            </View>

            {/* Explicación amigable */}
            <Text style={styles.descText}>{step.description}</Text>

            {/* Tip interactivo */}
            <View style={styles.hintBox}>
              <Ionicons name="bulb-outline" size={14} color="#0369a1" />
              <Text style={styles.hintText}>{step.actionHint}</Text>
            </View>

            {/* Puntos de avance */}
            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
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

            {/* Botones de acción */}
            <View style={styles.btnRow}>
              {currentStepIdx > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={handlePrev} activeOpacity={0.8}>
                  <Text style={styles.backButtonText}>← Anterior</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: step.badgeColor,
                    flex: currentStepIdx > 0 ? 1 : undefined,
                    width: currentStepIdx === 0 ? '100%' : undefined,
                  },
                ]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextButtonText}>
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
  container: {
    flex: 1,
    position: 'relative',
  },
  darkPanel: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
  },
  topBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  guideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  guideBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  skipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  skipBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  spotlightFrame: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  pulseAura: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cutoutBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  pointerEmojiBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  pointerBelow: {
    top: '100%',
    marginTop: 6,
  },
  pointerAbove: {
    bottom: '100%',
    marginBottom: 6,
  },
  pointerSosOffset: {
    bottom: '100%',
    right: 14,
    marginBottom: 4,
  },
  pointerEmojiText: {
    fontSize: 26,
  },
  cardContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 350,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderTopWidth: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  stepCounterPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stepCounterText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 3,
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
    fontSize: 12.5,
    lineHeight: 18,
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
    borderRadius: 10,
    paddingHorizontal: 10,
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
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  nextButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
