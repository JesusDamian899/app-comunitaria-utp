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
import type { ServiceProvider, ServiceCategoryType, TipoActividadServicio, ServiceReview } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../components/AuthGuard';
import { supabase } from '../lib/supabaseClient';
import { 
  saveLocalServiceToSQLite, 
  getLocalServicesFromSQLite, 
  updateServiceInSQLite 
} from '../lib/sqliteDatabase';

const CATEGORIES: { id: ServiceCategoryType; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: 'apps' },
  { id: 'alimentacion', label: 'Alimentación', icon: 'restaurant' },
  { id: 'mantenimiento_hogar', label: 'Mantenimiento y Hogar', icon: 'build' },
  { id: 'salud_bienestar', label: 'Salud y Bienestar', icon: 'medkit' },
  { id: 'compras_bazar', label: 'Compras y Bazar', icon: 'cart' },
  { id: 'servicios_tramites', label: 'Servicios y trámites', icon: 'document-text' },
  { id: 'vehiculos_mascotas', label: 'Vehículos y Mascotas', icon: 'paw' },
  { id: 'otros', label: 'Otros', icon: 'sparkles' },
];

export const ServiciosScreen = () => {
  const { showToast } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryType>('todos');
  const [providers, setProviders] = useState<ServiceProvider[]>(MOCK_PROVIDERS);

  // Sincronización híbrida: SQLite local (comunidad.db) + Supabase remoto
  useEffect(() => {
    let isMounted = true;
    const loadOficios = async () => {
      // 1. Cargar inmediatamente los servicios persistidos en SQLite local
      let localSaved: ServiceProvider[] = [];
      try {
        localSaved = await getLocalServicesFromSQLite();
        if (localSaved.length > 0 && isMounted) {
          setProviders((prev) => {
            const ids = new Set(localSaved.map((s) => s.id));
            return [...localSaved, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      } catch (e) {
        console.warn('Error leyendo servicios desde SQLite:', e);
      }

      // 2. Consultar servicios remotos en Supabase
      if (!supabase) return;
      try {
        let data: any[] | null = null;
        // Intento 1: con relación a perfiles
        const res1 = await supabase
          .from('oficios_locales')
          .select('*, perfiles(*), resenas_servicios(*)')
          .order('creado_en', { ascending: false });

        if (!res1.error && res1.data) {
          data = res1.data;
        } else {
          // Intento 2: consulta directa sin forzar join
          const res2 = await supabase
            .from('oficios_locales')
            .select('*, resenas_servicios(*)')
            .order('creado_en', { ascending: false });
          if (!res2.error && res2.data) {
            data = res2.data;
          }
        }

        if (data && data.length > 0 && isMounted) {
          const remoteProviders: ServiceProvider[] = data.map((item: any) => {
            const perfil = item.perfiles || {};
            const resenas: ServiceReview[] = (item.resenas_servicios || []).map((r: any) => ({
              id: r.id,
              author: r.autor_nombre || 'Vecino',
              unit: r.direccion_cliente || 'Calle Los Sauces',
              comment: r.comentario || '',
              rating: r.estrellas || 5,
            }));

            return {
              id: item.id,
              name: perfil.nombre || item.rol_oficio || 'Vecino Emprendedor',
              experience: item.experiencia || 'Vecino activo',
              role: item.rol_oficio || 'Servicio vecinal',
              location: perfil.calle ? `${perfil.calle} ${perfil.numero || ''} (${perfil.sector || 'Sector 2'})` : 'Urb. Las Palmeras',
              avatarUrl:
                perfil.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.nombre || item.rol_oficio || 'V')}&background=0284c7&color=fff&bold=true`,
              recommendationsCount: item.recomendaciones ?? (perfil.vistos_buenos || 0),
              specialtyDetails: item.descripcion || item.rol_oficio || '',
              category: (item.categoria as ServiceCategoryType) || 'mantenimiento_hogar',
              tipoActividad: (item.tipo_actividad as TipoActividadServicio) || 'oficio',
              colegiatura: item.colegiatura || undefined,
              verified: !!item.verificado,
              servicePin: item.service_pin || perfil.service_pin || '4826',
              reviews: resenas,
              phone: perfil.telefono || '999 888 777',
            };
          });

          setProviders((prev) => {
            const combined = [...remoteProviders, ...localSaved];
            const seenIds = new Set(combined.map((p) => p.id));
            const mockFiltered = MOCK_PROVIDERS.filter((p) => !seenIds.has(p.id));
            return [...combined, ...mockFiltered];
          });
        }
      } catch (err) {
        console.warn('Error leyendo oficios desde Supabase:', err);
      }
    };

    loadOficios();
    return () => {
      isMounted = false;
    };
  }, []);

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
  const [newCategory, setNewCategory] = useState<ServiceCategoryType>('mantenimiento_hogar');
  const [newDesc, setNewDesc] = useState('');

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
        return matchesCat && matchesQ;
      })
      .sort((a, b) => {
        // Nivel 3: Profesionales de Confianza (15+ Vistos Buenos) aparecen primero en el directorio
        const aTop = a.recommendationsCount >= 15 ? 1 : 0;
        const bTop = b.recommendationsCount >= 15 ? 1 : 0;
        if (bTop !== aTop) return bTop - aTop;
        return b.recommendationsCount - a.recommendationsCount;
      });
  }, [providers, searchQuery, selectedCategory]);

  const handleOpenWhatsapp = (provider: ServiceProvider) => {
    const cleanPhone = provider.phone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=51${cleanPhone}&text=${encodeURIComponent(
      `Hola ${provider.name}, te contacto desde la app de vecinos de la urbanización sobre tu servicio de ${provider.role}.`
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
    const nextRecomms =
      thumbsRating === 'up'
        ? recommendingProvider.recommendationsCount + 1
        : Math.max(0, recommendingProvider.recommendationsCount - 1);

    const newReview: ServiceReview = {
      id: `rev-${Date.now()}`,
      author: currentUser.name,
      unit: `${currentUser.calle} ${currentUser.numero}`,
      comment: selectedComment || (thumbsRating === 'up' ? 'Servicio recomendado' : 'Servicio observado'),
      rating: thumbsRating === 'up' ? 5 : 2,
    };

    setProviders((prev) =>
      prev.map((p) =>
        p.id === recommendingProvider.id
          ? {
              ...p,
              recommendationsCount: nextRecomms,
              reviews: [newReview, ...(p.reviews || [])],
            }
          : p
      )
    );
    // Marcamos este servicio como ya calificado y cerramos el ciclo de contacto
    setRatedMap((prev) => ({ ...prev, [recommendingProvider.id]: true }));
    setContactedMap((prev) => ({ ...prev, [recommendingProvider.id]: false }));

    // Persistir recomendación y reseña en SQLite local
    updateServiceInSQLite(recommendingProvider.id, nextRecomms, newReview);

    // Si es un ID de Supabase, actualizamos la base de datos remota
    const isProvUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recommendingProvider.id);
    const isUserUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);

    if (supabase && isProvUuid) {
      (async () => {
        try {
          await supabase
            .from('oficios_locales')
            .update({ recomendaciones: nextRecomms })
            .eq('id', recommendingProvider.id);

          await supabase
            .from('resenas_servicios')
            .insert({
              oficio_id: recommendingProvider.id,
              cliente_id: isUserUuid ? currentUser.id : null,
              autor_nombre: currentUser.name,
              direccion_cliente: `${currentUser.calle} ${currentUser.numero}`,
              tipo_voto: thumbsRating === 'up' ? 'positivo' : 'negativo',
              estrellas: thumbsRating === 'up' ? 5 : 2,
              comentario: selectedComment || (thumbsRating === 'up' ? 'Servicio recomendado' : 'Servicio observado'),
            });
        } catch (e) {
          console.warn('Aviso: no se pudo sincronizar reseña en Supabase:', e);
        }
      })();
    }

    showToast('¡Calificación vecinal registrada con éxito!');
    setRecommendingProvider(null);
    setInputPin('');
    setPinVerified(false);
    setThumbsRating(null);
    setSelectedComment('');
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

    // Agregamos el servicio al directorio con los datos y el PIN real del usuario logueado
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
      category: newCategory,
      tipoActividad: newTipo,
      colegiatura: newTipo === 'profesion' ? newColegiatura.trim() : undefined,
      verified: newTipo === 'profesion' || (currentUser.vistosBuenos ?? 0) >= 5,
      servicePin: currentUser.servicePin || '4826',
      reviews: [],
      phone: currentUser.phone,
    };

    setProviders((prev) => [nuevoServicio, ...prev]);
    showToast(`✓ Servicio publicado con tu PIN ${nuevoServicio.servicePin}`);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewTarifa('');
    setNewDesc('');
    setNewColegiatura('');

    // 1. Guardar en SQLite local permanente (comunidad.db)
    saveLocalServiceToSQLite(nuevoServicio);

    // 2. Si el usuario está registrado en Supabase, lo guardamos en la nube
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
    if (supabase && isUuid) {
      (async () => {
        try {
          // Asegurar primero que el usuario exista en public.perfiles para evitar error de Foreign Key
          await supabase.from('perfiles').upsert(
            {
              id: currentUser.id,
              nombre: currentUser.name,
              telefono: currentUser.phone,
              rol: currentUser.role,
              urbanizacion: currentUser.urbanizacion,
              sector: currentUser.sector,
              calle: currentUser.calle,
              numero: currentUser.numero,
              service_pin: currentUser.servicePin,
              ubicacion: 'POINT(-77.0754 -11.8675)',
            },
            { onConflict: 'id' }
          );

          // Insertar en oficios_locales con coordenadas en formato Point estándar
          const { error } = await supabase.from('oficios_locales').insert({
            vecino_id: currentUser.id,
            categoria: nuevoServicio.category,
            tipo_actividad: nuevoServicio.tipoActividad,
            rol_oficio: nuevoServicio.role,
            experiencia: nuevoServicio.experience,
            colegiatura: nuevoServicio.colegiatura || null,
            verificado: nuevoServicio.verified,
            descripcion: nuevoServicio.specialtyDetails,
            recomendaciones: nuevoServicio.recommendationsCount,
            service_pin: nuevoServicio.servicePin,
            ubicacion: 'POINT(-77.0754 -11.8675)',
          });

          if (error) {
            console.warn('Aviso al guardar en Supabase oficios_locales:', error.message);
          }
        } catch (err) {
          console.warn('Error al guardar oficio en Supabase:', err);
        }
      })();
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Barra de Búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar gasfitero, electricista, enfermera..."
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
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
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
      <View style={styles.publishBanner}>
        <View style={styles.publishBannerLeft}>
          <View style={styles.publishIconBg}>
            <MaterialIcons name="handyman" size={20} color="#1d4ed8" />
          </View>
          <View style={styles.publishBannerTextContainer}>
            <Text style={styles.publishBannerTitle}>¿Ofreces un servicio local?</Text>
            <Text style={styles.publishBannerSubtitle}>Conéctate con tus vecinos y colabora en el barrio.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={() => setIsCreateModalOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={16} color="#ffffff" />
          <Text style={styles.publishButtonText}>Publicar servicio</Text>
        </TouchableOpacity>
      </View>

      {/* Encabezado Directorio */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderTitleRow}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#2563eb" />
          <Text style={styles.sectionHeaderTitle}>Vecinos de Confianza</Text>
        </View>
        <Text style={styles.sectionHeaderCount}>{filteredProviders.length} activos</Text>
      </View>

      {/* Directorio de Proveedores */}
      {filteredProviders.map((provider) => {
        const isProfesion = provider.tipoActividad === 'profesion';
        const showBlueCheck = isProfesion || provider.recommendationsCount >= 5;
        const isTopTrust = provider.recommendationsCount >= 15;
        const isMidTrust = provider.recommendationsCount >= 5 && provider.recommendationsCount < 15;
        const hasContacted = contactedMap[provider.id];
        const firstName = provider.name.split(' ')[0] || provider.name;

        return (
          <View key={provider.id} style={styles.providerCard}>
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

            {/* Visto bueno según Niveles de Confianza (Nivel 1: 0-4, Nivel 2: 5-14, Nivel 3: 15+) */}
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
                  <View
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderWidth: 1,
                      borderColor: '#bbf7d0',
                      borderRadius: 12,
                      paddingVertical: 11,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    <Text style={{ color: '#15803d', fontWeight: '800', fontSize: 12 }}>
                      ✓ Servicio Validado y Calificado
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleOpenWhatsapp(provider)}
                    style={styles.recontactLink}
                  >
                    <Text style={styles.recontactLinkText}>
                      ¿Solicitar un nuevo servicio por WhatsApp a {firstName}?
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : !hasContacted ? (
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => handleOpenWhatsapp(provider)}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="whatsapp" size={18} color="#ffffff" />
                  <Text style={styles.whatsappButtonText}>Chat WhatsApp con {firstName}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.contactedContainer}>
                  <TouchableOpacity
                    style={styles.recommendPinButton}
                    onPress={() => {
                      setRecommendingProvider(provider);
                      setInputPin('');
                      setPinVerified(false);
                      setThumbsRating(null);
                      setSelectedComment('');
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="key" size={16} color="#854d0e" />
                    <Text style={styles.recommendPinButtonText}>
                      ¿Recomiendas el servicio? (Ingresar PIN)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleOpenWhatsapp(provider)}
                    style={styles.recontactLink}
                  >
                    <Text style={styles.recontactLinkText}>
                      ¿Escribir nuevamente por WhatsApp a {firstName}?
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Modal Recomendar con PIN */}
      <Modal visible={!!recommendingProvider} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                Recomendar a {recommendingProvider?.name}
              </Text>
              <TouchableOpacity onPress={() => setRecommendingProvider(null)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {!pinVerified ? (
              <View style={styles.modalBody}>
                <Text style={styles.pinInstructions}>
                  Ingresa el PIN de 4 dígitos que el vecino te compartió para validar el trabajo realizado:
                </Text>
                <TextInput
                  style={styles.pinInput}
                  placeholder={`Ej: ${recommendingProvider?.servicePin || '3150'}`}
                  keyboardType="numeric"
                  maxLength={4}
                  value={inputPin}
                  onChangeText={setInputPin}
                  autoFocus
                />
                <TouchableOpacity style={styles.verifyPinButton} onPress={handleVerifyPin} activeOpacity={0.85}>
                  <Text style={styles.verifyPinButtonText}>Validar PIN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Text style={styles.pinInstructions}>
                  ¿Cómo calificarías el servicio prestado?
                </Text>
                <View style={styles.thumbsRow}>
                  <TouchableOpacity
                    style={[styles.thumbButton, thumbsRating === 'up' && styles.thumbButtonActiveGreen]}
                    onPress={() => setThumbsRating('up')}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="thumbs-up" size={22} color={thumbsRating === 'up' ? '#166534' : '#16a34a'} />
                    <Text style={[styles.thumbText, thumbsRating === 'up' && styles.thumbTextGreen]}>Recomiendo 👍</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.thumbButton, thumbsRating === 'down' && styles.thumbButtonActiveRed]}
                    onPress={() => setThumbsRating('down')}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="thumbs-down" size={22} color={thumbsRating === 'down' ? '#991b1b' : '#dc2626'} />
                    <Text style={[styles.thumbText, thumbsRating === 'down' && styles.thumbTextRed]}>No recomiendo 👎</Text>
                  </TouchableOpacity>
                </View>

                {/* Comentarios predeterminados */}
                {thumbsRating === 'up' && (
                  <View style={styles.presetCommentsBox}>
                    {['Puntual y muy ordenado', 'Solucionó el problema rápido', 'Tarifa justa y buen trato'].map((c, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.presetChip, selectedComment === c && styles.presetChipActive]}
                        onPress={() => setSelectedComment(c)}
                      >
                        <Text style={[styles.presetChipText, selectedComment === c && styles.presetChipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {thumbsRating === 'down' && (
                  <View style={styles.presetCommentsBox}>
                    {['Llegó tarde a la cita', 'El trabajo no quedó solucionado', 'Cobró más de lo acordado'].map((c, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.presetChip, selectedComment === c && styles.presetChipActive]}
                        onPress={() => setSelectedComment(c)}
                      >
                        <Text style={[styles.presetChipText, selectedComment === c && styles.presetChipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.submitVoteButton} onPress={handleSubmitRecommendation} activeOpacity={0.85}>
                  <Text style={styles.submitVoteButtonText}>Enviar Calificación Vecinal</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Registrar Servicio */}
      <Modal visible={isCreateModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar mi Servicio Vecinal</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>1. Tipo de Actividad</Text>
              <View style={styles.tipoRow}>
                <TouchableOpacity
                  style={[styles.tipoButton, newTipo === 'oficio' && styles.tipoButtonActive]}
                  onPress={() => setNewTipo('oficio')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tipoButtonText, newTipo === 'oficio' && styles.tipoButtonTextActive]}>
                    Oficio (Por Vistos Buenos)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tipoButton, newTipo === 'profesion' && styles.tipoButtonActive]}
                  onPress={() => setNewTipo('profesion')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tipoButtonText, newTipo === 'profesion' && styles.tipoButtonTextActive]}>
                    Profesión (Acreditada)
                  </Text>
                </TouchableOpacity>
              </View>

              {newTipo === 'profesion' && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.inputLabel}>N° de Colegiatura Profesional *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: CEP #48291, CIP #102938, CAL #71204"
                    placeholderTextColor="#94a3b8"
                    value={newColegiatura}
                    onChangeText={setNewColegiatura}
                  />
                </View>
              )}

              <Text style={styles.inputLabel}>2. Categoría del Servicio</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {CATEGORIES.filter((c) => c.id !== 'todos').map((cat) => {
                  const isCatSelected = newCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        isCatSelected && styles.categoryChipActive,
                        { marginRight: 8 },
                      ]}
                      onPress={() => setNewCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isCatSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.inputLabel}>3. Especialidad o Título</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Electricista domiciliario, Cuidado geriátrico..."
                placeholderTextColor="#94a3b8"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>4. Tarifa Vecinal (Máx: S/. 100)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: 45"
                keyboardType="numeric"
                value={newTarifa}
                onChangeText={setNewTarifa}
              />

              <Text style={styles.inputLabel}>5. Detalles y Cobertura</Text>
              <TextInput
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                multiline
                placeholder="Describe tu disponibilidad, herramientas y experiencia en la urbanización..."
                placeholderTextColor="#94a3b8"
                value={newDesc}
                onChangeText={setNewDesc}
              />

              <View style={styles.adminReviewNotice}>
                <Text style={styles.adminReviewNoticeText}>
                  ℹ️ Al publicar, el aviso pasará a revisión con el mensaje "Esperando aprobación de administrador".
                </Text>
              </View>

              <TouchableOpacity style={styles.createServiceButton} onPress={handleCreateService} activeOpacity={0.85}>
                <Text style={styles.createServiceButtonText}>Publicar para Revisión</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    padding: 0,
  },
  categoriesScroll: {
    marginBottom: 14,
    marginHorizontal: -16,
  },
  categoriesScrollContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
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
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    padding: 14,
    marginBottom: 16,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  publishBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  publishIconBg: {
    backgroundColor: '#dbeafe',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBannerTextContainer: {
    flex: 1,
  },
  publishBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1e3a8a',
  },
  publishBannerSubtitle: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 1,
    lineHeight: 15,
  },
  publishButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  publishButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    color: '#64748b',
    fontWeight: '700',
  },
  providerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  providerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  providerRole: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '800',
    marginTop: 1,
  },
  providerLocation: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
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
    flexDirection: 'row',
    marginBottom: 10,
  },
  vistoBuenoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  vistoBuenoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  specialtyBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  specialtyTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  specialtyText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: 2,
  },
  whatsappButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whatsappButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  contactedContainer: {
    gap: 6,
  },
  recommendPinButton: {
    backgroundColor: '#fef08a',
    borderWidth: 1.5,
    borderColor: '#facc15',
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  recommendPinButtonText: {
    color: '#854d0e',
    fontSize: 12,
    fontWeight: '900',
  },
  recontactLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  recontactLinkText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalCardLarge: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
  },
  modalBody: {
    gap: 12,
  },
  modalBodyScroll: {
    maxHeight: 460,
  },
  pinInstructions: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  pinInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 6,
    color: '#0f172a',
  },
  verifyPinButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  verifyPinButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  thumbsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 6,
  },
  thumbButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  thumbButtonActiveGreen: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  thumbButtonActiveRed: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  thumbText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  thumbTextGreen: {
    color: '#166534',
  },
  thumbTextRed: {
    color: '#991b1b',
  },
  presetCommentsBox: {
    gap: 6,
    marginVertical: 4,
  },
  presetChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  presetChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  presetChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  submitVoteButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitVoteButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tipoButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  tipoButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  tipoButtonTextActive: {
    color: '#1d4ed8',
    fontWeight: '900',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  adminReviewNotice: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  adminReviewNoticeText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 15,
  },
  createServiceButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  createServiceButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
