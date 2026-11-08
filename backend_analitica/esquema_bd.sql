-- =================================================================================
-- ESQUEMA COMPLETO ACTUALIZADO - RED VECINAL POR RADIOS Y CONFIANZA (SUPABASE)
-- =================================================================================

-- 1. HABILITAR EXTENSIONES
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- =================================================================================
-- 2. TABLA DE PERFILES (Direcciones, Radios, Niveles de Confianza y Gamificación)
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  rol TEXT DEFAULT 'Vecino Residente',          -- 'Vecino Residente' (vecino base) | 'Junta Vecinal'
  urbanizacion TEXT DEFAULT 'Urb. Las Palmeras',
  sector TEXT DEFAULT 'Sector 2 • Mz. B',
  calle TEXT DEFAULT 'Calle Los Sauces',
  numero TEXT DEFAULT 'S/N',
  ubicacion extensions.GEOGRAPHY(POINT),        -- Coordenada GPS del domicilio para cálculo de radios (500m, 2km, 5km)
  avatar_url TEXT,
  verificado BOOLEAN DEFAULT false,             -- Check azul (Nivel 2+ o Profesión colegiada)
  service_pin VARCHAR(4) DEFAULT '4826',        -- PIN único de 4 dígitos para validar servicios otorgados
  vistos_buenos INT DEFAULT 0,                  -- 0-4: Nivel 1 | 5-14: Nivel 2 | 15+: Nivel 3 Profesional de Confianza
  favores_realizados INT DEFAULT 0,             -- Contador para insignias: Bronce, Plata, Oro, Héroe del barrio y Vecino del Mes
  hogar_vulnerable BOOLEAN DEFAULT false,
  detalle_vulnerabilidad TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asegurar columnas nuevas si la tabla perfiles ya existía de antes:
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'Vecino Residente';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS urbanizacion TEXT DEFAULT 'Urb. Las Palmeras';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'Sector 2 • Mz. B';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS calle TEXT DEFAULT 'Calle Los Sauces';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS numero TEXT DEFAULT 'S/N';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS ubicacion extensions.GEOGRAPHY(POINT);
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS service_pin VARCHAR(4) DEFAULT '4826';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS favores_realizados INT DEFAULT 0;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS hogar_vulnerable BOOLEAN DEFAULT false;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS detalle_vulnerabilidad TEXT;

-- =================================================================================
-- 3. MÓDULO: SERVICIOS DE PROXIMIDAD Y VALIDACIÓN POR PIN DE 4 DÍGITOS
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.oficios_locales (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  vecino_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,                      -- 'alimentacion' | 'mantenimiento_hogar' | 'salud_bienestar' | etc.
  tipo_actividad TEXT DEFAULT 'oficio',         -- 'profesion' (requiere colegiatura) | 'oficio' (avalado por vistos buenos)
  rol_oficio TEXT,                              -- Ej: 'Plomero / Gasfitero Maestro'
  experiencia TEXT,                             -- Ej: '30 años exp.'
  colegiatura TEXT,                             -- Ej: 'CEP #48291' (solo para tipo_actividad = 'profesion')
  verificado BOOLEAN DEFAULT false,
  descripcion TEXT,
  recomendaciones INT DEFAULT 0,                -- Vistos buenos acumulados en este servicio
  service_pin VARCHAR(4),                       -- PIN de 4 dígitos para desbloquear calificación
  ubicacion extensions.GEOGRAPHY(POINT) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.oficios_locales ADD COLUMN IF NOT EXISTS tipo_actividad TEXT DEFAULT 'oficio';
ALTER TABLE public.oficios_locales ADD COLUMN IF NOT EXISTS rol_oficio TEXT;
ALTER TABLE public.oficios_locales ADD COLUMN IF NOT EXISTS experiencia TEXT;
ALTER TABLE public.oficios_locales ADD COLUMN IF NOT EXISTS colegiatura TEXT;
ALTER TABLE public.oficios_locales ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false;
ALTER TABLE public.oficios_locales ADD COLUMN IF NOT EXISTS recomendaciones INT DEFAULT 0;
ALTER TABLE public.oficios_locales ADD COLUMN IF NOT EXISTS service_pin VARCHAR(4);

-- Tabla de Reseñas y Validaciones de Servicio (Cuando el cliente digita el PIN de 4 dígitos)
CREATE TABLE IF NOT EXISTS public.resenas_servicios (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  oficio_id UUID REFERENCES public.oficios_locales(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  autor_nombre TEXT NOT NULL,
  direccion_cliente TEXT,                       -- Ej: 'Calle Los Sauces 420'
  tipo_voto TEXT DEFAULT 'positivo',            -- 'positivo' (+1 Visto Bueno) | 'negativo' (-1 Visto Bueno)
  estrellas INT CHECK (estrellas BETWEEN 1 AND 5),
  comentario TEXT,                              -- Etiqueta de 1 clic: 'Puntual y muy limpio el trabajo.', etc.
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================================
-- 4. MÓDULO: CADENA DE FAVORES (SOLIDARIDAD SIN CÓDIGOS + GAMIFICACIÓN)
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.muro_solidario (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  vecino_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  tipo_solicitud TEXT NOT NULL,                 -- 'prestamo' | 'donacion' | 'acompanamiento' | 'intercambio_habilidades'
  titulo TEXT,
  descripcion TEXT,
  horario_referencia TEXT,
  direccion_referencia TEXT,                    -- Ej: 'Calle Los Sauces 420'
  ubicacion extensions.GEOGRAPHY(POINT),
  estado TEXT DEFAULT 'disponible',             -- 'disponible' -> 'ayuda_solicitada' -> 'recibido' ("Marcar como Recibido")
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.muro_solidario ADD COLUMN IF NOT EXISTS voluntario_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL;
ALTER TABLE public.muro_solidario ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE public.muro_solidario ADD COLUMN IF NOT EXISTS horario_referencia TEXT;
ALTER TABLE public.muro_solidario ADD COLUMN IF NOT EXISTS direccion_referencia TEXT;
ALTER TABLE public.muro_solidario ADD COLUMN IF NOT EXISTS ubicacion extensions.GEOGRAPHY(POINT);

-- =================================================================================
-- 5. MÓDULO: ALERTAS DE EMERGENCIA Y CLUSTERING DBSCAN
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.alertas_emergencia (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  vecino_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  tipo_emergencia TEXT NOT NULL,
  ubicacion extensions.GEOGRAPHY(POINT) NOT NULL,
  gravedad TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cluster_vulnerabilidad (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  centroide extensions.GEOGRAPHY(POINT) NOT NULL,
  radio_metros FLOAT,
  cantidad_reportes INT,
  nivel_gravedad TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================================
-- 6. FUNCIÓN POSTGIS PARA FILTRAR POR RADIOS (500m Hiperlocal, 2km Zonal, 5km Comunitario)
-- =================================================================================
CREATE OR REPLACE FUNCTION public.obtener_oficios_en_radio(
  lat_usuario DOUBLE PRECISION,
  lon_usuario DOUBLE PRECISION,
  radio_metros DOUBLE PRECISION DEFAULT 500.0   -- 500 (Hiperlocal), 2000 (Zonal), 5000 (Límite Comunitario)
)
RETURNS SETOF public.oficios_locales
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.oficios_locales
  WHERE extensions.ST_DWithin(
    ubicacion,
    extensions.ST_SetSRID(extensions.ST_MakePoint(lon_usuario, lat_usuario), 4326)::extensions.geography,
    radio_metros
  );
$$;

-- =================================================================================
-- 7. TRIGGER AUTOMÁTICO DE REGISTRO (AUTH.USERS -> PUBLIC.PERFILES)
-- =================================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (
    id,
    nombre,
    telefono,
    rol,
    urbanizacion,
    sector,
    calle,
    numero,
    service_pin,
    ubicacion
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Vecino Nuevo'),
    NEW.raw_user_meta_data->>'telefono',
    COALESCE(NEW.raw_user_meta_data->>'rol', 'Vecino Residente'),
    COALESCE(NEW.raw_user_meta_data->>'urbanizacion', 'Urb. Las Palmeras'),
    COALESCE(NEW.raw_user_meta_data->>'sector', 'Sector 2 • Mz. B'),
    COALESCE(NEW.raw_user_meta_data->>'calle', 'Calle Los Sauces'),
    COALESCE(NEW.raw_user_meta_data->>'numero', 'S/N'),
    COALESCE(NEW.raw_user_meta_data->>'service_pin', LPAD((FLOOR(RANDOM() * 9000) + 1000)::text, 4, '0')),
    extensions.ST_GeogFromText('SRID=4326;POINT(-77.0754 -11.8675)')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =================================================================================
-- 8. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =================================================================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oficios_locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muro_solidario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_emergencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cluster_vulnerabilidad ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica perfiles" ON public.perfiles;
CREATE POLICY "Lectura publica perfiles" ON public.perfiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Actualizar propio perfil" ON public.perfiles;
CREATE POLICY "Actualizar propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Todos pueden ver los oficios" ON public.oficios_locales;
CREATE POLICY "Todos pueden ver los oficios" ON public.oficios_locales FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vecinos pueden insertar sus oficios" ON public.oficios_locales;
CREATE POLICY "Vecinos pueden insertar sus oficios" ON public.oficios_locales FOR INSERT WITH CHECK (auth.uid() = vecino_id);

DROP POLICY IF EXISTS "Lectura publica resenas" ON public.resenas_servicios;
CREATE POLICY "Lectura publica resenas" ON public.resenas_servicios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertar resenas autenticado" ON public.resenas_servicios;
CREATE POLICY "Insertar resenas autenticado" ON public.resenas_servicios FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Lectura publica muro solidario" ON public.muro_solidario;
CREATE POLICY "Lectura publica muro solidario" ON public.muro_solidario FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertar en muro solidario" ON public.muro_solidario;
CREATE POLICY "Insertar en muro solidario" ON public.muro_solidario FOR INSERT WITH CHECK (auth.uid() = vecino_id);
