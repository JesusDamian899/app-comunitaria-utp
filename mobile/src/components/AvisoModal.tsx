import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from './AuthGuard';

const AVISO_PRESETS = [
  { label: '💧 Corte de Agua', title: 'Aviso de corte temporal de agua', desc: 'Mantenimiento de tuberías matrices en la manzana. Tomar precauciones.' },
  { label: '⚡ Alumbrado Público', title: 'Mantenimiento de luminarias', desc: 'Cuadrilla técnica revisando postes de alumbrado en el sector.' },
  { label: '🚨 Ronda de Seguridad', title: 'Ronda nocturna coordinada', desc: 'Serenazgo y vecinos organizados realizarán patrullaje preventivo.' },
  { label: '📢 Asamblea Extraordinaria', title: 'Reunión vecinal informativa', desc: 'Convocatoria a todos los vecinos para coordinar mejoras comunales.' },
];

export const AvisoModal = () => {
  const { isAvisoModalOpen, closeAvisoModal, addCustomAviso, showToast } = useApp();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Comunicado Vecinal');

  const applyPreset = (preset: typeof AVISO_PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setCategory(preset.label.split(' ')[1] || 'Comunicado');
    showToast(`Plantilla "${preset.label}" cargada en 1 clic`);
  };

  const handlePublish = () => {
    if (!title.trim()) {
      showToast('Por favor ingresa un título para el aviso');
      return;
    }

    addCustomAviso({
      authorName: currentUser.name,
      authorRole: currentUser.role,
      category,
      title: title.trim(),
      description: description.trim() || title.trim(),
      isOfficial: currentUser.role.includes('Junta'),
    });

    closeAvisoModal();
    setTitle('');
    setDescription('');
  };

  return (
    <Modal visible={isAvisoModalOpen} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBg}>
                <Ionicons name="megaphone" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Publicar Aviso Vecinal</Text>
                <Text style={styles.headerSubtitle}>Urbanización Las Palmeras</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeAvisoModal} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Plantillas Rápidas (1 Clic) */}
            <Text style={styles.sectionLabel}>⚡ Plantillas Rápidas (1 toque para llenar):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {AVISO_PRESETS.map((p, idx) => (
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
              <Text style={styles.label}>Título del aviso *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mantenimiento de alumbrado en Calle Los Sauces"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Detalle o recomendación para los vecinos</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Indica horarios, calles afectadas o sugerencias..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.authorBadge}>
              <Ionicons name="person-circle-outline" size={16} color="#1d4ed8" />
              <Text style={styles.authorText}>
                Publicando como: <Text style={{ fontWeight: '800' }}>{currentUser.name}</Text> ({currentUser.role})
              </Text>
            </View>

            <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
              <Text style={styles.publishBtnText}>Publicar Aviso Vecinal (2 clics)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 14,
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
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  authorText: {
    fontSize: 11,
    color: '#475569',
  },
  publishBtn: {
    backgroundColor: '#1d4ed8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  publishBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
