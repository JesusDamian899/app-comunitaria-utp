---------------------------------------------------
---CREACION DE TABLAS DEL MODELO DE NEGOCIO---
---------------------------------------------------

-- Habilitar extensiones necesarias en sus esquemas correctos
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. Tabla de Usuarios (Vecinos)
CREATE TABLE perfiles (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  vistos_buenos INT DEFAULT 0
);

-- 2. Módulo: Servicios de Proximidad (Día a Día)
CREATE TABLE oficios_locales (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  vecino_id UUID REFERENCES perfiles(id),
  categoria TEXT NOT NULL, 
  descripcion TEXT,
  ubicacion extensions.GEOGRAPHY(POINT) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Módulo: Cadena de Favores (Economía Solidaria)
CREATE TABLE muro_solidario (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  vecino_id UUID REFERENCES perfiles(id),
  tipo_solicitud TEXT NOT NULL, 
  descripcion TEXT,
  estado TEXT DEFAULT 'pendiente',
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Módulo: Alertas de Emergencia
CREATE TABLE alertas_emergencia (
  id UUID PRIMARY KEY, 
  vecino_id UUID REFERENCES perfiles(id),
  tipo_emergencia TEXT NOT NULL,
  ubicacion extensions.GEOGRAPHY(POINT) NOT NULL,
  gravedad TEXT,
  creado_en TIMESTAMP WITH TIME ZONE,
  sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Módulo: Alertas vulnerabilidad
CREATE TABLE cluster_vulnerabilidad (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  centroide extensions.GEOGRAPHY(POINT) NOT NULL,
  radio_metros FLOAT,
  cantidad_reportes INT,
  nivel_gravedad TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-------------------------------------
------RLS(Row Level Security)--------
-------------------------------------
ALTER TABLE oficios_locales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vecinos pueden insertar sus oficios" ON oficios_locales
  FOR INSERT WITH CHECK (auth.uid() = vecino_id);

CREATE POLICY "Todos pueden ver los oficios" ON oficios_locales
  FOR SELECT USING (true);

-------------------------------------------------
----------------INSERTS PRUEBA-------------------
-------------------------------------------------

-- 1. Desactivamos temporalmente las políticas RLS para inyectar la data de prueba
ALTER TABLE oficios_locales DISABLE ROW LEVEL SECURITY;

-- 2. Insertamos un perfil falso (Usamos un UUID generado aleatoriamente para saltar el registro real por ahora)
INSERT INTO perfiles (id, nombre, telefono, vistos_buenos)
VALUES ('fffd667e-5a99-4f70-97f0-ca1ea3db478c', 'Vecino de Prueba', '999888777', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Inyectamos los reportes de emergencia (Simulación en Puente Piedra)
INSERT INTO alertas_emergencia (id, vecino_id, tipo_emergencia, gravedad, ubicacion, creado_en)
VALUES 
  -- CLÚSTER CRÍTICO: 5 reportes muy cercanos (Aprox. por la Plaza de Armas de Puente Piedra)
  (extensions.uuid_generate_v4(), 'fffd667e-5a99-4f70-97f0-ca1ea3db478c', 'Falta de Agua', 'ALTA', 'SRID=4326;POINT(-77.0754 -11.8675)', NOW()),
  (extensions.uuid_generate_v4(), 'fffd667e-5a99-4f70-97f0-ca1ea3db478c', 'Falta de Agua', 'ALTA', 'SRID=4326;POINT(-77.0760 -11.8680)', NOW()),
  (extensions.uuid_generate_v4(), 'fffd667e-5a99-4f70-97f0-ca1ea3db478c', 'Asistencia Médica', 'CRITICA', 'SRID=4326;POINT(-77.0750 -11.8672)', NOW()),
  (extensions.uuid_generate_v4(), 'fffd667e-5a99-4f70-97f0-ca1ea3db478c', 'Derrumbe', 'ALTA', 'SRID=4326;POINT(-77.0758 -11.8678)', NOW()),
  (extensions.uuid_generate_v4(), 'fffd667e-5a99-4f70-97f0-ca1ea3db478c', 'Falta de Agua', 'MEDIA', 'SRID=4326;POINT(-77.0745 -11.8670)', NOW()),
  
  -- REPORTE AISLADO: 1 reporte lejos (Por la Panamericana Norte, actuará como "ruido" que el algoritmo ignorará)
  (extensions.uuid_generate_v4(), 'fffd667e-5a99-4f70-97f0-ca1ea3db478c', 'Vandalismo', 'MEDIA', 'SRID=4326;POINT(-77.0600 -11.8750)', NOW());