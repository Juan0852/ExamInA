# ExamInA - Problemas actuales y deuda tecnica

Ultima revision: 2026-06-01.

Este documento centraliza problemas abiertos, riesgos tecnicos y decisiones pendientes. No reemplaza al roadmap: sirve para no perder contexto antes de priorizar el siguiente bloque de trabajo.

## Prioridad preliminar

| Prioridad | Problema | Area | Estado |
| --- | --- | --- | --- |
| Cerrado | Placeholders en flujos reales | Mobile/API | Cerrado 2026-06-02 |
| Cerrado | Auditoria de documentos vivos restantes | Docs | Cerrado 2026-06-02 |
| Cerrado | Backend permite reevaluar una pregunta IA dentro de la misma sesion | API/ExamSessions/Corrections | Cerrado 2026-06-02 |
| P1 | Heartbeat/tiempo de estudio incompleto en mobile | Mobile/API | Abierto |
| Cerrado | Imagenes subidas no persisten visualmente al reabrir sesion | Storage/Mobile/API | Cerrado 2026-06-02 |
| P1 | Endpoints actuales no estan inventariados contra implementacion real | API/Docs | Abierto |
| P1 | Seeds oficiales de examenes y limpieza de datos de prueba | API/DB | Abierto |
| P1 | Gestion de errores sin estrategia clara | API/Web/Mobile | Abierto |
| P1 | Validaciones incompletas en registro mobile | Mobile/Auth | Abierto |
| P1 | Token Firebase expirado justo despues del registro mobile | Mobile/Auth/API | Abierto |
| P1 | Onboarding post-registro faltante en mobile | Mobile/Auth/Profile | Abierto |
| P2 | Prisma/pg warning al iniciar o ejecutar API | API/DB | Abierto |
| P2 | Tokens visuales hardcodeados en frontends | Web/Mobile | Abierto |
| P2 | Estrategia de assets compartidos entre web/mobile | Monorepo | Abierto |
| P2 | Tecnologia del tablero/pizarra de examen | Mobile | En evaluacion |
| P3 | Logs de debug en parser/proveedor IA | API | Abierto |
| Cerrado | Mobile no pasa typecheck | Mobile | Cerrado 2026-06-01 |

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

El backend ya tiene endpoint para sincronizar actividad por `elapsedSeconds`, pero mobile no esta enviando heartbeat real.

Estado actual detectado:

- `exam/[id].tsx` llama `saveActivity(10)` al avanzar pregunta.
- No hay `setInterval` ni sincronizacion periodica.
- Si el usuario estudia una pregunta durante varios minutos y cierra sin avanzar, ese tiempo puede perderse.

Accion propuesta:

- Implementar heartbeat cada 30 segundos por sesion activa.
- Enviar tambien un ultimo sync al cerrar/salir del modo enfoque.
- El backend debe mantener el calculo por delta para evitar duplicar tiempo.

### 6. Imagenes subidas no persisten visualmente al reabrir sesion

Estado: cerrado el 2026-06-02.

Se conectó el flujo completo en la app móvil. Ahora, antes de llamar a la IA, la app sube cada adjunto (pizarra/galería) a S3 usando URLs prefirmadas (`/files/presign`) y confirma la subida (`/files/confirm`). Los IDs de S3 se envían a la evaluación, garantizando que la IA reciba las imágenes y que estas persistan en el historial de sesiones.

### 7. Endpoints actuales no inventariados contra implementacion real

El documento viejo de endpoints fue eliminado porque era una propuesta inicial y no reflejaba los controllers reales.

Accion propuesta:

- Listar todos los controllers actuales de `apps/api/src/modules`.
- Generar una tabla de endpoints implementados reales.
- Comparar contra endpoints requeridos por web y mobile.
- Marcar cada endpoint como:
  - implementado;
  - parcial;
  - faltante;
  - propuesto pero no necesario aun.

Nota:

- Este documento debe evitar exponer informacion sensible. Es documentacion interna de desarrollo, no documentacion publica de seguridad.

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
- Despues del registro no se esta llamando `getIdToken(true)` para forzar token fresco.
- La sesion local se crea antes de que Firebase termine de refrescar credenciales.
- El reloj del dispositivo/emulador esta desincronizado.
- El wrapper HTTP solo limpia sesion al detectar expiracion, pero no intenta refrescar token.
- Web y mobile tienen flujos distintos para obtener/renovar token.

Impacto:

- El usuario recien registrado puede quedar autenticado localmente pero bloqueado por la API.
- Cualquier endpoint protegido puede fallar con 401 aunque la UI crea que hay sesion.
- Dashboard puede parecer roto cuando el problema real es refresh de token.

Accion propuesta:

- Auditar flujo de register/login mobile.
- Usar Firebase client SDK como fuente de verdad del token.
- Forzar token fresco despues de register/login con `getIdToken(true)`.
- Antes de cada request protegida, considerar refresh si el token esta vencido o cerca de vencer.
- Si la API responde `auth/id-token-expired`, intentar refresh una vez y repetir request.
- Si el refresh falla, limpiar sesion y llevar al login con mensaje claro.

### 13. Onboarding post-registro faltante en mobile

Problema:

- Web tiene un formulario post-registro para completar perfil y preferencias, pero mobile aun no tiene ese flujo.

Contexto:

- En web, despues del registro se pregunta por materias, descripcion, datos opcionales de perfil y configuracion inicial.
- Ese flujo ayuda a completar el perfil y desbloquear/medir logros como perfil al 80%.
- Mobile actualmente puede dejar al usuario registrado pero sin capturar esa informacion inicial.

Impacto:

- La experiencia web y mobile queda inconsistente.
- Faltan datos de perfil/preferencias que luego usa dashboard, comunidad, recomendaciones y logros.
- El logro de completar perfil puede no dispararse correctamente desde mobile.

Accion propuesta:

- Auditar el onboarding web y replicar el flujo equivalente en mobile.
- Reutilizar el mismo contrato de API para perfil, preferencias y materias.
- Incluir pasos mobile para:
  - materias o asignaturas de interes;
  - nombre publico/perfil;
  - descripcion;
  - universidad objetivo si aplica;
  - avatar o placeholder;
  - preferencias iniciales.
- Al finalizar, evaluar logros y mostrar toast/feedback mobile cuando aplique.

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

## Siguiente paso recomendado

Antes de seguir agregando features, cerrar este orden:

1. Quitar o deshabilitar placeholders en flujos reales.
2. Arreglar auth mobile: refresh de token, validaciones de registro y onboarding post-registro.
3. Auditar documentos vivos.
4. Inventariar endpoints reales.
5. Arreglar flujo de imagenes persistentes y heartbeat.
