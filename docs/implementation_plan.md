# Plan de Integración de Endpoints (Web -> Mobile)

Este plan tiene como objetivo estructurar la integración de todos los endpoints de nuestro backend en la aplicación móvil de **ExamInA**, adaptando la experiencia web a componentes y flujos de React Native.

Antes de avanzar con nuevas pantallas, también solucionaremos el problema visual detectado en la cuadrícula de racha del mes.

## User Review Required
> [!IMPORTANT]
> Lee el plan estructurado a continuación. El ecosistema es muy grande (Auth, Comunidad, Exámenes, Temario, etc.). Revisalo y **dime qué cambios o prioridades** quieres darle a la versión móvil respecto a la web para empezar a ejecutar.

## Open Questions
- ¿Deseas que la experiencia de tomar un examen ("Exam Session") mantenga el mismo flujo que en web, o prefieres un formato de "Tinder-swipe" o tarjetas (flashcards) para los simulacros rápidos en móvil?
- Para la sección de Comunidad, ¿usaremos un estilo tipo "Feed de Twitter/Instagram" aprovechando el *bottom tab* central?

---

## 1. Arreglo Inmediato de UI (Dashboard Lightbox)

El grid mensual está mostrando colores, pero faltan los números de los días o están rotos. Se corregirá ajustando el tamaño de los círculos y agregando un texto centrado.

#### [MODIFY] [dashboard.tsx](file:///Users/juanmontero/ExamInA/apps/mobile/app/(tabs)/dashboard.tsx)
- Se aumentará el tamaño de `modalMonthDay` a `24x24`.
- Se insertará un componente `<Text>` dentro para renderizar `new Date(day.date).getDate()` con un color contrastante (ej. blanco o gris oscuro).

---

## 2. Mapa de Endpoints y Estrategia de Integración Mobile

A continuación, se listan los módulos detectados en el backend, cómo se usan en Web, y cómo se adaptarán a la app móvil.

### Módulo: Autenticación, Perfil y Preferencias
**Endpoints:**
- `POST /auth/register`, `POST /auth/login`, `POST /auth/session`
- `GET /auth/me`, `GET /auth/profile/username-availability`
- `PUT /auth/profile`, `PUT /auth/preferences`

**Uso Web:** Gestión de acceso y pantalla completa de ajustes de perfil (foto, configuración).
**Plan Mobile:** 
- El login/registro ya está conectado. 
- Crearemos la pestaña de **Perfil** (4º tab) que incluirá la edición de usuario, avatar (usando carga de archivos nativa o cámara) y un modal inferior (BottomSheet) para preferencias rápidas (modo oscuro, notificaciones push).

### Módulo: Temario (Subjects & Topics)
**Endpoints:**
- `GET /subjects`
- `GET /subjects/:id/topics`

**Uso Web:** Vista de árbol navegable con las materias de la PAU y sus subtemas para elegir qué estudiar.
**Plan Mobile:**
- Pantalla **Temario** (2º tab). 
- Lista estilo acordeón (Expandable List) donde cada Materia se expande para mostrar los Temas. Tocar un tema abrirá una previsualización de progreso y la opción de generar un simulacro rápido.

### Módulo: Sesiones de Examen (Core)
**Endpoints:**
- `GET /questions`, `GET /questions/:id`, `POST /questions/generate-ai`
- `POST /exam-sessions` (Crear examen), `GET /exam-sessions/me` (Listar historial)
- `GET /exam-sessions/:id` (Cargar examen activo)
- `PATCH /exam-sessions/:id/activity` (Guardar progreso de respuestas)
- `PATCH /exam-sessions/:id/finish` (Entregar examen)
- `POST /corrections/evaluate-written-answer` (Corregir con IA)

**Uso Web:** Interfaz inmersiva de escritorio con temporizador, barra lateral de navegación de preguntas y editor enriquecido.
**Plan Mobile:**
- Pantalla **Exámenes** (3º tab) para listar exámenes oficiales y generar simulacros.
- **Flujo Inmersivo de Examen:** Ocultaremos la Bottom Bar durante el examen. Mostraremos una pregunta por pantalla con Swipe horizontal (o botones "Siguiente/Anterior"). 
- El temporizador estará fijo en el "Header". 
- Se enviará el `PATCH activity` en segundo plano cada vez que el usuario avance de pregunta para evitar pérdida de datos si se cierra la app.

### Módulo: Social y Comunidad (Amigos y Posts)
**Endpoints:**
- `GET /auth/friends`, `GET /auth/friends/pending`, `POST /auth/friends/request`, `POST /auth/friends/respond`
- `GET /community-posts`, `GET /community-posts/me`, `POST /community-posts`
- `POST /community-posts/:id/comments`, `POST /community-posts/:id/reactions`

**Uso Web:** Un foro/muro donde los alumnos comparten dudas y resoluciones de problemas.
**Plan Mobile:**
- **Feed / Modo Arquitecto:** Integrarlo en el Botón Central Flotante (FAB) o en el Dashboard.
- Crear una interfaz estilo *Social Feed* de desplazamiento infinito (FlatList) para ver las publicaciones de la comunidad.
- Agregar interacciones (Like/Reacciones) optimizadas para el dedo pulgar.

### Módulo: Notificaciones y Logros
**Endpoints:**
- `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`
- `GET /achievements/me`, `POST /achievements/me/evaluate`

**Uso Web:** Campana en el TopBar con popover. Medallas en el perfil.
**Plan Mobile:**
- La campana de `TopBar.tsx` abrirá una pantalla secundaria en modal (`expo-router` stack) con la lista de notificaciones.
- Los logros se mostrarán en una sección especial atractiva dentro de la pestaña de **Perfil** (con iconos SVG/Lottie animados cuando se desbloqueen).

---

## Verification Plan
1. Corregiremos la UI del `dashboard.tsx` y validaremos visualmente los números del mes.
2. Definiremos una ruta crítica empezando por la más urgente (p.ej. Temario y toma de Exámenes) y conectaremos los endpoints correspondientes de a uno usando React Query, tal cual el modelo web.
