import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Linking,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome5, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { MOCK_PROVIDERS } from '../mock/data';
import type { ServiceProvider, ServiceCategoryType } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../components/AuthGuard';
import { supabase } from '../lib/supabaseClient';

const CATEGORIES_NORMAL: { id: ServiceCategoryType; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: 'apps' },
  { id: 'alimentacion', label: 'Alimentación', icon: 'restaurant' },
  { id: 'mantenimiento_hogar', label: 'Mantenimiento y Hogar', icon: 'build' },
  { id: 'salud_bienestar', label: 'Salud y Bienestar', icon: 'medkit' },
  { id: 'compras_bazar', label: 'Compras y Bazar', icon: 'cart' },
  { id: 'servicios_tramites', label: 'Servicios y trámites', icon: 'document-text' },
  { id: 'vehiculos_mascotas', label: 'Vehículos y Mascotas', icon: 'paw' },
  { id: 'otros', label: 'Otros', icon: 'sparkles' },
];

const CATEGORIES_CRISIS: { id: ServiceCategoryType; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todas las Brigadas', icon: 'shield-alert' },
  { id: 'salud_bienestar', label: 'Enfermería & Primeros Auxilios', icon: 'medkit' },
  { id: 'mantenimiento_hogar', label: 'Gasfitería & Fugas de Agua', icon: 'water' },
  { id: 'servicios_tramites', label: 'Electricidad de Emergencia', icon: 'flash' },
  { id: 'otros', label: 'Cerrajería & Rescate', icon: 'key' },
];

const SERVICE_PRESETS = [
  { label: '🔧 Gasfitería Rápida', cat: 'mantenimiento_hogar' as ServiceCategoryType, title: 'Gasfitería y bombas de agua', desc: 'Detección de fugas, desatoro y reparación de tuberías domiciliarias.', tarifa: '30' },
  { label: '⚡ Electricidad', cat: 'mantenimiento_hogar' as ServiceCategoryType, title: 'Electricista de confianza', desc: 'Revisión de tableros, cortocircuitos y tomacorrientes seguros.', tarifa: '35' },
  { label: '🩺 Cuidados / Inyectables', cat: 'salud_bienestar' as ServiceCategoryType, title: 'Inyectables y toma de presión', desc: 'Atención a adultos mayores y control médico a domicilio.', tarifa: '25' },
  { label: '🔑 Cerrajería Vecinal', cat: 'mantenimiento_hogar' as ServiceCategoryType, title: 'Cerrajería domiciliaria', desc: 'Apertura de puertas trabadas, copias de llaves y candados.', tarifa: '30' },
];

export const ServiciosScreen = () => {
  const { showToast, isCrisisRealActive, proximityRadius, isNetworkOnline } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryType>('todos');
  const [providers, setProviders] = useState<ServiceProvider[]>(MOCK_PROVIDERS);

  // Estados de WhatsApp contactado por proveedor
  const [contactedMap, setContactedMap] = useState<Record<string, boolean>>({});
  const [ratedMap, setRatedMap] = useState<Record<string, boolean>>({});
  const [newColegiatura, setNewColegiatura] = useState('');

  // Modal Recomendar con PIN
  const [recommendingProvider, setRecommendingProvider] = useState<ServiceProvider | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [thumbsRating, setThumbsRating] = useState<'up' | 'down' | null>(null);
  const [selectedComment, setSelectedComment] = useState('');

  // Modal Registrar Servicio
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarifa, setNewTarifa] = useState('');
  const [newTipo, setNewTipo] = useState<'oficio' | 'profesion'>('oficio');
  const [newDesc, setNewDesc] = useState('');

  // Sincronización inicial desde Supabase
  useEffect(() => {
    if (supabase) {
      supabase
        .from('oficios_locales')
        .select('*')
        .then(({ data }) => {
          if (data && data.length > 0) {
            const dbProviders: ServiceProvider[] = data.map((d: any) => ({
              id: d.id,
              name: d.rol_oficio || 'Vecino Especialista',
              experience: d.experiencia || 'Vecino del barrio',
              role: d.rol_oficio || 'Servicio Local',
              location: 'Sector 2 • Mz. B (Urb. Las Palmeras)',
              avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              recommendationsCount: d.recomendaciones || 5,
              specialtyDetails: d.descripcion || 'Servicio calificado en la urbanización.',
              category: d.categoria || 'mantenimiento_hogar',
              tipoActividad: d.tipo_actividad || 'oficio',
              colegiatura: d.colegiatura,
              verified: Boolean(d.verificado),
              servicePin: d.service_pin || '3150',
              phone: '955432109',
              reviews: [],
            }));

            setProviders((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              const unique = dbProviders.filter((dp) => !ids.has(dp.id));
              return [...unique, ...prev];
            });
          }
        });
    }
  }, []);

  const filteredProviders = useMemo(() => {
    return providers
      .filter((p) => {
        const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesQ =
          q === '' ||
          p.name.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.specialtyDetails.toLowerCase().includes(q);

        // Filtro por radios de proximidad (500m Sector 2, 2km Sector 1 y 2, 5km Todos)
        let matchesRadius = true;
        if (proximityRadius === 500) {
          matchesRadius = p.location.includes('Mz. B') || p.location.includes('Sauces');
        } else if (proximityRadius === 2000) {
          matchesRadius = !p.location.includes('Sector 3');
        }

        return matchesCat && matchesQ && matchesRadius;
      })
      .sort((a, b) => {
        // En crisis, priorizar servicios médicos y de rescate
        if (isCrisisRealActive) {
          const aCrit = a.category === 'salud_bienestar' ? 1 : 0;
          const bCrit = b.category === 'salud_bienestar' ? 1 : 0;
          if (bCrit !== aCrit) return bCrit - aCrit;
        }

        // Nivel 3: Profesionales de Confianza (15+ Vistos Buenos) primero
        const aTop = a.recommendationsCount >= 15 ? 1 : 0;
        const bTop = b.recommendationsCount >= 15 ? 1 : 0;
        if (bTop !== aTop) return bTop - aTop;
        return b.recommendationsCount - a.recommendationsCount;
      });
  }, [providers, searchQuery, selectedCategory, proximityRadius, isCrisisRealActive]);

  const handleOpenWhatsapp = (provider: ServiceProvider) => {
    const cleanPhone = provider.phone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=51${cleanPhone}&text=${encodeURIComponent(
      `Hola ${provider.name}, te contacto desde la app comunitaria sobre tu servicio de ${provider.role}.`
    )}`;
    Linking.openURL(url).catch(() => {
      showToast(`Abriendo chat con ${provider.name} (${provider.phone})`);
    });
    setContactedMap((prev) => ({ ...prev, [provider.id]: true }));
  };

  const handleVerifyPin = () => {
    if (!recommendingProvider) return;
    if (inputPin.trim() === (recommendingProvider.servicePin || '3150')) {
      setPinVerified(true);
      showToast('PIN validado correctamente. Ya puedes calificar.');
    } else {
      showToast('PIN incorrecto. Pídele su PIN de 4 dígitos al vecino.');
    }
  };

  const handleSubmitRecommendation = () => {
    if (!recommendingProvider) return;
    if (thumbsRating === null) {
      showToast('Selecciona si recomiendas o no el servicio.');
      return;
    }

    const delta = thumbsRating === 'up' ? 1 : -1;

    setProviders((prev) =>
      prev.map((p) =>
        p.id === recommendingProvider.id
          ? {
              ...p,
              recommendationsCount: Math.max(0, p.recommendationsCount + delta),
            }
          : p
      )
    );

    // Persistencia en Supabase
    if (isNetworkOnline && supabase && !recommendingProvider.id.startsWith('prov-')) {
      supabase
        .from('oficios_locales')
        .update({
          recomendaciones: Math.max(0, recommendingProvider.recommendationsCount + delta),
        })
        .eq('id', recommendingProvider.id)
        .then(() => {});

      supabase.from('resenas_servicios').insert({
        oficio_id: recommendingProvider.id,
        cliente_id: currentUser.id !== 'usr-1' ? currentUser.id : null,
        autor_nombre: currentUser.name,
        direccion_cliente: `${currentUser.calle} ${currentUser.numero}`,
        tipo_voto: thumbsRating === 'up' ? 'positivo' : 'negativo',
        estrellas: thumbsRating === 'up' ? 5 : 2,
        comentario: selectedComment || 'Servicio validado con PIN vecinal.',
      }).then(() => {});
    }

    setRatedMap((prev) => ({ ...prev, [recommendingProvider.id]: true }));
    setContactedMap((prev) => ({ ...prev, [recommendingProvider.id]: false }));

    showToast('¡Visto Bueno vecinal registrado con éxito (+1 punto de confianza)!');
    setRecommendingProvider(null);
    setInputPin('');
    setPinVerified(false);
    setThumbsRating(null);
    setSelectedComment('');
  };

  const applyPreset = (p: typeof SERVICE_PRESETS[0]) => {
    setNewTitle(p.title);
    setNewDesc(p.desc);
    setNewTarifa(p.tarifa);
    setSelectedCategory(p.cat);
    showToast(`Plantilla "${p.label}" cargada en 1 clic`);
  };

  const handleCreateService = () => {
    const tarifaNum = parseFloat(newTarifa) || 0;
    if (tarifaNum > 100) {
      showToast('⚠️ La tarifa propuesta supera el límite vecinal de S/. 100');
      return;
    }
    if (!newTitle.trim()) {
      showToast('Ingresa el nombre o especialidad del servicio');
      return;
    }
    if (newTipo === 'profesion' && !newColegiatura.trim()) {
      showToast('Para una Profesión acreditada debes indicar tu N° de Colegiatura');
      return;
    }

    const nuevoServicio: ServiceProvider = {
      id: `prov-${Date.now()}`,
      name: currentUser.name,
      experience: 'Vecino activo',
      role: newTitle.trim(),
      location: `${currentUser.calle} ${currentUser.numero} (${currentUser.sector})`,
      avatarUrl:
        currentUser.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      recommendationsCount: currentUser.vistosBuenos ?? 0,
      specialtyDetails: `${newDesc.trim() || newTitle.trim()} • Tarifa vecinal: S/. ${tarifaNum || 30}`,
      category: selectedCategory === 'todos' ? 'mantenimiento_hogar' : selectedCategory,
      tipoActividad: newTipo,
      colegiatura: newTipo === 'profesion' ? newColegiatura.trim() : undefined,
      verified: newTipo === 'profesion' || (currentUser.vistosBuenos ?? 0) >= 5,
      servicePin: currentUser.servicePin || '4826',
      reviews: [],
      phone: currentUser.phone,
    };

    setProviders((prev) => [nuevoServicio, ...prev]);

    // Persistencia en Supabase
    if (isNetworkOnline && supabase) {
      supabase.from('oficios_locales').insert({
        vecino_id: currentUser.id !== 'usr-1' ? currentUser.id : null,
        categoria: nuevoServicio.category,
        tipo_actividad: nuevoServicio.tipoActividad,
        rol_oficio: nuevoServicio.role,
        experiencia: nuevoServicio.experience,
        colegiatura: nuevoServicio.colegiatura,
        verificado: nuevoServicio.verified,
        descripcion: nuevoServicio.specialtyDetails,
        recomendaciones: nuevoServicio.recommendationsCount,
        service_pin: nuevoServicio.servicePin,
        ubicacion: 'SRID=4326;POINT(-77.0754 -11.8675)',
      }).then(() => {});
    }

    showToast(`✓ Servicio publicado en Supabase con tu PIN ${nuevoServicio.servicePin}`);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewTarifa('');
    setNewDesc('');
    setNewColegiatura('');
  };

  const categories = isCrisisRealActive ? CATEGORIES_CRISIS : CATEGORIES_NORMAL;

  return (
    <ScrollView 
      style={[styles.container, isCrisisRealActive && styles.containerCrisis]} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* EVOLUCIÓN EN CRISIS: BANNER DE BRIGADAS Y SOPORTE */}
      {isCrisisRealActive && (
        <View style={styles.crisisBannerCard}>
          <View style={styles.crisisBannerHeader}>
            <View style={styles.crisisPulse} />
            <Text style={styles.crisisBannerTitle}>BRIGADAS Y SOPORTE DE EMERGENCIA</Text>
          </View>
          <Text style={styles.crisisBannerSubtitle}>
            Vecinos y profesionales disponibles para emergencias críticas (Corte de llaves de agua, fallas eléctricas y primeros auxilios).
          </Text>
        </View>
      )}

      {/* Barra de Búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder={
            isCrisisRealActive
              ? "Buscar médico, gasfitero de emergencia, electricista..."
              : "Buscar gasfitero, electricista, enfermera..."
          }
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de Categorías */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesScrollContainer}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                isSelected && (isCrisisRealActive ? styles.categoryChipCrisisActive : styles.categoryChipActive),
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={isSelected ? '#ffffff' : '#475569'}
              />
              <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Banner Publicar Servicio */}
      <View style={[styles.publishBanner, isCrisisRealActive && styles.publishBannerCrisis]}>
        <View style={styles.publishBannerLeft}>
          <View style={[styles.publishIconBg, isCrisisRealActive && { backgroundColor: '#dc2626' }]}>
            <MaterialIcons
              name={isCrisisRealActive ? "emergency" : "handyman"}
              size={20}
              color="#ffffff"
            />
          </View>
          <View style={styles.publishBannerTextContainer}>
            <Text style={styles.publishBannerTitle}>
              {isCrisisRealActive ? '¿Puedes dar soporte en la emergencia?' : '¿Ofreces un servicio local?'}
            </Text>
            <Text style={styles.publishBannerSubtitle}>
              {isCrisisRealActive
                ? 'Regístrate como voluntario de brigada vecinal.'
                : 'Conéctate con tus vecinos y colabora en el barrio.'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.publishButton, isCrisisRealActive && { backgroundColor: '#dc2626' }]}
          onPress={() => setIsCreateModalOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={16} color="#ffffff" />
          <Text style={styles.publishButtonText}>
            {isCrisisRealActive ? '+ Sumarme a Brigada' : 'Publicar servicio (2 clics)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Encabezado Directorio con Indicador de Radio */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderTitleRow}>
          <MaterialCommunityIcons
            name={isCrisisRealActive ? "shield-plus" : "shield-check"}
            size={20}
            color={isCrisisRealActive ? "#dc2626" : "#2563eb"}
          />
          <Text style={styles.sectionHeaderTitle}>
            {isCrisisRealActive ? 'Brigadistas y Especialistas de Emergencia' : 'Vecinos de Confianza'}
          </Text>
        </View>
        <Text style={styles.sectionHeaderCount}>
          {filteredProviders.length} en radio {proximityRadius}m
        </Text>
      </View>

      {/* Directorio de Proveedores */}
      {filteredProviders.map((provider) => {
        const isProfesion = provider.tipoActividad === 'profesion';
        const showBlueCheck = isProfesion || provider.recommendationsCount >= 5;
        const isTopTrust = provider.recommendationsCount >= 15;
        const isMidTrust = provider.recommendationsCount >= 5 && provider.recommendationsCount < 15;
        const hasContacted = contactedMap[provider.id];

        return (
          <View key={provider.id} style={[styles.providerCard, isCrisisRealActive && styles.providerCardCrisis]}>
            <View style={styles.providerHeader}>
              <View style={styles.providerHeaderLeft}>
                <Image source={{ uri: provider.avatarUrl }} style={styles.providerAvatar} />
                <View style={styles.providerInfo}>
                  <View style={styles.providerNameRow}>
                    <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
                    {showBlueCheck && (
                      <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
                    )}
                  </View>
                  <Text style={styles.providerRole} numberOfLines={1}>{provider.role}</Text>
                  <Text style={styles.providerLocation} numberOfLines={1}>📍 {provider.location}</Text>
                </View>
              </View>
              <View style={styles.expBadge}>
                <Text style={styles.expBadgeText}>{provider.experience}</Text>
              </View>
            </View>

            {/* Visto bueno según Niveles de Confianza */}
            <View style={styles.vistoBuenoRow}>
              <View
                style={[
                  styles.vistoBuenoBadge,
                  isTopTrust && { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
                  !isTopTrust && !isMidTrust && { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
                ]}
              >
                <Ionicons
                  name={isTopTrust ? 'shield-checkmark' : 'thumbs-up'}
                  size={13}
                  color={isTopTrust ? '#15803d' : isMidTrust ? '#2563eb' : '#64748b'}
                />
                <Text
                  style={[
                    styles.vistoBuenoText,
                    isTopTrust && { color: '#15803d' },
                    !isTopTrust && !isMidTrust && { color: '#475569' },
                  ]}
                >
                  {isTopTrust
                    ? `Confianza Ganada (${provider.recommendationsCount} Vistos Buenos)`
                    : isMidTrust
                    ? `Vecino Confiable (${provider.recommendationsCount} Vistos Buenos)`
                    : `Vecino Nuevo (${provider.recommendationsCount} Vistos Buenos)`}
                </Text>
              </View>
            </View>

            {/* Detalles del Servicio */}
            <View style={styles.specialtyBox}>
              <Text style={styles.specialtyTitle}>DETALLES DEL SERVICIO EN LA URBANIZACIÓN</Text>
              <Text style={styles.specialtyText}>{provider.specialtyDetails}</Text>
            </View>

            {/* Botón WhatsApp -> Ingresar PIN -> Servicio Calificado */}
            <View style={styles.actionContainer}>
              {ratedMap[provider.id] && !hasContacted ? (
                <View style={styles.contactedContainer}>
                  <View style={styles.ratedSuccessBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    <Text style={styles.ratedSuccessText}>
                      ✓ Servicio calificado con PIN de 4 dígitos
                    </Text>
                  </View>
                </View>
              ) : hasContacted ? (
                <View style={styles.contactedContainer}>
                  <View style={styles.contactedButtonsRow}>
                    <TouchableOpacity
                      style={styles.btnWhatsappSmall}
                      onPress={() => handleOpenWhatsapp(provider)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                      <Text style={styles.btnWhatsappText}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnPinAction}
                      onPress={() => {
                        setRecommendingProvider(provider);
                        setInputPin('');
                        setPinVerified(false);
                      }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="key" size={15} color="#ffffff" />
                      <Text style={styles.btnPinText}>Ingresar PIN y Calificar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.btnWhatsappPrimary, isCrisisRealActive && { backgroundColor: '#dc2626' }]}
                  onPress={() => handleOpenWhatsapp(provider)}
                  activeOpacity={0.85}
                >
                  <Ionicons name={isCrisisRealActive ? "call" : "logo-whatsapp"} size={17} color="#ffffff" />
                  <Text style={styles.btnWhatsappPrimaryText}>
                    {isCrisisRealActive ? 'Solicitar Soporte de Emergencia' : 'Contactar por WhatsApp'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      {/* Modal Recomendar con PIN de 4 Dígitos */}
      <Modal visible={recommendingProvider !== null} animationType="fade" transparent>
        <View style={styles.pinModalOverlay}>
          <View style={styles.pinModalCard}>
            <View style={styles.pinModalHeader}>
              <Text style={styles.pinModalTitle}>Validación con PIN de 4 Dígitos</Text>
              <TouchableOpacity onPress={() => setRecommendingProvider(null)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.pinModalDesc}>
              Para evitar recomendaciones falsas, solicita a{' '}
              <Text style={{ fontWeight: '800' }}>{recommendingProvider?.name}</Text> su PIN de servicios:
            </Text>

            {!pinVerified ? (
              <View style={styles.pinInputContainer}>
                <TextInput
                  style={styles.pinInput}
                  placeholder="Ej: 3150"
                  placeholderTextColor="#94a3b8"
                  value={inputPin}
                  onChangeText={setInputPin}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <TouchableOpacity style={styles.verifyPinBtn} onPress={handleVerifyPin}>
                  <Text style={styles.verifyPinBtnText}>Validar PIN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.ratingSection}>
                <View style={styles.pinVerifiedBanner}>
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text style={styles.pinVerifiedText}>PIN validado con éxito</Text>
                </View>

                <Text style={styles.ratingTitle}>¿Recomiendas este servicio a tus vecinos?</Text>
                <View style={styles.thumbsRow}>
                  <TouchableOpacity
                    style={[styles.thumbBtn, thumbsRating === 'up' && styles.thumbBtnUp]}
                    onPress={() => setThumbsRating('up')}
                  >
                    <Ionicons name="thumbs-up" size={22} color={thumbsRating === 'up' ? '#ffffff' : '#15803d'} />
                    <Text style={[styles.thumbBtnText, thumbsRating === 'up' && { color: '#ffffff' }]}>Recomiendo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.thumbBtn, thumbsRating === 'down' && styles.thumbBtnDown]}
                    onPress={() => setThumbsRating('down')}
                  >
                    <Ionicons name="thumbs-down" size={22} color={thumbsRating === 'down' ? '#ffffff' : '#dc2626'} />
                    <Text style={[styles.thumbBtnText, thumbsRating === 'down' && { color: '#ffffff' }]}>No Recomiendo</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitRatingBtn} onPress={handleSubmitRecommendation}>
                  <Text style={styles.submitRatingBtnText}>Guardar Calificación</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Registrar Servicio con Plantillas Rápidas (2 Clics) */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.pinModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.createModalCard}>
            <View style={styles.pinModalHeader}>
              <Text style={styles.pinModalTitle}>
                {isCrisisRealActive ? 'Registrar Brigada de Emergencia' : 'Publicar mi Servicio'}
              </Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Plantillas Rápidas (1 Clic) */}
              <Text style={styles.presetSectionLabel}>⚡ Plantillas Rápidas (1 toque):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {SERVICE_PRESETS.map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => applyPreset(p)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.presetChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Especialidad u oficio *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej: Plomero, Electricista, Enfermera..."
                  placeholderTextColor="#94a3b8"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tarifa referencial (Máx. S/. 100)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej: 30"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={newTarifa}
                  onChangeText={setNewTarifa}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Detalles de atención vecinal</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Explica qué problemas solucionas en la urbanización..."
                  placeholderTextColor="#94a3b8"
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateService} activeOpacity={0.85}>
                <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                <Text style={styles.modalSubmitText}>Publicar Servicio en Supabase (2 clics)</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerCrisis: {
    backgroundColor: '#fef2f2',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  crisisBannerCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    padding: 14,
    marginBottom: 14,
  },
  crisisBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  crisisPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  crisisBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#991b1b',
    letterSpacing: 0.5,
  },
  crisisBannerSubtitle: {
    fontSize: 11,
    color: '#7f1d1d',
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  categoriesScroll: {
    marginBottom: 14,
  },
  categoriesScrollContainer: {
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  categoryChipCrisisActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  publishBanner: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  publishBannerCrisis: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  publishBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  publishIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBannerTextContainer: {
    flex: 1,
  },
  publishBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  publishBannerSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  publishButton: {
    backgroundColor: '#1d4ed8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  publishButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionHeaderCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  providerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  providerCardCrisis: {
    borderColor: '#fca5a5',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  providerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  providerRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    marginTop: 1,
  },
  providerLocation: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  expBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  expBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  vistoBuenoRow: {
    marginBottom: 10,
  },
  vistoBuenoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  vistoBuenoText: {
    fontSize: 11,
    fontWeight: '800',
  },
  specialtyBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  specialtyTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: 2,
  },
  contactedContainer: {
    gap: 8,
  },
  ratedSuccessBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ratedSuccessText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 11.5,
  },
  contactedButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnWhatsappSmall: {
    flex: 1,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnWhatsappText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  btnPinAction: {
    flex: 1.5,
    backgroundColor: '#1d4ed8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnPinText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  btnWhatsappPrimary: {
    backgroundColor: '#1d4ed8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  btnWhatsappPrimaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  pinModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
  },
  pinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  pinModalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  pinModalDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 14,
  },
  pinInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pinInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
    color: '#0f172a',
  },
  verifyPinBtn: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyPinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  ratingSection: {
    gap: 12,
  },
  pinVerifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
  },
  pinVerifiedText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  thumbsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  thumbBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 4,
  },
  thumbBtnUp: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  thumbBtnDown: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  thumbBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  submitRatingBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitRatingBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  createModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    maxHeight: '85%',
  },
  presetSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 6,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  modalTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    backgroundColor: '#1d4ed8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
