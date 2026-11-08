# 🏘️ Comunidad Vecinos (`app-comunitaria-utp`)

Aplicación móvil comunitaria por radios de proximidad (**500m • 2km • 5km**) desarrollada con **React Native (Expo)**, **Supabase (PostgreSQL + PostGIS + Auth)** y un motor analítico de zonas críticas de vulnerabilidad con **Python (DBSCAN)**.

---

## 📋 1. Requisitos Previos

* **Node.js** (v18 o v20 LTS recomendado) → [Descargar aquí](https://nodejs.org/)
* **Git** instalado.
* **Para probar en celular físico (Recomendado):** Instalar la app gratuita **Expo Go** desde Google Play Store (Android) o App Store (iOS).
* **Python 3.10+** *(Opcional, para ejecutar el motor analítico DBSCAN en `backend_analitica/`)*.

---

## 🚀 2. Instalación y Ejecución de la App Móvil (`mobile/`)

La conexión a **Supabase** ya viene configurada por defecto con la `Publishable Key` pública del proyecto y seguridad RLS, por lo que **no necesitas configurar ningún archivo `.env` manualmente** para ejecutar la app.

### Paso 1: Clonar o actualizar el repositorio
```bash
git clone https://github.com/JesusDamian899/app-comunitaria-utp.git
cd app-comunitaria-utp/mobile
```
*(Si ya lo habías clonado antes, actualízalo con `git pull origin main`).*

### Paso 2: Instalar las dependencias
```bash
npm install
```

### Paso 3: Iniciar la aplicación (limpiando caché)
```bash
npx expo start -c
```
* **En celular físico:** Escanea el código QR de la terminal con la aplicación **Expo Go**.
* **En navegador Web:** Presiona la tecla **`w`** en la terminal (o ejecuta `npm run web`).
* **Si estás en una red Wi-Fi restringida (universidad/oficina):** Usa `npx expo start --tunnel`.

---

## 🔑 3. Guía de Pruebas y PINs de Validación

### A. Acceso y Perfiles Dinámicos
1. **Registro e Inicio de Sesión Real (Supabase Auth):**
   En la pestaña **Registrarme**, crea un vecino indicando Nombre, Urbanización, Sector, Calle, Número, Teléfono y Rol (*Vecino Base* o *Junta Vecinal*). El sistema le asigna un **PIN único de 4 dígitos**, lo ubica en **Nivel 1: Vecino Nuevo** e insignia inicial **Bronce**, y personaliza el saludo y perfil en toda la app.
2. **Modo Demo Instantáneo:**
   Pulsa **"✨ Entrar en Modo Demo (Carlos • Calle Los Sauces 420)"** para ingresar con el perfil demostrativo de Carlos Mendoza (**PIN `4826`**, Nivel 3 Confianza Ganada con 18 Vistos Buenos e insignia **Plata** con 7 favores).

### B. Niveles de Confianza y Validación de Servicios con PIN
* **Nivel 1 — Vecino Nuevo (`0 - 4 Vistos Buenos`):** Etiqueta neutra, sin check azul.
* **Nivel 2 — Vecino Confiable (`5 - 14 Vistos Buenos`):** Se activa el check azul ✓ de verificación.
* **Nivel 3 — Profesional de Confianza (`15+ Vistos Buenos`):** Etiqueta verde *"Confianza Ganada"* y posicionamiento prioritario en la parte superior del directorio.

**PINs de prueba precargados en el directorio de Servicios:**
* **Don Mario Ramos** (Gasfitero Maestro): PIN **`3150`**
* **Lic. Lucía Méndez** (Enfermería a Domicilio): PIN **`7294`**
* **Ing. Alejandro Vega** (Electricista Colegiado): PIN **`9312`**

### C. Sistema de Incentivos en Solidaridad (Gamificación)
En el módulo **Solidaridad**, la confianza se presume (sin códigos). Al publicar un apoyo o confirmar *"Marcar como Recibido"*, el contador de favores del vecino sube dinámicamente actualizando su progreso e insignia en **Mi Perfil**:
* 🥉 **Bronce:** `1 a 4 favores` (Nivel Inicial)
* 🥈 **Plata:** `5 a 9 favores` (Vecino Solidario)
* 🥇 **Oro:** `10 a 19 favores` (Vecino Ejemplar)
* 🏆 **Héroe del Barrio:** `20+ favores` (Máxima Insignia Comunitaria)

---

## 🧠 4. Motor Analítico de Vulnerabilidad (`backend_analitica/`)

Script en Python que consulta las alertas geolocalizadas en **Supabase (PostGIS)** y ejecuta el algoritmo de clustering espacial **DBSCAN** (`eps = 500m`, métrica `haversine`, `min_samples = 3`) para detectar zonas críticas:

```bash
cd backend_analitica
pip install pandas numpy scikit-learn psycopg2-binary
python motor_vulnerabilidad.py
```
