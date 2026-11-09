import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthScreenProps {
  onDemoLogin: () => void;
  onAuthenticated: (user?: User) => Promise<void> | void;
}

export const AuthScreen = ({ onDemoLogin, onAuthenticated }: AuthScreenProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Campos de dirección y perfil barrial
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [urbanizacion, setUrbanizacion] = useState('Urb. Las Palmeras');
  const [sector, setSector] = useState('Sector 2 • Mz. B');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [rol, setRol] = useState<'Vecino Residente' | 'Junta Vecinal'>('Vecino Residente');

  const handleSubmit = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (isRegistering && (!nombre.trim() || !calle.trim() || !numero.trim())) {
      setErrorMsg('Por favor completa tu nombre, calle y número de domicilio.');
      return;
    }

    if (!supabase) {
      setErrorMsg('Falta configurar mobile/.env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              nombre: nombre.trim(),
              telefono: telefono.trim(),
              rol,
              urbanizacion: urbanizacion.trim(),
              sector: sector.trim(),
              calle: calle.trim(),
              numero: numero.trim(),
              service_pin: generatedPin,
              vistos_buenos: 0,
              favores_realizados: 1,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from('perfiles').upsert({
            id: data.user.id,
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            rol,
            urbanizacion: urbanizacion.trim(),
            sector: sector.trim(),
            calle: calle.trim(),
            numero: numero.trim(),
            service_pin: generatedPin,
            vistos_buenos: 0,
            favores_realizados: 1,
          });
        }

        setInfoMsg(`¡Cuenta creada para ${nombre.trim()}! Tu PIN de servicios es ${generatedPin}. Ahora inicia sesión.`);
        setIsRegistering(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await onAuthenticated(data.user ?? undefined);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Cabecera Azul */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Comunidad Vecinos</Text>
            <Text style={styles.headerSubtitle}>
              Red Vecinal por Radios (500m • 2km • 5km)
            </Text>
          </View>

          {/* Selector Iniciar Sesión / Registrarme */}
          <View style={styles.tabSwitch}>
            <TouchableOpacity
              style={[styles.tabButton, !isRegistering && styles.tabButtonActive]}
              onPress={() => {
                setIsRegistering(false);
                setErrorMsg(null);
              }}
            >
              <Text style={[styles.tabText, !isRegistering && styles.tabTextActive]}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, isRegistering && styles.tabButtonActive]}
              onPress={() => {
                setIsRegistering(true);
                setErrorMsg(null);
              }}
            >
              <Text style={[styles.tabText, isRegistering && styles.tabTextActive]}>
                Registrarme
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#be123c" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {infoMsg && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{infoMsg}</Text>
              </View>
            )}

            {isRegistering && (
              <>
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Carlos Mendoza"
                  placeholderTextColor="#94a3b8"
                  value={nombre}
                  onChangeText={setNombre}
                />

                <View style={styles.row}>
                  <View style={styles.colHalf}>
                    <Text style={styles.label}>Urbanización / Zona</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Urb. Las Palmeras"
                      placeholderTextColor="#94a3b8"
                      value={urbanizacion}
                      onChangeText={setUrbanizacion}
                    />
                  </View>
                  <View style={styles.colHalf}>
                    <Text style={styles.label}>Sector / Manzana</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Sector 2 • Mz. B"
                      placeholderTextColor="#94a3b8"
                      value={sector}
                      onChangeText={setSector}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.label}>Calle / Av. / Jr.</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Calle Los Sauces"
                      placeholderTextColor="#94a3b8"
                      value={calle}
                      onChangeText={setCalle}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Número / Lote</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="420"
                      placeholderTextColor="#94a3b8"
                      value={numero}
                      onChangeText={setNumero}
                    />
                  </View>
                </View>

                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="998 765 432"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={telefono}
                  onChangeText={setTelefono}
                />

                {/* Blindaje de Rol: las cuentas inician como Vecino Residente */}
                <View style={styles.roleInfoBox}>
                  <Ionicons name="shield-checkmark" size={16} color="#1d4ed8" />
                  <Text style={styles.roleInfoText}>
                    Tu cuenta inicia como <Text style={{ fontWeight: '800' }}>Vecino Residente</Text>. Los permisos de Junta Vecinal los asigna un administrador.
                  </Text>
                </View>
              </>
            )}

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="carlos@vecinos.pe"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isRegistering ? 'Crear cuenta vecinal' : 'Ingresar a mi comunidad'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Desarrollo / Pruebas UI</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={onDemoLogin}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={16} color="#f59e0b" />
              <Text style={styles.demoButtonText}>
                Entrar en Modo Demo (Carlos • Calle Los Sauces 420)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#dbeafe',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    margin: 16,
    padding: 4,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#1d4ed8',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  colHalf: {
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  roleChipActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  roleChipTextActive: {
    color: '#1d4ed8',
  },
  submitButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  demoButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    color: '#be123c',
    fontSize: 11,
    flex: 1,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  infoText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '600',
  },
  roleInfoBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roleInfoText: {
    color: '#1e3a8a',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
});