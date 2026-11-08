import { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Phone, Building2, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AuthScreenProps {
  onDemoLogin: () => void;
}

export const AuthScreen = ({ onDemoLogin }: AuthScreenProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [portal, setPortal] = useState('Portal B');
  const [departamento, setDepartamento] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!supabase) {
      setErrorMsg('Falta configurar el archivo frontend/.env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
              telefono,
              edificio: 'Edificio Roble',
              portal,
              departamento,
            },
          },
        });
        if (error) throw error;
        setInfoMsg('¡Cuenta vecinal creada! Ya puedes iniciar sesión (o revisa tu correo si activaste confirmación).');
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-blue-700 px-6 py-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Comunidad Vecinos</h1>
          <p className="text-xs text-blue-100 mt-1">
            Edificio Roble • Seguridad, Servicios y Solidaridad
          </p>
        </div>

        {/* Pestañas Login / Registro */}
        <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/60 p-1.5 m-4 rounded-xl">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isRegistering ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isRegistering ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Registrarme
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              {infoMsg}
            </div>
          )}

          {isRegistering && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Portal / Bloque</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={portal}
                      onChange={(e) => setPortal(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Portal A">Portal A</option>
                      <option value="Portal B">Portal B</option>
                      <option value="Portal C">Portal C</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Departamento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 4º A"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="999 888 777"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Correo electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="carlos@vecinos.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            {loading
              ? 'Procesando...'
              : isRegistering
              ? 'Crear cuenta vecinal'
              : 'Ingresar a mi comunidad'}
          </button>

          {/* Divisor para compañeros de equipo / Modo Demo */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-2 text-slate-400 font-medium">Desarrollo / Pruebas UI</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDemoLogin}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Entrar en Modo Demo (Carlos • 4ºA)</span>
          </button>
        </form>
      </div>
    </div>
  );
};