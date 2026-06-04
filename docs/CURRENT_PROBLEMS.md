# ExamInA - Problemas actuales y deuda tecnica

Ultima revision: 2026-06-03.

Este documento centraliza problemas abiertos, riesgos tecnicos y decisiones pendientes. No reemplaza al roadmap: sirve para no perder contexto antes de priorizar el siguiente bloque de trabajo.

## Prioridad preliminar

| Prioridad | Problema | Area | Estado |
| --- | --- | --- | --- |
| P1 | Gestion de errores sin estrategia clara | API/Web/Mobile | Abierto |
| P2 | Unificar UI Dashboard y Mensajes Racha | Web/Mobile | Abierto |
| P2 | Refactorizar Bottom Navigation Bar (Unir Temario y Exámenes) | Mobile | Abierto |
| P2 | Diccionario de frases motivacionales al login | Web/Mobile | Cerrado 2026-06-03 |
| P2 | Toasts globales de logros en mobile con paridad web | Mobile/Achievements | Abierto |
| P2 | Retirar Firebase Client SDK/config del frontend web | Web/Auth/API | Abierto |
| P2 | Prisma/pg warning al iniciar o ejecutar API | API/DB | Abierto |
| P2 | Tokens visuales hardcodeados en frontends | Web/Mobile | Abierto |
| P2 | Estrategia de assets compartidos entre web/mobile | Monorepo | Abierto |
| P2 | Tecnologia del tablero/pizarra de examen | Mobile | En evaluacion |
| P3 | Seeds oficiales de examenes y limpieza de datos de prueba | API/DB | Abierto (Diferido) |
| P3 | Micro-recompensas de XP (anti-farming) y Toasts | API/Web/Mobile | Idea |
| P3 | Logs de debug en parser/proveedor IA | API | Abierto |
| P1 | Feed/Comunidad: publicaciones tipo red social | API/Web/Mobile | Abierto |
| P1 | Modo Arquitecto de examenes en web | Web | Abierto |
| P2 | Sistema de amigos (Friends) | API/Web/Mobile | Abierto |
| P2 | Mejorar pantalla de perfil en mobile | Mobile | Abierto |
| P2 | Medallas y toasts de logros dentro del perfil mobile | Mobile/Achievements | Abierto |
| Cerrado | Placeholders en flujos reales | Mobile/API | Cerrado 2026-06-02 |
| Cerrado | Auditoria de documentos vivos restantes | Docs | Cerrado 2026-06-02 |
| Cerrado | Backend permite reevaluar una pregunta IA dentro de la misma sesion | API/ExamSessions/Corrections | Cerrado 2026-06-02 |
| Cerrado | Heartbeat/tiempo de estudio incompleto en mobile | Mobile/API | Cerrado 2026-06-02 |
| Cerrado | Imagenes subidas no persisten visualmente al reabrir sesion | Storage/Mobile/API | Cerrado 2026-06-02 |
| Cerrado | Endpoints actuales no estan inventariados contra implementacion real | API/Docs | Cerrado 2026-06-02 |
| Cerrado | Validaciones incompletas en registro mobile | Mobile/Auth | Cerrado 2026-06-02 |
| Cerrado | Token Firebase expirado al inicio de sesión | Mobile/Auth/API | Cerrado 2026-06-02 |
| Cerrado | Mobile no pasa typecheck | Mobile | Cerrado 2026-06-01 |
| Cerrado | Salida del modo examen web usaba reload bruto | Web/ExamSessions | Cerrado 2026-06-03 |
| Cerrado | Heartbeat podia inflar tiempo y desbloquear logros de estudio | API/Web/Mobile/Achievements | Cerrado 2026-06-03 |
| Cerrado | Onboarding post-registro faltante en mobile | Mobile/Auth/Profile | Cerrado 2026-06-03 |

## Problemas abiertos

Ver tambien `docs/EXAM_FLOW_AND_ENTITY_CONNECTIONS.md` para el mapa actual de entidades, conexiones y reglas pendientes alrededor de examenes.

### 1. Mobile no pasa typecheck

Estado: cerrado el 2026-06-01.

El typecheck de mobile fallaba por errores de dashboard, topbar, tabbar, exam, subject y whiteboard. Se corrigieron los bloqueos inmediatos.

Comando usado:

```bash
corepack pnpm --filter mobile typecheck
```

Errores corregidos:

- `dashboard.tsx` usa `summary.streak.longestCount`, pero el tipo actual de `streak` no lo tiene.
- `exam/[id].tsx` recibe `response` como `unknown` al evaluar con IA.
- `exam/[id].tsx` referencia estilos de navegacion que no existen.
- `subject/[id].tsx` falla porque `startExam` es placeholder y no retorna una sesion tipada.
- `CustomTabBar.tsx` requiere `@react-navigation/bottom-tabs`.
- `TopBar.tsx` usa `photoURL`, pero el modelo usa `photoUrl`.
- `TopBar.tsx` usa `StyleSheet.absoluteFillObject`, que no existe en la version actual.
- `WhiteboardModal.tsx` usa `ViewShot` como tipo de forma incorrecta.

Impacto:

- Ya no bloquea el arranque por typecheck.
- Siguen existiendo problemas funcionales separados: placeholders, auth token, onboarding y heartbeat.

Validacion:

```bash
corepack pnpm --filter mobile typecheck
```

Resultado: pasa correctamente.

### 2. Placeholders dentro de flujos reales

Estado: cerrado el 2026-06-02.

Se han eliminado o reemplazado los placeholders en flujos reales de la app móvil:
- El botón flotante (FAB) central ahora abre un Alert nativo de menú para elegir crear un examen (redirige a Temario) o una publicación.
- El botón de "Simulacro Rápido" en los detalles de la materia fue eliminado de la UI por decisión de producto.
- `login.tsx` ya utiliza autenticación real de Google.

### 3. Auditoria de documentos vivos

Estado: cerrado el 2026-06-02 por el usuario.

Se eliminaron los documentos obsoletos y se revisaron los vigentes. Ya no hay riesgo de desalineación entre el código y la documentación técnica actual.

### 4. Backend permite reevaluar una pregunta IA dentro de la misma sesion

Estado: cerrado el 2026-06-02.

Se confirmó mediante auditoría del código que la regla deseada ("Una pregunta por sesión") **ya está protegida en el backend**.
El método `findAnswerForSessionQuestion` en `PrismaCorrectionsRepository` ya verifica si existe una respuesta previa para la pregunta en la misma sesión y `CorrectionsService` devuelve un `409 ConflictException`. Además, el método de guardado utiliza `create` en lugar de `upsert`.

Referencia:

- `docs/EXAM_FLOW_AND_ENTITY_CONNECTIONS.md`

### 5. Heartbeat y tiempo de estudio incompletos en mobile

Estado: cerrado el 2026-06-02.

Se implementó con éxito el heartbeat en React Native (`exam/[id].tsx`).
- Se cuenta el tiempo de estudio de manera precisa con `setInterval`.
- Se envía el `elapsedSeconds` cada 15 segundos al backend mediante `syncActivity`.
- Se escucha el evento nativo `AppState` para sincronizar justo antes de enviar la app a background o cerrarla, evitando pérdida de tiempo.
- Se agregó el cronómetro visual en la TopBar para lograr paridad con la plataforma Web.

### 6. Imagenes subidas no persisten visualmente al reabrir sesion

Estado: cerrado el 2026-06-02.

Se conectó el flujo completo en la app móvil. Ahora, antes de llamar a la IA, la app sube cada adjunto (pizarra/galería) a S3 usando URLs prefirmadas (`/files/presign`) y confirma la subida (`/files/confirm`). Los IDs de S3 se envían a la evaluación, garantizando que la IA reciba las imágenes y que estas persistan en el historial de sesiones.

### 7. Endpoints actuales no inventariados contra implementacion real

Estado: cerrado el 2026-06-02.

Se ha generado el documento `docs/API_ENDPOINTS.md` mediante una auditoría real del código de los controladores backend (`apps/api/src/modules`). El documento lista todos los endpoints actuales, su estado de implementación y notas sobre casos faltantes descubiertos (como la ausencia de un controlador para actualizar datos de perfil de usuario sin depender del onboarding completo).

### 8. Seeds oficiales de examenes y limpieza de datos de prueba

Necesidad:

- Borrar examenes actuales de prueba.
- Crear examenes oficiales nuevos y consistentes.
- Tener seeders que puedan poblar examenes oficiales de forma repetible.

Riesgos:

- No se debe borrar informacion real de usuarios sin confirmacion explicita.
- Los seeds deben ser idempotentes para no duplicar materias, temas, preguntas o examenes.
- No deben correr automaticamente en cada inicio de API en produccion sin control.

Propuesta:

- Crear scripts separados:
  - `db:seed:subjects`
  - `db:seed:official-exams`
  - `db:seed:dev-reset-exams`
- En desarrollo, permitir reset manual.
- En produccion, ejecutar seed oficial solo como tarea controlada de despliegue/migracion, no en cada boot.

### 9. Gestion de errores sin estrategia clara

Actualmente no esta claro si existe una estrategia unificada de errores en API, web y mobile.

Preguntas abiertas:

- API: existe filtro global de excepciones?
- API: todas las respuestas de error siguen `{ data, meta, error }`?
- API: hay codigos estables de error para frontend?
- Web/mobile: existe mapper comun para errores de API?
- Web/mobile: como se decide toast, inline error, modal o fallback screen?

Problemas detectados:

- `CorrectionsService` usa `NotFoundException` para fallos de IA.
- Algunos errores se loguean como debug directamente.
- Falta distinguir error de validacion, auth, recurso inexistente, proveedor externo y error inesperado.

Accion propuesta:

- Implementar filtro global de errores en API.
- Definir codigos internos: `VALIDATION_ERROR`, `AUTH_REQUIRED`, `RESOURCE_NOT_FOUND`, `AI_PROVIDER_ERROR`, `STORAGE_ERROR`, etc.
- Crear helpers en frontends para normalizar errores.

### 10. Prisma/pg warning al iniciar o ejecutar API

Problema reportado:

```txt
DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0.
```

Contexto probable:

- Proyecto usa Prisma 7 con `@prisma/adapter-pg`.
- El warning puede venir de la combinacion Prisma adapter + `pg` o de reutilizacion incorrecta de cliente/conexion.

Accion propuesta:

- Identificar si el warning aparece en boot, queries concurrentes, seeders o migraciones.
- Revisar `PrismaService` y la forma de instanciar `PrismaPg`.
- Verificar versiones de `@prisma/client`, `@prisma/adapter-pg`, `prisma` y `pg`.
- Si es bug de dependencia, documentar workaround y version objetivo.

### 11. Validaciones incompletas en registro mobile

Problema:

- El registro mobile aun no tiene las mismas comprobaciones de calidad y claridad que el flujo web.

Requerimientos detectados:

- Validar formato completo del correo electronico.
- Validar dominio del correo cuando aplique una regla de negocio concreta.
- Pedir la contraseña dos veces y bloquear registro si no coinciden.
- Mostrar una barra de seguridad de contraseña similar a la creada en web.
- Mostrar un dialogo/desplegable informativo con los requisitos de registro/inicio de sesion.
- Alinear mensajes de error con Firebase/API para que el usuario entienda que corregir.

Impacto:

- Usuarios pueden fallar registros por errores evitables.
- Mobile puede aceptar inputs que luego Firebase/API rechazan.
- La UX queda inconsistente entre web y mobile.

Accion propuesta:

- Auditar pantalla de register mobile.
- Extraer reglas de password/email a helper reusable.
- Crear componente visual de password strength para mobile.
- Agregar confirmacion de password.
- Agregar dialogo de requisitos con copy claro y no tecnico.

### 12. Token Firebase expirado justo despues del registro mobile

Estado: reforzado el 2026-06-03 tras reproducirse en endpoints protegidos de mobile.

Problema reportado:

```txt
HTTP request error on path: /dashboard/streak/months?offset=0
Firebase ID token has expired. Get a fresh ID token from your client app and try again (auth/id-token-expired).
```

Contexto:

- El error aparece apenas despues de registrar usuario en mobile.
- El dashboard llama endpoints protegidos como `/dashboard/summary` y `/dashboard/streak/months`.
- La API rechaza el token porque Firebase Admin lo considera expirado.

Hipotesis a revisar:

- Mobile esta guardando un ID token viejo en `AsyncStorage`.
- La sesion local se crea con un ID token que puede expirar mientras la app sigue abierta.
- El reloj del dispositivo/emulador esta desincronizado.
- El wrapper HTTP solo limpia sesion al detectar expiracion, pero no intenta refrescar token.
- Web y mobile tienen flujos distintos para obtener/renovar token.

Impacto:

- El usuario recien registrado puede quedar autenticado localmente pero bloqueado por la API.
- Cualquier endpoint protegido puede fallar con 401 aunque la UI crea que hay sesion.
- Dashboard puede parecer roto cuando el problema real es refresh de token.

Accion propuesta:

- Auditar flujo de register/login mobile.
- Usar el backend como fuente de verdad para refrescar el token.
- Antes de cada request protegida, considerar refresh si el token esta vencido o cerca de vencer.
- Si la API responde `auth/id-token-expired`, intentar refresh una vez y repetir request.
- Si el refresh falla, limpiar sesion y llevar al login con mensaje claro.

Actualizacion aplicada:

- `apps/mobile/src/services/api.service.ts` ahora decodifica el JWT y refresca proactivamente si el token expira en menos de 120 segundos.
- Si la API responde `auth/id-token-expired`, mobile fuerza refresh y reintenta la request una vez.
- Se evita limpiar sesion por un fallo de refresh en una query de fondo; asi una llamada como `/exam-sessions/me` no expulsa al usuario automaticamente.
- El refresh ahora pasa por `POST /auth/refresh`; `FIREBASE_WEB_API_KEY` queda en `apps/api/.env` y no en mobile.

### 13. Onboarding post-registro faltante en mobile

Estado: cerrado el 2026-06-03.

Problema:

- Web tenia un formulario post-registro para completar perfil y preferencias, pero mobile no estaba replicando el flujo real.
- El backend crea `profile` desde el registro, asi que mobile podia saltarse onboarding si solo revisaba `user.profile`.
- El avatar mobile usaba un endpoint viejo (`/files/upload/avatar`) en vez del flujo real de archivos.

Solucion aplicada:

- La navegacion mobile ahora usa `preferences.onboardingCompleted` como fuente de verdad.
- Login, register, Google auth, index y layout redirigen a `/onboarding` si el usuario aun no completo onboarding.
- Onboarding mobile quedo en 4 pasos: asignaturas, ritmo semanal, origen de registro y perfil.
- Se eliminaron materias fallback falsas; si `/subjects` falla, se muestra estado de error y reintento.
- La foto de perfil usa el flujo real de S3: `/files/presign`, subida al bucket y `/files/confirm`.
- El perfil mantiene la regla de logro al 80%: nombre publico, descripcion suficiente e imagen.
- Al finalizar se guarda en `/auth/onboarding/complete`, se actualiza la sesion local y se evalua `/achievements/me/evaluate`.

Validacion:

```bash
corepack pnpm --filter mobile typecheck
```

Resultado: pasa correctamente.

### 14. Tokens visuales hardcodeados en frontends

Problema:

- Hay colores, radios, sombras, medidas y tamanos hardcodeados en componentes web/mobile.
- Esto complica mantener consistencia visual y redisenar.

Estado actual:

- Existe `docs/FRONTEND_STYLE_GUIDE.md` con tokens visuales.
- Mobile tiene `src/theme`, pero no todo lo usa.
- Web puede tener tokens/Tailwind/CSS variables, pero hay que auditarlo.

Accion propuesta:

- Definir fuente unica por frontend:
  - Web: CSS variables/Tailwind theme o archivo de tokens.
  - Mobile: `src/theme` con `colors`, `spacing`, `radius`, `typography`, `shadows`.
- Reemplazar hardcodes gradualmente cuando se toque cada pantalla.
- No frenar el producto por refactor masivo, pero bloquear nuevos hardcodes innecesarios.

### 15. Estrategia de assets compartidos entre web/mobile

Pregunta:

- Mover todos los assets a la raiz y consumirlos desde web/mobile.

Estado:

- Ya existe carpeta raiz `assets/brand`.
- Mobile tambien tiene assets propios dentro de `apps/mobile/assets`.

Riesgos:

- Expo/Metro necesita resolver assets estaticos correctamente en build Android/iOS.
- `require()` en React Native funciona mejor con rutas estaticas conocidas.
- Assets fuera de `apps/mobile` pueden requerir configurar Metro `watchFolders`/resolver.
- Web y mobile no siempre procesan SVG/GLB/PNG igual.

Propuesta:

- Mantener assets de marca compartidos en `assets/brand`.
- Para mobile, usar una capa explicita de imports o copiar assets necesarios al bundle mobile si Metro da problemas.
- No mover todo de golpe hasta probar build mobile.
- Definir categorias:
  - `assets/brand`: logos, favicon, marca compartida.
  - `assets/3d`: GLB compartidos si web/mobile los soportan.
  - `apps/mobile/assets`: assets especificos de Expo/mobile.
  - `apps/web/src/assets` o equivalente: assets exclusivos de web.

### 16. Tecnologia del tablero/pizarra de examen

Tecnologia actual detectada:

- `react-native-svg` para dibujar trazos.
- `PanResponder`/responders de React Native para capturar input tactil.
- `react-native-view-shot` para exportar la pizarra como imagen.
- `expo-screen-orientation` para forzar landscape durante el tablero.

Ventajas actuales:

- Funciona como MVP.
- Pocas piezas conceptuales.
- Exportar imagen con `view-shot` es directo.

Riesgos:

- Puede sufrir con muchos trazos.
- Borrador actual pinta blanco encima, no borra vectorialmente.
- No hay capas, undo/redo, zoom, palm rejection, grosor/color ni optimizacion avanzada.
- Puede sentirse menos fluido en Android gama media.

Alternativas:

- `@shopify/react-native-skia`: mejor rendimiento, canvas real, ideal para dibujo serio.
- `react-native-gesture-handler` + `react-native-reanimated`: mejor input y animaciones, especialmente combinado con Skia.
- WebView con canvas HTML: rapido de prototipar, pero peor integracion nativa.

Decision preliminar:

- Mantener la implementacion actual para MVP si el rendimiento es aceptable.
- Evaluar migracion a Skia si el tablero se vuelve central para matematicas/fisica/quimica.

### 17. Logs de debug en IA/parser

Problema:

- Hay logs de debug en parser de respuestas IA y catch de correcciones.
- Pueden exponer respuestas crudas del LLM o ruido excesivo.

Accion propuesta:

- Dejar logs controlados por variable de entorno.
- No imprimir payloads completos en produccion.
- Convertir errores de proveedor IA a `AI_PROVIDER_ERROR`.

## Decisiones pendientes

- Confirmar si el heartbeat mobile sera cada 30 segundos.
- Decidir si el tablero actual se queda para MVP o se migra a Skia antes.
- Decidir politica final para assets compartidos.
- Definir si los seeds oficiales corren solo manualmente o tambien en bootstrap de desarrollo.
- Revisar que documentos de `docs/` son fuente de verdad.
- Definir contrato final de errores API/frontend.

### 18. Micro-recompensas de XP independientes por acciones y Toasts (anti-farming)

Estado: Idea (dejado para el futuro).

Propuesta de nueva feature:
- Otorgar pequenas recompensas de XP ("micro-recompensas") por acciones aisladas: crear examenes, responder preguntas, crear posts en la comunidad, anadir el primer amigo, el 10mo amigo, etc. (independientemente de las medallas).
- Mostrar notificaciones ("Toasts") atractivos cada vez que se gane XP de esta manera en la interfaz.
- Mobile debe tener el mismo sistema global de toasts de logros que web: notificacion especial animada, medalla, XP y auto-cierre. No debe resolverse con pantallas finales sueltas dentro de flujos como onboarding.
- El onboarding mobile puede evaluar `/achievements/me/evaluate`, pero la presentacion visual debe quedar delegada al provider/hook global de achievements cuando se implemente.

Riesgos detectados y reglas de negocio (Anti-Farming):
- Los usuarios podrian anadir/eliminar amigos o crear/borrar posts masivamente solo para farmear puntos de XP. Se deben controlar o limitar las veces que una accion otorga puntos de forma permanente por entidad.
- Para el caso de los examenes completos, se requiere una funcion matematica decreciente. Si es el intento #70 de un examen oficial, no deberia otorgar los mismos puntos que el primer o segundo intento.
- Se requiere disenar cuidadosamente los algoritmos y limites diarios/semanales de farmeo.

### 19. Toasts globales de logros en mobile con paridad web

Estado: Abierto

Problema:
Mobile aun no tiene el sistema global de achievement toasts que ya se planteo para la app y que web usa como referencia visual. Al terminar onboarding se estaba mostrando un bloque final de "Logro desbloqueado", pero esa UX no corresponde: los logros deben aparecer como notificaciones especiales de la app, no como contenido fijo de la pantalla de cierre.

Requerimientos:
- Crear un provider global en mobile para encolar logros desbloqueados.
- Reutilizar el contrato `meta.newlyUnlockedAchievements` de las respuestas de API.
- Toast animado desde arriba, medalla SVG/redonda, XP ganado y auto-cierre.
- Mantener paridad visual y de comportamiento con web.
- Conectar onboarding, examenes, comunidad y perfil al mismo mecanismo.

### 20. Retirar Firebase Client SDK/config del frontend web

Estado: Abierto

Problema:
Mobile ya no requiere `EXPO_PUBLIC_FIREBASE_API_KEY`, pero web todavia usa `firebase-client.service.ts` para inicializar Firebase client SDK y abrir login/registro con Google. Esto requiere `VITE_FIREBASE_API_KEY` y otras variables `VITE_FIREBASE_*` en el bundle web.

Nota de seguridad:
La API key web de Firebase no es una credencial secreta como `FIREBASE_PRIVATE_KEY` o el JSON de service account, pero bajo nuestra arquitectura backend-first no queremos que los frontends dependan de Firebase directamente.

Accion propuesta:
- Reemplazar el login Google web basado en Firebase client SDK por un flujo OAuth/Google Identity que entregue `idToken` al backend.
- Mantener `/auth/google` como unico punto de intercambio con Firebase.
- Eliminar `firebase-client.service.ts`, `VITE_FIREBASE_*` y la dependencia `firebase` del frontend web si ya no se usa para nada mas.
- Mantener Firebase Admin y `FIREBASE_WEB_API_KEY` solo en `apps/api`.

### 21. Unificar UI del Dashboard y Mensaje de Racha (Web/Mobile)

Estado: Abierto

Problema:
La UI del Dashboard difiere demasiado entre Web y Mobile. Por ejemplo:
- La tarjeta de "Racha de estudio" tiene diferencias visuales marcadas.
- En Web se añadió el estado vacío de racha con el mensaje "Haz un examen por temas o oficial para comenzar tu racha de estudio", pero Mobile aún no lo tiene.
- Falta la Progress Bar del XP faltante para subir de nivel en el Dashboard y Perfil de Mobile.

Impacto: Fragmentación de la UX/UI entre plataformas.

### 22. Refactorizar Bottom Navigation Bar en Mobile

Estado: Abierto

Problema:
La barra de navegación inferior (Bottom Bar) de Mobile tiene separados "Temario" y "Exámenes" como secciones independientes, pero a nivel de UX deben agruparse bajo un solo concepto de "Exámenes" (ya que ambos son exámenes).

Impacto: Confusión en la navegación para el usuario móvil.

### 23. Diccionario de frases motivacionales al inicio de sesión

Estado: cerrado el 2026-06-03.

Problema:
Se requería implementar (y unificar en ambas plataformas) el diccionario de 30 frases motivacionales que se muestran al entrar al dashboard.

Solución aplicada:
- Mobile ya contaba con el diccionario en el dashboard.
- Web: se añadió el array `GREETINGS` de 30 frases en `DashboardPage.tsx`, seleccionando una aleatoria con `useMemo`. Se usa solo el primer nombre del usuario para personalizar.
- Ambas plataformas muestran ahora frases motivacionales dinámicas al cargar el dashboard.

Impacto: Paridad de engagement entre web y mobile.

### 24. Salida del modo examen web usaba reload bruto

Estado: cerrado el 2026-06-03.

Problema:

- Al salir de una sesion de examen, la URL podia cambiar a `/dashboard`, pero visualmente el overlay fijo del modo enfoque podia quedarse en pantalla.
- Se habia usado `window.location.href = "/dashboard"` como workaround, lo que fuerza un reload completo del navegador.
- Ese enfoque rompe el flujo SPA de React y puede ocultar problemas reales de estado/navegacion.

Solucion aplicada:

- Se reemplazo el reload por navegacion declarativa de React Router con `<Navigate to="/dashboard" replace />`.
- Se centralizo la salida en `leaveExam()` para sincronizar actividad, cerrar modal y activar la redireccion.
- `handleFinish()` intenta finalizar la sesion y luego redirige por Router, sin recargar la app.

Validacion:

```bash
corepack pnpm --filter web typecheck
```

Resultado: pasa correctamente.

### 25. Heartbeat podia inflar tiempo y desbloquear logros de estudio

Estado: cerrado el 2026-06-03.

Problema:

- Los logros `STUDY_1_HOUR` y `STUDY_10_HOURS` usan `UserProgress.totalStudyTimeSeconds`.
- Los umbrales eran correctos: 1 hora = `3600`, 10 horas = `36000`.
- El riesgo estaba en el acumulador de tiempo: `syncActivity` calculaba delta y luego hacia `increment`.
- Dos heartbeats concurrentes podian leer el mismo `totalTimeSeconds` y sumar dos veces el mismo delta.
- Ademas se aceptaban saltos de hasta 6 horas por sync, demasiado para un heartbeat de estudio activo.

Solucion aplicada:

- `syncActivity` ahora usa actualizacion optimista contra el `totalTimeSeconds` leido.
- Si otro heartbeat actualizo primero, el segundo no incrementa progreso.
- El maximo aceptado por sync bajo a 5 minutos.
- Si un cliente manda un salto mayor, ese delta se ignora en vez de caparlo y seguir sumando.
- Web y mobile bloquean syncs concurrentes con `isActivitySyncingRef`.
- Mobile ahora espera `mutateAsync` y usa `response.data.totalTimeSeconds`, igual que web.

Validacion:

```bash
corepack pnpm --filter api typecheck
corepack pnpm --filter web typecheck
corepack pnpm --filter mobile typecheck
```

Resultado: pasan correctamente.

### 26. Feed/Comunidad: publicaciones tipo red social

Estado: Abierto

Problema:
No existe un feed social dentro de la aplicacion. Se necesita un espacio tipo Facebook/Instagram donde los usuarios puedan crear publicaciones, compartir su progreso, hacer preguntas y interactuar con la comunidad.

Requerimientos:
- Disenar modelo de datos para posts (texto, imagenes, autor, timestamps, likes, comentarios).
- Crear endpoints CRUD en la API para publicaciones.
- Implementar la pantalla de Feed tanto en Web como en Mobile.
- Decidir si los posts seran publicos, por asignatura, o por grupo de amigos.
- Moderar contenido (reportar, ocultar, borrar).
- Paginacion infinita con scroll.

Impacto: Feature core de engagement y retencion. Sin esto, la app es solo un sistema de examenes individual.

Branch sugerida: `feature/feed-community`

### 27. Modo Arquitecto de examenes en web

Estado: Abierto

Problema:
En web no existe el "Modo Arquitecto" para crear o gestionar examenes de forma visual. Actualmente los examenes solo se pueden insertar por seed o directamente en la base de datos.

Requerimientos:
- Pantalla en web donde un usuario con rol adecuado pueda disenar examenes: seleccionar materia, tema, tipo de preguntas, anadir preguntas manualmente o asistido por IA.
- Preview del examen antes de publicarlo.
- Gestion de borradores.
- Decidir si es exclusivo para administradores/profesores o si cualquier usuario puede crear examenes personalizados.

Impacto: Sin esto, no hay forma de crear contenido desde la propia plataforma.

Branch sugerida: `feature/architect-mode-web`

### 28. Sistema de amigos (Friends)

Estado: Abierto

Problema:
No existe un sistema de relaciones sociales entre usuarios. Los usuarios no pueden encontrar, agregar ni interactuar con otros usuarios.

Requerimientos:
- Modelo de datos para relaciones de amistad (solicitud, aceptacion, bloqueo).
- Endpoints en API: enviar solicitud, aceptar/rechazar, listar amigos, buscar usuarios.
- UI en Web y Mobile para buscar usuarios, ver solicitudes pendientes y lista de amigos.
- Decidir si la amistad es bidireccional (ambos aceptan) o unidireccional (seguir).
- Integrar con el feed (ver posts de amigos) y con logros (medallas sociales).
- Proteccion anti-farming de XP por agregar/eliminar amigos.

Impacto: Base para todas las features sociales (feed filtrado, rankings, retos entre amigos).

Branch sugerida: `feature/friends-system`

### 29. Mejorar pantalla de perfil en mobile

Estado: Abierto

Problema:
La pantalla de perfil en mobile es funcional pero basica. Necesita mejoras visuales y de contenido para estar al nivel del resto de la app.

Requerimientos:
- Redisenar la UI del perfil con un look mas premium (cabecera con avatar grande, stats visuales, etc.).
- Mostrar estadisticas clave: nivel, XP, racha, tiempo de estudio, examenes completados.
- Boton de editar perfil con formulario completo.
- Seccion de medallas/logros obtenidos.
- Boton de cerrar sesion y gestion de cuenta.
- Progress bar de XP para el siguiente nivel.

Impacto: El perfil es la "casa" del usuario; si se ve pobre, toda la app se siente incompleta.

Branch sugerida: `feature/mobile-profile-v2`

### 30. Medallas y toasts de logros dentro del perfil mobile

Estado: Abierto

Problema:
Las medallas existen en el backend y se evaluan correctamente, pero en mobile no se muestran de forma apropiada en el perfil ni se notifican al usuario con toasts animados.

Requerimientos:
- Mostrar la coleccion de medallas en el perfil de mobile (obtenidas y bloqueadas).
- Crear un provider global de toasts de logros (reutilizar contrato `meta.newlyUnlockedAchievements`).
- Toast animado desde arriba con icono de medalla, nombre del logro, XP ganado y auto-cierre.
- Conectar todos los flujos que evaluan logros (examenes, onboarding, perfil, estudio) al mismo mecanismo de toast.
- Paridad visual con el sistema de toasts que se defina para web.

Impacto: Sin esto, los logros son invisibles para el usuario en mobile, eliminando el factor de gamificacion.

Branch sugerida: `feature/mobile-achievements-ui`

## Siguiente paso recomendado

Orden sugerido teniendo en cuenta dependencias:

1. Mejorar pantalla de perfil mobile (base para mostrar medallas y stats).
2. Medallas y toasts de logros en mobile (necesita perfil listo).
3. Feed/Comunidad (feature core de engagement, backend + ambas plataformas).
4. Sistema de amigos (se integra con el feed).
5. Modo Arquitecto en web (creacion de contenido desde la plataforma).
6. Gestion de errores unificada (deuda tecnica transversal).
7. Unificar UI del dashboard entre web y mobile.
