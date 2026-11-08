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
  Platform,
  Alert
} from 'react-native';
import { 
  Ionicons, 
  FontAwesome5, 
  MaterialCommunityIcons, 
  MaterialIcons 
} from '@expo/vector-icons';
import { MOCK_FAVORES } from '../mock/data';
import type { SolidaridadFavor, SolidaridadCategory, SolidaridadEstado } from '../types';
import { CommunityBadge } from '../components/CommunityBadge';
import { useApp } from '../context/AppContext';
import { useAuth, getCommunityStatusLevel } from '../components/AuthGuard';
import { supabase } from '../lib/supabaseClient';
import { useOfflineSync } from '../hooks/useOfflineSync';
import {
  saveLocalFavorToSQLite,
  getLocalFavoresFromSQLite,
  updateFavorStatusInSQLite,
  updateLocalFavorDetailsInSQLite,
  deleteFavorFromSQLite,
  getDeletedRecordIdsFromSQLite,
} from '../lib/sqliteDatabase';

export type SolidaridadFilterType = 'todos' | SolidaridadCategory | 'emergencia';

const CATEGORIES_NORMAL: { id: SolidaridadFilterType; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: 'apps' },
  { id: 'prestamo', label: 'Préstamo', icon: 'build' },
  { id: 'donacion', label: 'Donación', icon: 'gift' },
  { id: 'acompanamiento', label: 'Acompañamiento', icon: 'people' },
  { id: 'intercambio_habilidades', label: 'Intercambio habilidades', icon: 'sparkles' },
];

const CATEGORIES_CRISIS: { id: SolidaridadFilterType; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos Críticos', icon: 'warning' },
  { id: 'donacion', label: 'Agua y Alimentos', icon: 'water' },
  { id: 'acompanamiento', label: 'Primeros Auxilios', icon: 'medkit' },
  { id: 'prestamo', label: 'Herramientas / Refugio', icon: 'shield-checkmark' },
  { id: 'intercambio_habilidades', label: 'Rescate / Voluntariado', icon: 'people' },
];

const PRESETS_NORMAL = [
  { label: '🔨 Prestar Escalera', cat: 'prestamo' as SolidaridadCategory, title: 'Escalera de aluminio 6 peldaños', desc: 'Escalera tijera marca Cuprum (1.80m). Ideal para cambiar luminarias o techos. Se entrega en mano.' },
  { label: '📚 Donar Libros', cat: 'donacion' as SolidaridadCategory, title: 'Caja con 15 libros escolares', desc: 'Libros de primaria y secundaria en excelente estado para escolares de la urbanización.' },
  { label: '🚗 Movilidad / Botica', cat: 'acompanamiento' as SolidaridadCategory, title: 'Acompañamiento a botica / centro de salud', desc: 'Apoyo para vecinos adultos mayores que requieran transporte corto o comprar medicinas.' },
  { label: '🌱 Cuidado Plantas', cat: 'intercambio_habilidades' as SolidaridadCategory, title: 'Intercambio: Jardinería por asesoría digital', desc: 'Enseño técnicas de propagación de suculentas a cambio de ayuda con banca móvil.' },
];

const PRESETS_CRISIS = [
  { label: '💧 20L Agua Potable', cat: 'donacion' as SolidaridadCategory, title: 'Bidón de 20L de agua purificada disponible', desc: 'Punto de abastecimiento solidario para familias con corte de agua en Sector 2.' },
  { label: '🩹 Donar Botiquín', cat: 'donacion' as SolidaridadCategory, title: 'Botiquín de trauma y gasas estériles', desc: 'Vendas, alcohol, gasas y analgésicos disponibles en Calle Los Sauces 310.' },
  { label: '⚡ Carga Celular / Luz', cat: 'prestamo' as SolidaridadCategory, title: 'Punto de energía y carga móvil con panel solar', desc: 'Punto de recarga de celulares para vecinos sin energía eléctrica en su manzana.' },
  { label: '🏠 Refugio Temporal', cat: 'acompanamiento' as SolidaridadCategory, title: 'Espacio seguro y frazadas para 1 familia', desc: 'Ambiente disponible en planta baja para vecinos afectados por contingencia.' },
];

export const SolidaridadScreen = () => {
  const { showToast, isCrisisRealActive, proximityRadius, isNetworkOnline, addCustomFavor } = useApp();
  const { currentUser, addFavorCompleted } = useAuth();
  const { saveToOfflineQueue } = useOfflineSync();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SolidaridadFilterType>('todos');
  const [favores, setFavores] = useState<SolidaridadFavor[]>(MOCK_FAVORES);

  // Estados de WhatsApp contactado por favor
  const [contactedMap, setContactedMap] = useState<Record<string, boolean>>({});

  // Modal Crear Favor
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<SolidaridadCategory>('prestamo');

  // Modal Editar Favor (CRUD)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFavor, setEditingFavor] = useState<SolidaridadFavor | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<SolidaridadCategory>('prestamo');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEstado, setEditEstado] = useState<SolidaridadEstado>('disponible');

  // Sincronización híbrida: SQLite local + Supabase con antirresurrección de borrados
  useEffect(() => {
    let isMounted = true;
    const loadFavores = async () => {
      const deletedIds = await getDeletedRecordIdsFromSQLite();

      // 1. Carga offline desde SQLite
      try {
        const localSaved = (await getLocalFavoresFromSQLite()).filter((s) => !deletedIds.has(s.id));
        if (localSaved && localSaved.length > 0 && isMounted) {
          setFavores((prev) => {
            const rawList = [...localSaved, ...prev];
            const unique: SolidaridadFavor[] = [];
            const seenIds = new Set<string>();
            const seenContent = new Set<string>();
            for (const item of rawList) {
              if (!item || !item.id || deletedIds.has(item.id)) continue;
              const contentKey = `${item.title.toLowerCase().trim()}_${item.ownerName.toLowerCase().trim()}_${item.categoria}`;
              if (!seenIds.has(item.id) && !seenContent.has(contentKey)) {
                seenIds.add(item.id);
                seenContent.add(contentKey);
                unique.push(item);
              }
            }
            return unique;
          });
        }
      } catch (e) {
        console.warn('Error leyendo favores de SQLite:', e);
      }

      // 2. Consulta remota en Supabase
      if (supabase) {
        try {
          const { data } = await supabase.from('muro_solidario').select('*');
          if (data && data.length > 0 && isMounted) {
            const dbFavores: SolidaridadFavor[] = data
              .filter((d: any) => !deletedIds.has(d.id))
              .map((d: any) => ({
                id: d.id,
                type: d.tipo_solicitud || 'prestamo',
                categoria: d.tipo_solicitud || 'prestamo',
                badgeTag: d.tipo_solicitud ? d.tipo_solicitud.toUpperCase() : 'SOLIDARIDAD',
                badgeTime: 'En línea',
                title: d.titulo || 'Apoyo Comunitario',
                description: d.descripcion,
                ownerName: 'Vecino Residente',
                location: d.direccion_referencia || 'Calle Los Sauces 310',
                actionButtonText: 'Pedir apoyo',
                iconName: 'wrench',
                estado: d.estado || 'disponible',
                donorBadgeLevel: 'plata',
              }));

            setFavores((prev) => {
              const rawList = [...dbFavores, ...prev];
              const unique: SolidaridadFavor[] = [];
              const seenIds = new Set<string>();
              const seenContent = new Set<string>();
              for (const item of rawList) {
                if (!item || !item.id || deletedIds.has(item.id)) continue;
                const contentKey = `${item.title.toLowerCase().trim()}_${item.ownerName.toLowerCase().trim()}_${item.categoria}`;
                if (!seenIds.has(item.id) && !seenContent.has(contentKey)) {
                  seenIds.add(item.id);
                  seenContent.add(contentKey);
                  unique.push(item);
                }
              }
              return unique;
            });
          }
        } catch (err) {
          console.warn('Error leyendo muro_solidario de Supabase:', err);
        }
      }
    };

    loadFavores();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFavores = useMemo(() => {
    return favores.filter((f) => {
      const matchesCat =
        selectedCategory === 'todos' ||
        f.categoria === selectedCategory ||
        f.type === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQ =
        q === '' ||
        f.title.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        f.ownerName.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q);

      // Filtro por radios de proximidad (500m Sector 2, 2km Sector 1 y 2, 5km Todos)
      let matchesRadius = true;
      if (proximityRadius === 500) {
        matchesRadius = f.location.includes('Sector 2') || f.location.includes('Sauces');
      } else if (proximityRadius === 2000) {
        matchesRadius = !f.location.includes('Sector 3');
      }

      return matchesCat && matchesQ && matchesRadius;
    });
  }, [favores, searchQuery, selectedCategory, proximityRadius]);

  const handleOpenWhatsapp = (favor: SolidaridadFavor) => {
    const phone = favor.phone || '998765432';
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=51${cleanPhone}&text=${encodeURIComponent(
      `Hola ${favor.ownerName}, te contacto desde la app de vecinos sobre tu publicación de ${favor.title} en Solidaridad.`
    )}`;
    Linking.openURL(url).catch(() => {
      showToast(`Abriendo chat con ${favor.ownerName}`);
    });
    setContactedMap((prev) => ({ ...prev, [favor.id]: true }));
    setFavores((prev) =>
      prev.map((item) => (item.id === favor.id ? { ...item, estado: 'ayuda_solicitada' } : item))
    );
    updateFavorStatusInSQLite(favor.id, 'ayuda_solicitada');
  };

  const handleMarkAsReceived = (favor: SolidaridadFavor) => {
    setFavores((prev) =>
      prev.map((item) => (item.id === favor.id ? { ...item, estado: 'recibido' } : item))
    );
    addFavorCompleted();
    updateFavorStatusInSQLite(favor.id, 'recibido');

    // Actualización real en Supabase si no es id local ficticio
    if (isNetworkOnline && supabase && !favor.id.startsWith('fav-')) {
      supabase
        .from('muro_solidario')
        .update({ estado: 'recibido' })
        .eq('id', favor.id)
        .then(() => {});
    }

    showToast(`${currentUser.name} confirmó la entrega. ¡Ganaste +1 favor en tu estatus!`);
  };

  const applyPreset = (p: typeof PRESETS_NORMAL[0]) => {
    setNewTitle(p.title);
    setNewDesc(p.desc);
    setNewCategory(p.cat);
    showToast(`Plantilla "${p.label}" cargada en 1 clic`);
  };

  const handleCreateFavor = async () => {
    if (!newTitle.trim()) {
      showToast('Ingresa un título para el favor o recurso');
      return;
    }

    const categoryLabels: Record<SolidaridadCategory, string> = {
      prestamo: 'Préstamo',
      donacion: 'Donación',
      acompanamiento: 'Acompañamiento',
      intercambio_habilidades: 'Intercambio habilidades',
    };

    const nextFavoresCount = (currentUser.favoresCount ?? 1) + 1;
    const dynamicBadgeLevel = getCommunityStatusLevel(nextFavoresCount);

    const newFav: SolidaridadFavor = {
      id: `fav-${Date.now()}`,
      type: newCategory,
      categoria: newCategory,
      badgeTag: categoryLabels[newCategory] || 'Solidaridad',
      badgeTime: 'Hoy',
      title: newTitle.trim(),
      description: newDesc.trim() || `${newTitle.trim()}. Disponible para vecinos de la urbanización.`,
      ownerName: currentUser.name,
      ownerAvatarUrl: currentUser.avatarUrl,
      location: `${currentUser.calle} ${currentUser.numero} (${currentUser.sector})`,
      phone: currentUser.phone,
      actionButtonText: 'Pedir apoyo',
      iconName: 'wrench',
      estado: 'disponible',
      donorBadgeLevel: dynamicBadgeLevel,
    };

    // 1. Optimistic UI update
    setFavores((prev) => [newFav, ...prev]);
    addCustomFavor(newFav);
    addFavorCompleted();

    // 2. Persistencia en SQLite local (Directa y Cola Offline)
    saveLocalFavorToSQLite(newFav);
    await saveToOfflineQueue({
      id: newFav.id,
      type: 'SOLIDARIDAD_FAVOR',
      title: newFav.title,
      category: newFav.categoria,
      author: currentUser.name,
      address: newFav.location,
      timestamp: Date.now(),
    });

    // 3. Persistencia en Supabase
    if (isNetworkOnline && supabase) {
      supabase.from('muro_solidario').insert({
        vecino_id: currentUser.id !== 'usr-1' ? currentUser.id : null,
        tipo_solicitud: newCategory,
        titulo: newTitle.trim(),
        descripcion: newDesc.trim() || newTitle.trim(),
        direccion_referencia: `${currentUser.calle} ${currentUser.numero}`,
        estado: 'disponible',
        ubicacion: 'SRID=4326;POINT(-77.0754 -11.8675)',
      }).then(() => {});
    }

    showToast(
      isNetworkOnline
        ? '¡Publicado en el Muro Solidario y sincronizado en Supabase (+1 favor)!'
        : '📡 Publicado localmente en SQLite. Se sincronizará al conectar.'
    );

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleOpenEditFavor = (favor: SolidaridadFavor) => {
    setEditingFavor(favor);
    setEditTitle(favor.title);
    setEditCategory((favor.categoria as SolidaridadCategory) || 'prestamo');
    setEditDesc(favor.description || '');
    setEditLocation(favor.location || `${currentUser.calle} ${currentUser.numero}`);
    setEditPhone(favor.phone || currentUser.phone || '');
    setEditEstado(favor.estado || 'disponible');
    setIsEditModalOpen(true);
  };

  const handleSaveEditFavor = async () => {
    if (!editingFavor) return;
    if (!editTitle.trim()) {
      showToast('Ingresa un título para el favor o artículo');
      return;
    }

    const categoryLabels: Record<SolidaridadCategory, string> = {
      prestamo: 'Préstamo',
      donacion: 'Donación',
      acompanamiento: 'Acompañamiento',
      intercambio_habilidades: 'Intercambio habilidades',
    };

    const updatedFavor: SolidaridadFavor = {
      ...editingFavor,
      title: editTitle.trim(),
      type: editCategory,
      categoria: editCategory,
      badgeTag: categoryLabels[editCategory] || 'Solidaridad',
      description: editDesc.trim() || `${editTitle.trim()}. Disponible para vecinos de la urbanización.`,
      location: editLocation.trim() || `${currentUser.calle} ${currentUser.numero}`,
      phone: editPhone.trim() || editingFavor.phone,
      iconName: editCategory === 'donacion' ? 'gift' : editCategory === 'acompanamiento' ? 'heart' : 'wrench',
      estado: editEstado,
    };

    setFavores((prev) => prev.map((f) => (f.id === updatedFavor.id ? updatedFavor : f)));
    setIsEditModalOpen(false);
    setEditingFavor(null);
    showToast('✓ Publicación solidaria actualizada');

    // 1. Guardar en SQLite local
    await updateLocalFavorDetailsInSQLite(updatedFavor);

    // 2. Si es Supabase UUID, actualizar en la nube
    const isFavUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updatedFavor.id);
    if (supabase && isFavUuid) {
      try {
        await supabase
          .from('muro_solidario')
          .update({
            titulo: updatedFavor.title,
            tipo_solicitud: updatedFavor.categoria,
            descripcion: updatedFavor.description,
            direccion_referencia: updatedFavor.location,
            estado: updatedFavor.estado,
          })
          .eq('id', updatedFavor.id);
      } catch (err) {
        console.warn('Error al actualizar favor en Supabase:', err);
      }
    }
  };

  const handleDeleteFavor = (favor: SolidaridadFavor) => {
    Alert.alert(
      'Eliminar Publicación',
      `¿Deseas eliminar "${favor.title}" del Muro Solidario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // 1. Quitar de React state
            setFavores((prev) => prev.filter((f) => f.id !== favor.id));
            showToast('✓ Publicación eliminada del muro');

            // 2. Eliminar de SQLite y registrar en deleted_records
            await deleteFavorFromSQLite(favor.id);

            // 3. Eliminar de Supabase si corresponde
            const isFavUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(favor.id);
            if (supabase && isFavUuid) {
              try {
                await supabase.from('muro_solidario').delete().eq('id', favor.id);
              } catch (err) {
                console.warn('Error al eliminar favor en Supabase:', err);
              }
            }
          },
        },
      ]
    );
  };

  const categories = isCrisisRealActive ? CATEGORIES_CRISIS : CATEGORIES_NORMAL;
  const presets = isCrisisRealActive ? PRESETS_CRISIS : PRESETS_NORMAL;

  return (
    <ScrollView 
      style={[styles.container, isCrisisRealActive && styles.containerCrisis]} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* EVOLUCIÓN EN CRISIS: BANNER DE AYUDA HUMANITARIA Y ALERTA DE DBSCAN */}
      {isCrisisRealActive && (
        <View style={styles.crisisBannerCard}>
          <View style={styles.crisisBannerHeader}>
            <View style={styles.crisisPulse} />
            <Text style={styles.crisisBannerTitle}>TABLERO DE AYUDA HUMANITARIA</Text>
          </View>
          <Text style={styles.crisisBannerSubtitle}>
            Coordinación de recursos de supervivencia (Agua potable, albergue, víveres y medicinas).
          </Text>

          {/* Alerta del Motor Analítico IA (DBSCAN) */}
          <View style={styles.dbscanAlertBox}>
            <Ionicons name="analytics" size={18} color="#991b1b" />
            <View style={{ flex: 1 }}>
              <Text style={styles.dbscanTitle}>ZONA CRÍTICA DETECTADA POR IA (DBSCAN)</Text>
              <Text style={styles.dbscanDesc}>
                5 reportes activos de Falta de Agua y Auxilio Médico concentrados en Sector 2 (Radio &lt; 500m).
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 1. Barra de Búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder={
            isCrisisRealActive
              ? "Buscar agua potable, botiquín, frazadas, albergue..."
              : "Buscar escalera, taladro, libros, acompañamiento..."
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

      {/* 2. Chips de Categorías (Adaptables a Modo Cotidiano vs Modo Crisis) */}
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

      {/* 3. Banner Promocional de Publicación Rápida */}
      <View style={[styles.publishBanner, isCrisisRealActive && styles.publishBannerCrisis]}>
        <View style={styles.publishBannerLeft}>
          <View style={[styles.publishIconBg, isCrisisRealActive && { backgroundColor: '#dc2626' }]}>
            <MaterialCommunityIcons
              name={isCrisisRealActive ? "shield-plus" : "hand-heart"}
              size={20}
              color="#ffffff"
            />
          </View>
          <View style={styles.publishBannerTextContainer}>
            <Text style={styles.publishBannerTitle}>
              {isCrisisRealActive ? '¿Tienes recursos críticos o auxilio?' : '¿Necesitas algo o puedes prestar ayuda?'}
            </Text>
            <Text style={styles.publishBannerSubtitle}>
              {isCrisisRealActive
                ? 'Ofrece agua, botiquín o refugio para tus vecinos.'
                : 'Pide un préstamo, dona o comparte habilidades.'}
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
            {isCrisisRealActive ? '+ Publicar Recurso SOS' : '+ Pedir o prestar (2 clics)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Encabezado de Sección con Indicador de Radio */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderTitleRow}>
          <MaterialCommunityIcons
            name={isCrisisRealActive ? "hand-back-left" : "account-group"}
            size={20}
            color={isCrisisRealActive ? "#dc2626" : "#2563eb"}
          />
          <Text style={styles.sectionHeaderTitle}>
            {isCrisisRealActive ? 'Recursos Humanitarios Activos' : 'Vecinos Solidarios'}
          </Text>
        </View>
        <Text style={styles.sectionHeaderCount}>
          {filteredFavores.length} en radio {proximityRadius}m
        </Text>
      </View>

      {/* 5. Lista de Favores y Recursos */}
      {filteredFavores.map((favor) => {
        const isReceived = favor.estado === 'recibido';
        const hasContacted = contactedMap[favor.id] || favor.estado === 'ayuda_solicitada';
        const defaultAvatar =
          favor.ownerAvatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
        const isOwner =
          favor.ownerId === currentUser.id ||
          favor.ownerName === currentUser.name ||
          favor.phone === currentUser.phone ||
          favor.id.startsWith('fav-') ||
          currentUser.role === 'Junta Vecinal';

        const categoryLabel = {
          prestamo: 'Préstamo',
          donacion: 'Donación',
          acompanamiento: 'Acompañamiento',
          intercambio_habilidades: 'Intercambio habilidades',
        }[favor.categoria || 'prestamo'] || favor.badgeTag;

        return (
          <View key={favor.id} style={[styles.favorCard, isCrisisRealActive && styles.favorCardCrisis]}>
            {/* Cabecera */}
            <View style={styles.favorHeader}>
              <View style={styles.favorHeaderLeft}>
                <Image source={{ uri: defaultAvatar }} style={styles.favorAvatar} />
                <View style={styles.favorInfo}>
                  <View style={styles.favorNameRow}>
                    <Text style={styles.favorOwnerName} numberOfLines={1}>{favor.ownerName}</Text>
                    {favor.donorBadgeLevel && (
                      <CommunityBadge level={favor.donorBadgeLevel} size="xs" />
                    )}
                  </View>
                  <Text style={styles.favorTitle} numberOfLines={1}>{favor.title}</Text>
                  <Text style={styles.favorLocation} numberOfLines={1}>📍 {favor.location}</Text>
                </View>
              </View>
              <View style={[styles.categoryPill, isCrisisRealActive && { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.categoryPillText, isCrisisRealActive && { color: '#dc2626' }]}>
                  {categoryLabel}
                </Text>
              </View>
            </View>

            {/* Barra de Gestión CRUD para el Vecino Propietario o Junta */}
            {isOwner && (
              <View style={styles.ownerActionsBar}>
                <View style={styles.ownerBadge}>
                  <Ionicons name="person" size={11} color="#1d4ed8" />
                  <Text style={styles.ownerBadgeText}>
                    {currentUser.role === 'Junta Vecinal' && favor.ownerName !== currentUser.name
                      ? 'Gestión Junta'
                      : 'Mi Publicación'}
                  </Text>
                </View>
                <View style={styles.ownerButtonsGroup}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEditFavor(favor)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="pencil" size={13} color="#2563eb" />
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteFavor(favor)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={13} color="#dc2626" />
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Descripción fija y visible */}
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{favor.description}</Text>
            </View>

            {/* Acciones de Contacto y Confirmación */}
            <View style={styles.actionContainer}>
              {isReceived ? (
                <View style={styles.receivedBadge}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#15803d" />
                  <Text style={styles.receivedText}>Ayuda entregada con éxito ✓ (+1 favor)</Text>
                </View>
              ) : hasContacted ? (
                <View style={styles.contactedRow}>
                  <TouchableOpacity
                    style={styles.whatsappActiveBtn}
                    onPress={() => handleOpenWhatsapp(favor)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                    <Text style={styles.whatsappActiveText}>Coordinar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.markReceivedBtn}
                    onPress={() => handleMarkAsReceived(favor)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                    <Text style={styles.markReceivedText}>Marcar como Recibido</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.contactBtn, isCrisisRealActive && { backgroundColor: '#dc2626' }]}
                  onPress={() => handleOpenWhatsapp(favor)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="chatbubbles-outline" size={17} color="#ffffff" />
                  <Text style={styles.contactBtnText}>
                    {isCrisisRealActive ? 'Solicitar Recurso de Auxilio' : favor.actionButtonText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      {/* Modal Crear Favor con Plantillas Rápidas (2 Clics) */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isCrisisRealActive ? 'Publicar Recurso Humanitario' : 'Publicar en el Muro Solidario'}
              </Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Plantillas Rápidas (1 toque para llenar) */}
              <Text style={styles.sectionSublabel}>⚡ Plantillas Rápidas (1 toque para llenar):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {presets.map((p, idx) => (
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
                <Text style={styles.label}>Título o artículo *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej: Escalera de 6 peldaños, Bidón de agua, Taladro..."
                  placeholderTextColor="#94a3b8"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción o condiciones de entrega</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Indica horarios, estado del artículo o instrucciones..."
                  placeholderTextColor="#94a3b8"
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateFavor} activeOpacity={0.85}>
                <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                <Text style={styles.modalSubmitText}>
                  {isCrisisRealActive ? 'Publicar Recurso SOS (2 clics)' : 'Publicar en el Muro (2 clics)'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Editar Mi Publicación (CRUD) */}
      <Modal visible={isEditModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: '#eff6ff', padding: 6, borderRadius: 8 }}>
                  <Ionicons name="pencil" size={18} color="#2563eb" />
                </View>
                <Text style={styles.modalTitle}>Editar Mi Publicación</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>1. Categoría</Text>
              <View style={styles.catGrid}>
                {[
                  { id: 'prestamo', label: 'Préstamo' },
                  { id: 'donacion', label: 'Donación' },
                  { id: 'acompanamiento', label: 'Acompañamiento' },
                  { id: 'intercambio_habilidades', label: 'Intercambio habilidades' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.modalCatOption,
                      editCategory === item.id && styles.modalCatOptionActive,
                    ]}
                    onPress={() => setEditCategory(item.id as SolidaridadCategory)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        editCategory === item.id && styles.modalCatTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>2. Título del Artículo o Favor</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Préstamo de escalera, Donación de libros..."
                placeholderTextColor="#94a3b8"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={styles.label}>3. Descripción y Condiciones de Uso</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                multiline
                placeholder="Describe el estado del objeto, tiempo de préstamo o cómo puedes ayudar..."
                placeholderTextColor="#94a3b8"
                value={editDesc}
                onChangeText={setEditDesc}
              />

              <Text style={styles.label}>4. Ubicación o Referencia</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Jr. Los Pinos 240 (Mz. B)"
                placeholderTextColor="#94a3b8"
                value={editLocation}
                onChangeText={setEditLocation}
              />

              <Text style={styles.label}>5. Teléfono de Contacto (WhatsApp)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: 999 888 777"
                keyboardType="phone-pad"
                value={editPhone}
                onChangeText={setEditPhone}
              />

              <Text style={styles.label}>6. Estado de la Publicación</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {[
                  { id: 'disponible', label: 'Disponible' },
                  { id: 'ayuda_solicitada', label: 'En Proceso' },
                  { id: 'recibido', label: 'Concluido' },
                ].map((st) => (
                  <TouchableOpacity
                    key={st.id}
                    style={[
                      styles.modalCatOption,
                      { flex: 1, paddingVertical: 8 },
                      editEstado === st.id && styles.modalCatOptionActive,
                    ]}
                    onPress={() => setEditEstado(st.id as SolidaridadEstado)}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        { fontSize: 11 },
                        editEstado === st.id && styles.modalCatTextActive,
                      ]}
                    >
                      {st.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.createFavorButton, { flex: 1, backgroundColor: '#f1f5f9' }]}
                  onPress={() => setIsEditModalOpen(false)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.createFavorButtonText, { color: '#475569' }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.createFavorButton, { flex: 2 }]}
                  onPress={handleSaveEditFavor}
                  activeOpacity={0.85}
                >
                  <Text style={styles.createFavorButtonText}>Guardar Cambios</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 10,
    lineHeight: 16,
  },
  dbscanAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  dbscanTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#991b1b',
  },
  dbscanDesc: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 2,
    lineHeight: 14,
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
  favorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  favorCardCrisis: {
    borderColor: '#fca5a5',
  },
  favorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  favorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  favorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1f5f9',
  },
  favorInfo: {
    flex: 1,
  },
  favorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favorOwnerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  favorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
    marginTop: 1,
  },
  favorLocation: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  categoryPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  actionContainer: {
    marginTop: 2,
  },
  contactBtn: {
    backgroundColor: '#1d4ed8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  contactedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsappActiveBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  whatsappActiveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  markReceivedBtn: {
    flex: 1.5,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  markReceivedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  receivedBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },
  receivedText: {
    color: '#15803d',
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionSublabel: {
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
  label: {
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
  modalBodyScroll: {
    maxHeight: 460,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  modalCatOption: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalCatOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  modalCatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  modalCatTextActive: {
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
    marginBottom: 12,
  },
  createFavorButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createFavorButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  ownerActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 8,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  ownerButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
});
