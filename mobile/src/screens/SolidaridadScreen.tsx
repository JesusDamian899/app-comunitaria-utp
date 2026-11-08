import React, { useState, useMemo } from 'react';
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
  FontAwesome5, 
  MaterialCommunityIcons, 
  MaterialIcons 
} from '@expo/vector-icons';
import { MOCK_FAVORES } from '../mock/data';
import type { SolidaridadFavor, SolidaridadCategory } from '../types';
import { CommunityBadge } from '../components/CommunityBadge';
import { useApp } from '../context/AppContext';
import { useAuth, getCommunityStatusLevel } from '../components/AuthGuard';

export type SolidaridadFilterType = 'todos' | SolidaridadCategory;

const CATEGORIES: { id: SolidaridadFilterType; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: 'apps' },
  { id: 'prestamo', label: 'Préstamo', icon: 'build' },
  { id: 'donacion', label: 'Donación', icon: 'gift' },
  { id: 'acompanamiento', label: 'Acompañamiento', icon: 'people' },
  { id: 'intercambio_habilidades', label: 'Intercambio habilidades', icon: 'sparkles' },
];

export const SolidaridadScreen = () => {
  const { showToast } = useApp();
  const { currentUser, addFavorCompleted } = useAuth();

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

      return matchesCat && matchesQ;
    });
  }, [favores, searchQuery, selectedCategory]);

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
  };

  const handleMarkAsReceived = (favor: SolidaridadFavor) => {
    setFavores((prev) =>
      prev.map((item) => (item.id === favor.id ? { ...item, estado: 'recibido' } : item))
    );
    addFavorCompleted();
    // Notificación directa sin popups emergentes (presunción de confianza vecinal)
    showToast(`${currentUser.name} confirmó tu ayuda. ¡Gracias por aportar al barrio!`);
  };

  const handleCreateFavor = () => {
    if (!newTitle.trim()) {
      showToast('Ingresa un título para el favor o artículo');
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
      location: `${currentUser.calle} ${currentUser.numero}`,
      phone: currentUser.phone,
      actionButtonText: 'Pedir apoyo',
      iconName: 'wrench',
      estado: 'disponible',
      donorBadgeLevel: dynamicBadgeLevel,
    };

    setFavores((prev) => [newFav, ...prev]);
    addFavorCompleted();
    showToast('¡Publicación agregada al Muro Solidario (+1 favor a tu estatus)!');
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Barra de Búsqueda (Estilo homogéneo a Servicios) */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar escalera, taladro, libros, acompañamiento..."
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

      {/* 2. Chips de Categorías */}
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

      {/* 3. Banner Promocional "+ Pedir o prestar (Muro Solidario)" */}
      <View style={styles.publishBanner}>
        <View style={styles.publishBannerLeft}>
          <View style={styles.publishIconBg}>
            <MaterialCommunityIcons name="hand-heart" size={20} color="#1d4ed8" />
          </View>
          <View style={styles.publishBannerTextContainer}>
            <Text style={styles.publishBannerTitle}>¿Necesitas algo o puedes prestar ayuda?</Text>
            <Text style={styles.publishBannerSubtitle}>Pide un préstamo, dona o comparte tus habilidades.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={() => setIsCreateModalOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={16} color="#ffffff" />
          <Text style={styles.publishButtonText}>+ Pedir o prestar (Muro Solidario)</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Encabezado de Sección */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderTitleRow}>
          <MaterialCommunityIcons name="account-group" size={20} color="#2563eb" />
          <Text style={styles.sectionHeaderTitle}>Vecinos Solidarios</Text>
        </View>
        <Text style={styles.sectionHeaderCount}>{filteredFavores.length} activos</Text>
      </View>

      {/* 5. Lista de Favores con Descripción Fija y Permanente (NO desplegable) */}
      {filteredFavores.map((favor) => {
        const isReceived = favor.estado === 'recibido';
        const hasContacted = contactedMap[favor.id] || favor.estado === 'ayuda_solicitada';
        const firstName = favor.ownerName.split(' ')[0] || favor.ownerName;
        const defaultAvatar =
          favor.ownerAvatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

        const categoryLabel = {
          prestamo: 'Préstamo',
          donacion: 'Donación',
          acompanamiento: 'Acompañamiento',
          intercambio_habilidades: 'Intercambio habilidades',
        }[favor.categoria || 'prestamo'] || favor.badgeTag;

        return (
          <View key={favor.id} style={styles.favorCard}>
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
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{categoryLabel}</Text>
              </View>
            </View>

            {/* Fila de Confianza Presumida */}
            <View style={styles.trustBadgeRow}>
              <View style={[
                styles.trustBadge,
                isReceived ? styles.trustBadgeReceived : hasContacted ? styles.trustBadgePending : styles.trustBadgeInitial
              ]}>
                {isReceived ? (
                  <>
                    <Ionicons name="checkmark-circle" size={13} color="#16a34a" />
                    <Text style={styles.trustBadgeTextReceived}>Ayuda Concluida y Confirmada</Text>
                  </>
                ) : hasContacted ? (
                  <>
                    <Ionicons name="time" size={13} color="#d97706" />
                    <Text style={styles.trustBadgeTextPending}>Ayuda en proceso con {firstName}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={13} color="#2563eb" />
                    <Text style={styles.trustBadgeTextInitial}>Confianza Presumida • Sin códigos</Text>
                  </>
                )}
              </View>
            </View>

            {/* REQUISITO FUNDAMENTAL: Descripción fija, estática y siempre visible (NO DESPLEGABLE) */}
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionHeaderTitle}>DETALLES DEL FAVOR EN LA URBANIZACIÓN</Text>
              <Text style={styles.descriptionText}>
                {favor.description || `${favor.title}. Disponible para vecinos de la urbanización.`}
              </Text>
            </View>

            {/* Botón WhatsApp transformable a "Marcar como Recibido" */}
            <View style={styles.actionContainer}>
              {isReceived ? (
                <View style={styles.receivedBadgeContainer}>
                  <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                  <Text style={styles.receivedBadgeText}>✓ Ayuda Recibida y Agradecida</Text>
                </View>
              ) : !hasContacted ? (
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => handleOpenWhatsapp(favor)}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="whatsapp" size={18} color="#ffffff" />
                  <Text style={styles.whatsappButtonText}>Chat WhatsApp con {firstName}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.contactedContainer}>
                  <TouchableOpacity
                    style={styles.markReceivedButton}
                    onPress={() => handleMarkAsReceived(favor)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                    <Text style={styles.markReceivedButtonText}>Marcar como Recibido</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenWhatsapp(favor)}
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

      {/* Modal Crear Favor / Pedir Préstamo */}
      <Modal visible={isCreateModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publicar en Muro Solidario</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>1. Categoría</Text>
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
                      newCategory === item.id && styles.modalCatOptionActive,
                    ]}
                    onPress={() => setNewCategory(item.id as SolidaridadCategory)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        newCategory === item.id && styles.modalCatTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>2. Título del Artículo o Favor</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Préstamo de escalera, Donación de libros..."
                placeholderTextColor="#94a3b8"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>3. Descripción y Condiciones de Uso</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                multiline
                placeholder="Describe el estado del objeto, tiempo de préstamo o cómo puedes ayudar..."
                placeholderTextColor="#94a3b8"
                value={newDesc}
                onChangeText={setNewDesc}
              />

              <View style={styles.trustBannerNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#1d4ed8" />
                <Text style={styles.trustBannerNoticeText}>
                  Bajo la Presunción de Confianza: No se requieren códigos ni depósitos monetarios.
                </Text>
              </View>

              <TouchableOpacity style={styles.createFavorButton} onPress={handleCreateFavor} activeOpacity={0.85}>
                <Text style={styles.createFavorButtonText}>Publicar en Muro Solidario</Text>
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
  favorCard: {
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
  favorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  favorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  favorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
  },
  favorInfo: {
    flex: 1,
  },
  favorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  favorOwnerName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  favorTitle: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '800',
    marginTop: 2,
  },
  favorLocation: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
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
  trustBadgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  trustBadgeInitial: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  trustBadgePending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
  },
  trustBadgeReceived: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  trustBadgeTextInitial: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  trustBadgeTextPending: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
  },
  trustBadgeTextReceived: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  descriptionHeaderTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  descriptionText: {
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
  markReceivedButton: {
    backgroundColor: '#15803d',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  markReceivedButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
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
  receivedBadgeContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  receivedBadgeText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 16,
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
  modalBodyScroll: {
    maxHeight: 460,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  },
  trustBannerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  trustBannerNoticeText: {
    fontSize: 11,
    color: '#1e3a8a',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  createFavorButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  createFavorButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
