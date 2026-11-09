# 🏘️ Red Comunitaria Vecinal (`app-comunitaria-utp`)

> **Plataforma móvil hiperlocal y resiliente para la organización barrial, auxilio inmediato en emergencias (Online/Offline) y economía comunitaria de confianza.**  
> Desarrollada para la Hackathon con **React Native (Expo)**, **Supabase (PostgreSQL + PostGIS)**, **SQLite Local** y **Machine Learning (Python DBSCAN)**.

---

## 🌟 Características Principales a Primera Vista

* 📍 **Radar de Proximidad Dinámico:** Filtro de radio configurable (**500m • 2km • 5km**) con geolocalización GPS real y cálculos de distancia con PostGIS.
* 🚨 **Botón de Emergencia SOS Resiliente (Offline-First):** Cuadrícula inmediata de incidentes (*"Me caí"*, *"Estoy atrapada/o"*, *"Accidente"*, *"Otra"*), con persistencia local en **SQLite**. Si la urbanización se queda sin internet o luz, la alerta se almacena y se sincroniza automáticamente con PostGIS al restablecer la conexión.
* 🛡️ **Directorio de Servicios Vecinales con PIN Antifraude:** Servicios con tarifa justa (tope social de S/. 100), contacto directo por **WhatsApp** y validación comunitaria obligatoria mediante **PIN de 4 dígitos**.
* 🤝 **Muro Solidario y Banco de Tiempo:** Ayuda vecinal con principio de confianza presumida, gamificación por insignias (*Bronce* a *Héroe del Barrio*) y confirmación de recepción.
* 🗺️ **Mapa Comunitario Interactivo:** Visualización en tiempo real de cuadrantes, hidrantes, zonas seguras y alertas vecinales activas.
* 💡 **Guía Interactiva con Foco SVG (Spotlight Onboarding):** Tutorial dinámico que resalta los botones reales en la pantalla para que cualquier vecino (incluso adultos mayores) domine la app en menos de 1 minuto.
* 🧠 **Motor Analítico de Vulnerabilidad:** Modelo DBSCAN no supervisado en Python para agrupar incidentes y predecir zonas críticas en el barrio.

---

## ⚡ 1. Requisitos Previos

Solo necesitas tener instalado en tu computadora:
1. **Node.js** (v18 o v20 LTS recomendado) → [nodejs.org](https://nodejs.org/)
2. **Git**
3. **Tu Celular con Expo Go:** Descarga gratuita de **Expo Go** en Google Play Store (Android) o App Store (iOS).

*(Opcional: Python 3.10+ solo si deseas correr el script analítico DBSCAN en `backend_analitica/`).*

---

## 🚀 2. Ejecución Rápida en 3 Pasos

La base de datos **Supabase** ya cuenta con configuración pública y RLS activa por defecto, **no necesitas crear archivos `.env` ni configurar credenciales**.

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/JesusDamian899/app-comunitaria-utp.git
cd app-comunitaria-utp/mobile
```

### Paso 2: Instalar librerías
```bash
npm install
```

### Paso 3: Iniciar la aplicación
```bash
npx expo start -c
```

📱 **Cómo probarlo:**
* **En tu teléfono:** Abre la cámara o la app **Expo Go** y escanea el código QR que aparecerá en la terminal.
* **En el navegador Web:** Presiona la tecla **`w`** en la terminal para abrirlo en Chrome/Edge.
* **En redes protegidas o institucionales:** Si el Wi-Fi bloquea puertos locales, ejecuta `npx expo start --tunnel`.

---

## 🔑 3. Guía Rápida para Demostración y Jurados

### A. Acceso Inmediato (Modo Demo)
* Al abrir la app, pulsa el botón **"✨ Entrar en Modo Demo (Carlos • Calle Los Sauces 420)"**.
* Entrarás como Carlos Mendoza (**PIN: `4826`**, Nivel 3: Confianza Ganada con 18 Vistos Buenos).

### B. Tutorial Interactivo
* Pulsa el botón **"Guía del Vecino"** en la barra superior para activar el tour visual con foco luminoso SVG y puntero animado sobre cada función.

### C. Probar la Validación de Servicios con PIN
En la pestaña **Servicios**, puedes probar validar a los proveedores precargados con sus PINs reales de trabajo:
* **Don Mario Ramos** (Gasfitero Maestro): PIN **`3150`**
* **Lic. Lucía Méndez** (Enfermería a Domicilio): PIN **`7294`**
* **Ing. Alejandro Vega** (Electricista Colegiado): PIN **`9312`**
*(Al ingresar el PIN correcto, se desbloquea la calificación con pulgar arriba/abajo y comentarios rápidos).*

### D. Probar el Modo Emergencia SOS
* Presiona el botón flotante rojo **SOS** en la esquina inferior derecha.
* Selecciona un incidente (*"Me caí"*).
* Simula una emergencia: se guardará inmediatamente en SQLite y se registrará en las líneas de Serenazgo (`01 548 7000`), SAMU (`106`) o Bomberos (`116`).

---

## 🏛️ 4. Estructura de la Solución

```text
app-comunitaria-utp/
├── mobile/                        # Aplicación Móvil React Native (Expo)
│   ├── App.tsx                    # Punto de entrada con navegación protegida
│   └── src/
│       ├── components/            # TutorialModal (SVG), TopHeader, AvisoModal, CrisisMap
│       ├── context/               # AppContext (Estado global, usuario, rol y radar)
│       ├── hooks/                 # useOfflineSync, useGeolocation
│       ├── lib/                   # sqliteDatabase (Offline), supabaseClient (PostGIS)
│       ├── screens/               # Inicio, Servicios, Mapa, Solidaridad, Perfil, SOS
│       └── types/                 # Modelos TypeScript e interfaces de datos
│
├── backend_analitica/             # Inteligencia Artificial y Clustering Espacial
│   └── motor_vulnerabilidad.py    # Algoritmo DBSCAN con distancia Haversine
│
└── supabase/                      # Migraciones SQL, esquemas y tablas PostGIS
```

---

## 🧠 5. Ejecutar el Motor Analítico de Vulnerabilidad

Para correr la agrupación espacial de incidentes críticos:

```bash
cd backend_analitica
pip install pandas numpy scikit-learn psycopg2-binary
python motor_vulnerabilidad.py
```

---

## 👥 Equipo y Autores
* Proyecto desarrollado para la **Hackathon UTP**.
* Repositorio oficial: [JesusDamian899/app-comunitaria-utp](https://github.com/JesusDamian899/app-comunitaria-utp)
