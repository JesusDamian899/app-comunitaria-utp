import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShowcaseStep {
  id: string;
  badge: string;
  badgeColor: string;
  locationTag: string;
  locationIcon: string;
  title: string;
  subtitle: string;
  description: string;
  highlightBenefit: string;
  renderInteractiveDemo: (pulseAnim: Animated.Value) => React.ReactNode;
}

export const TutorialModal = ({ visible, onClose }: TutorialModalProps) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Animaciones de escala, pulso y entrada de tarjeta
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reiniciar estado cada vez que se abre el modal
  useEffect(() => {
    if (visible) {
      setCurrentStepIdx(0);
      slideAnim.setValue(16);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Transición suave entre pasos
  useEffect(() => {
    if (!visible) return;

    slideAnim.setValue(14);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStepIdx]);

  // Loop de pulso continuo sobre los elementos clave
  useEffect(() => {
    if (!visible) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [visible]);

  if (!visible) return null;

  const STEPS: ShowcaseStep[] = [
    {
      id: 'radios',
      badge: 'PASO 1 DE 5 · HIPERLOCAL',
      badgeColor: '#1d4ed8',
      locationTag: 'Arriba en la cabecera',
      locationIcon: 'arrow-up-circle',
      title: 'Selector de Radio: Todo a 500m',
      subtitle: 'Encuentra soluciones a pocos pasos de tu casa',
      description:
        'Filtra oficios, servicios y favores a menos de 500 metros. Resuelve tus necesidades en tu misma manzana caminando, sin gastar en mototaxis ni pasajes.',
      highlightBenefit: '💡 Diseñado para ahorrar costos de transporte al vecino',
      renderInteractiveDemo: (pulse) => (
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>SIMULADOR EN VIVO:</Text>
          <View style={styles.radiosSimRow}>
            <Text style={styles.radiosSimText}>Radio:</Text>
            <Animated.View style={[styles.radioChipActive, { transform: [{ scale: pulse }] }]}>
              <Text style={styles.radioChipActiveText}>📍 500m</Text>
            </Animated.View>
            <View style={styles.radioChipInactive}>
              <Text style={styles.radioChipInactiveText}>2km</Text>
            </View>
            <View style={styles.radioChipInactive}>
              <Text style={styles.radioChipInactiveText}>5km</Text>
            </View>
          </View>
          <View style={styles.demoSubBadge}>
            <Ionicons name="walk" size={14} color="#1d4ed8" />
            <Text style={styles.demoSubBadgeText}>
              Sector 2: A solo 3 minutos caminando (0 costo de transporte)
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'servicios',
      badge: 'PASO 2 DE 5 · CONFIANZA VECINAL',
      badgeColor: '#0284c7',
      locationTag: 'Pestaña 2 en la barra inferior',
      locationIcon: 'construct',
      title: 'Oficios Validados con PIN',
      subtitle: 'Evita recomendaciones falsas con seguridad real',
      description:
        'Cada vecino tiene un PIN secreto de 4 dígitos. Al concluir un trabajo, le entregas tu PIN al especialista para validar que el servicio fue 100% auténtico y otorgarle un "Visto Bueno".',
      highlightBenefit: '🔒 A los 5 vistos buenos vecinales se activa el Check Azul ✓',
      renderInteractiveDemo: (pulse) => (
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>VALIDACIÓN CON PIN DE 4 DÍGITOS:</Text>
          <View style={styles.pinSimRow}>
            <View style={styles.pinDigitBox}><Text style={styles.pinDigitText}>3</Text></View>
            <View style={styles.pinDigitBox}><Text style={styles.pinDigitText}>1</Text></View>
            <View style={styles.pinDigitBox}><Text style={styles.pinDigitText}>5</Text></View>
            <View style={styles.pinDigitBox}><Text style={styles.pinDigitText}>0</Text></View>
            <Animated.View style={[styles.pinCheckBadge, { transform: [{ scale: pulse }] }]}>
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
              <Text style={styles.pinCheckText}>V°B° APROBADO</Text>
            </Animated.View>
          </View>
          <Text style={styles.pinSubText}>
            ✓ Solo vecinos residentes pueden certificar la reputación del técnico
          </Text>
        </View>
      ),
    },
    {
      id: 'mapa',
      badge: 'PASO 3 DE 5 · GEOLOCALIZACIÓN',
      badgeColor: '#2563eb',
      locationTag: 'Pestaña central 3 en la barra inferior',
      locationIcon: 'map',
      title: 'Mapa Interactivo Camaleónico',
      subtitle: 'Evoluciona del día a día a emergencias críticas',
      description:
        'En el día a día ves oficios y herramientas en el barrio. Y si ocurre un terremoto o contingencia, el mapa evoluciona al instante para guiarte a albergues, agua potable y auxilio.',
      highlightBenefit: '🗺️ Funciona 100% online y offline con mapas en caché local',
      renderInteractiveDemo: (pulse) => (
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>EVOLUCIÓN EN TIEMPO REAL:</Text>
          <View style={styles.mapDualRow}>
            <View style={styles.mapDualSideBlue}>
              <Ionicons name="sunny" size={14} color="#1d4ed8" />
              <Text style={styles.mapDualSideTitle}>DÍA A DÍA</Text>
              <Text style={styles.mapDualSideDesc}>🔧 Oficios & Favores</Text>
            </View>
            <Animated.View style={[styles.switchArrowBox, { transform: [{ scale: pulse }] }]}>
              <Ionicons name="swap-horizontal" size={18} color="#0f172a" />
            </Animated.View>
            <View style={styles.mapDualSideRed}>
              <Ionicons name="warning" size={14} color="#dc2626" />
              <Text style={styles.mapDualSideTitleRed}>MODO CRISIS</Text>
              <Text style={styles.mapDualSideDescRed}>🚨 Rescate & Agua</Text>
            </View>
          </View>
          <Text style={styles.pinSubText}>
            Cumple 100% el reto: la app evoluciona dinámicamente según el contexto
          </Text>
        </View>
      ),
    },
    {
      id: 'solidaridad',
      badge: 'PASO 4 DE 5 · ECONOMÍA SOLIDARIA',
      badgeColor: '#059669',
      locationTag: 'Pestaña 4 en la barra inferior',
      locationIcon: 'hand-heart',
      title: 'Muro Solidario: Sin Dinero',
      subtitle: 'Préstamos, donaciones y cadena de favores',
      description:
        '¿Necesitas una escalera de 6m o un taladro percutor? Pídelo prestado sin costo. Al ayudar a tus vecinos acumulas favores en tu perfil y ganas rangos de honor en el barrio.',
      highlightBenefit: '🤝 Publica pedidos o préstamos en 2 clics con plantillas rápidas',
      renderInteractiveDemo: (pulse) => (
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>NIVELES DE HONOR COMUNITARIO:</Text>
          <View style={styles.gamificationRow}>
            <View style={styles.gamificationBadge}>
              <Text style={styles.gamificationIcon}>🥉</Text>
              <Text style={styles.gamificationName}>Bronce</Text>
            </View>
            <View style={styles.gamificationBadge}>
              <Text style={styles.gamificationIcon}>🥈</Text>
              <Text style={styles.gamificationName}>Plata</Text>
            </View>
            <View style={styles.gamificationBadge}>
              <Text style={styles.gamificationIcon}>🥇</Text>
              <Text style={styles.gamificationName}>Oro</Text>
            </View>
            <Animated.View
              style={[
                styles.gamificationBadgeHero,
                { transform: [{ scale: pulse }] },
              ]}
            >
              <Text style={styles.gamificationIcon}>🏆</Text>
              <Text style={styles.gamificationNameHero}>Héroe</Text>
            </Animated.View>
          </View>
          <Text style={styles.pinSubText}>
            Incentiva la colaboración mutua vecinal sin depender de dinero en efectivo
          </Text>
        </View>
      ),
    },
    {
      id: 'sos',
      badge: 'PASO 5 DE 5 · AUXILIO Y RESCATE',
      badgeColor: '#dc2626',
      locationTag: 'Botón flotante en la esquina inferior derecha',
      locationIcon: 'alert-circle',
      title: 'Botón Flotante SOS Inmediato',
      subtitle: 'Alerta de pánico con geolocalización satelital',
      description:
        'En caso de robo, fuga de gas, incendio o sismo, presiona este botón rojo. Enviará de inmediato tu auxilio a la central y a los brigadistas, ¡incluso si te quedas sin internet!',
      highlightBenefit: '📡 Funciona con SQLite offline y se sincroniza al recuperar señal',
      renderInteractiveDemo: (pulse) => (
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>BOTÓN DE PÁNICO TÁCTICO:</Text>
          <View style={styles.sosSimRow}>
            <Animated.View style={[styles.sosSimButton, { transform: [{ scale: pulse }] }]}>
              <MaterialCommunityIcons name="asterisk" size={24} color="#ffffff" />
              <Text style={styles.sosSimButtonText}>SOS</Text>
            </Animated.View>
            <View style={styles.sosSimInfo}>
              <Text style={styles.sosSimInfoTitle}>DESPACHO INMEDIATO</Text>
              <Text style={styles.sosSimInfoCoord}>📍 GPS: -11.8675, -77.0754</Text>
              <Text style={styles.sosSimInfoSub}>SQLite Local ➔ Supabase en línea</Text>
            </View>
          </View>
          <Text style={styles.pinSubText}>
            Visible en todo momento desde cualquier pantalla con un solo toque
          </Text>
        </View>
      ),
    },
  ];

  const step = STEPS[currentStepIdx];
  const isLast = currentStepIdx === STEPS.length - 1;

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

  const cardWidth = Math.min(SCREEN_WIDTH - 28, 420);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.modalBackdrop}>
        {/* Barra Superior Flotante: Indicador y Botón Saltar */}
        <View style={styles.topHeaderBar}>
          <View style={styles.topPill}>
            <Ionicons name="sparkles" size={13} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={styles.topPillText}>GUÍA INTERACTIVA DEL VECINO</Text>
          </View>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipBtnText}>Cerrar ✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta Central Interactiva Adaptativa */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              width: cardWidth,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.card, { borderTopColor: step.badgeColor }]}>
            {/* Cabecera del Paso */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.stepBadge, { backgroundColor: step.badgeColor }]}>
                <Text style={styles.stepBadgeText}>{step.badge}</Text>
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>
                  {currentStepIdx + 1} de {STEPS.length}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.cardScroll}
              contentContainerStyle={styles.cardScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Dónde se encuentra en la app */}
              <View style={styles.locationPillRow}>
                <Ionicons name={step.locationIcon as any} size={14} color={step.badgeColor} />
                <Text style={[styles.locationPillText, { color: step.badgeColor }]}>
                  Ubicación: {step.locationTag}
                </Text>
              </View>

              {/* Título y Subtítulo */}
              <Text style={styles.titleText}>{step.title}</Text>
              <Text style={styles.subtitleText}>{step.subtitle}</Text>

              {/* Simulador Interactivo en Vivo */}
              <View style={styles.demoContainer}>
                {step.renderInteractiveDemo(pulseAnim)}
              </View>

              {/* Explicación en lenguaje sencillo */}
              <Text style={styles.descriptionText}>{step.description}</Text>

              {/* Beneficio destacado */}
              <View style={styles.benefitBox}>
                <Text style={styles.benefitText}>{step.highlightBenefit}</Text>
              </View>
            </ScrollView>

            {/* Puntos Indicadores de Progreso */}
            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setCurrentStepIdx(i)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
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

            {/* Botones de Navegación con Diseño Totalmente Antidesborde */}
            <View style={styles.actionsRow}>
              {currentStepIdx > 0 && (
                <TouchableOpacity style={styles.prevBtn} onPress={handlePrev} activeOpacity={0.8}>
                  <Text style={styles.prevBtnText}>← Anterior</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  {
                    backgroundColor: step.badgeColor,
                    flex: currentStepIdx > 0 ? 1 : undefined,
                    width: currentStepIdx === 0 ? '100%' : undefined,
                  },
                ]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText} numberOfLines={1}>
                  {isLast ? '¡Comenzar ahora! 🚀' : 'Siguiente paso →'}
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  topHeaderBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 28,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  cardWrapper: {
    maxHeight: '88%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderTopWidth: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 16,
  },
  cardScroll: {
    maxHeight: SCREEN_HEIGHT * 0.58,
  },
  cardScrollContent: {
    paddingBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
  locationPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  locationPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 21,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
  },
  demoContainer: {
    marginBottom: 10,
  },
  demoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  demoLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  radiosSimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  radiosSimText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  radioChipActive: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1d4ed8',
  },
  radioChipActiveText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  radioChipInactive: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  radioChipInactiveText: {
    color: '#64748b',
    fontSize: 10.5,
    fontWeight: '700',
  },
  demoSubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  demoSubBadgeText: {
    flex: 1,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  pinSimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  pinDigitBox: {
    width: 28,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  pinCheckBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },
  pinCheckText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
  },
  pinSubText: {
    fontSize: 9.5,
    color: '#64748b',
    lineHeight: 14,
    marginTop: 2,
  },
  mapDualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mapDualSideBlue: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 7,
    alignItems: 'center',
  },
  mapDualSideTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1d4ed8',
    marginTop: 2,
  },
  mapDualSideDesc: {
    fontSize: 8.5,
    color: '#3b82f6',
    fontWeight: '600',
  },
  switchArrowBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapDualSideRed: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 7,
    alignItems: 'center',
  },
  mapDualSideTitleRed: {
    fontSize: 9,
    fontWeight: '900',
    color: '#dc2626',
    marginTop: 2,
  },
  mapDualSideDescRed: {
    fontSize: 8.5,
    color: '#ef4444',
    fontWeight: '600',
  },
  gamificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 4,
  },
  gamificationBadge: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 5,
  },
  gamificationBadgeHero: {
    flex: 1.1,
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 5,
  },
  gamificationIcon: {
    fontSize: 14,
  },
  gamificationName: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#475569',
    marginTop: 2,
  },
  gamificationNameHero: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#b45309',
    marginTop: 2,
  },
  sosSimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sosSimButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  sosSimButtonText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    marginTop: -2,
  },
  sosSimInfo: {
    flex: 1,
  },
  sosSimInfoTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#991b1b',
  },
  sosSimInfoCoord: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  sosSimInfoSub: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 1,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 8,
  },
  benefitBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: '700',
    lineHeight: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prevBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  prevBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
  },
  nextBtn: {
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
  nextBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
