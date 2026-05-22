# ExamInA - Plan maestro del proyecto

## 1. Identidad del proyecto

**Nombre:** ExamInA

**Tagline:** Estudia. Practica. Aprueba.

ExamInA será una plataforma para preparar Selectividad/PAU mediante flashcards, preguntas tipo examen, simulacros y corrección asistida por IA.

El objetivo principal es que el estudiante pueda practicar con preguntas reales o adaptadas de exámenes de Selectividad/PAU, especialmente de materias como Matemáticas, Biología y Física.

## 2. Objetivo general

ExamInA debe permitir que el estudiante:

- estudie con flashcards;
- responda preguntas individuales;
- haga simulacros o exámenes completos;
- reciba corrección asistida por IA;
- revise sus errores;
- vea palabras clave faltantes;
- reciba recomendaciones de mejora;
- revise exámenes anteriores finalizados;
- consulte su progreso;
- suba imágenes de sus respuestas para una futura revisión OCR/LLM;
- tenga perfil, nivel, experiencia, rachas y amigos.

La IA no debe limitarse a decir si una respuesta es correcta o incorrecta. Debe comparar la respuesta del estudiante con:

- la solución esperada;
- los criterios de corrección;
- las palabras clave;
- el procedimiento esperado;
- los errores comunes.

Ejemplo de feedback esperado:

> El resultado final no coincide con la solución esperada. El error parece estar en el paso donde simplificas la fracción: eliminaste un término que no era factor común. Revisa esa parte antes de sustituir el valor de x.

## 3. Stack tecnológico

### Monorepo

- pnpm workspaces
- Turborepo
- TypeScript

### Backend

- NestJS
- Prisma
- Supabase PostgreSQL como base de datos
- Firebase Admin para verificar autenticación
- Zod para validación

### Frontend web

- React
- Vite
- TypeScript
- React Router
- Zustand
- TanStack Query
- Zod
- Tailwind CSS
- React Three Fiber + Drei solo para el logo 3D de la landing

### Mobile

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- TanStack Query
- Zod
- AsyncStorage si hace falta
- Expo ImagePicker o Camera más adelante

### Servicios externos

- Firebase Auth para autenticación
- Supabase PostgreSQL solo como base de datos
- AWS S3 para almacenamiento de archivos mediante presigned URLs
- OpenAI API o proveedor LLM desacoplado
- OCR desacoplado, inicialmente mock o futuro

## 4. Estructura general deseada

```txt
examina/
  apps/
    api/
    web/
    mobile/
  package.json
  pnpm-workspace.yaml
  README.md
```

La raiz del monorepo solo debe orquestar comandos. No se deben crear `packages/` compartidos en la fundacion inicial.

`package.json` raiz esperado:

```json
{
  "name": "examina",
  "private": true,
  "scripts": {
    "dev:api": "pnpm --filter api dev",
    "dev:web": "pnpm --filter web dev",
    "dev:mobile": "pnpm --filter mobile start"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

Cada aplicacion tendra su propio `package.json`:

```txt
apps/
  api/
    package.json
  web/
    package.json
  mobile/
    package.json
```

## 5. Reglas de autenticación

Firebase se utilizará siempre para autenticación.

Supabase no se usará para autenticación. Supabase se usará únicamente como PostgreSQL gestionado para guardar las tablas de la aplicación.

Firebase Auth debe permitir:

- inicio de sesión con Google;
- inicio de sesión con email y contraseña.

Ambos métodos deben convivir.

No se deben guardar contraseñas en la base de datos de ExamInA. Las contraseñas las gestiona Firebase Auth.

### Flujo de autenticación

1. Web o mobile hacen login con Firebase Auth.
2. Firebase devuelve un ID token.
3. El frontend manda ese token al backend.
4. El backend verifica el token usando Firebase Admin.
5. El backend obtiene el `firebaseUid`.
6. El backend busca o crea el usuario correspondiente en Supabase PostgreSQL usando Prisma.
7. Todas las tablas de negocio viven en Supabase PostgreSQL.

El backend no debe depender directamente de Firebase en todas sus carpetas de feature. Debe existir una interfaz:

```ts
AuthProvider {
  verifyToken(token: string): Promise<AuthUser>
}
```

Implementación inicial:

```txt
firebase-auth.provider.ts
```

No se creará implementación de Supabase Auth.

## 6. Arquitectura de providers y conectores

Todos los servicios externos deben aislarse mediante interfaces y providers.

La lógica de negocio no debe depender directamente de:

- Firebase;
- OpenAI;
- AWS S3;
- OCR;
- Prisma.

ExamInA será inicialmente un monolito modular bien separado, no un sistema de microservicios.

### Entornos de desarrollo y debugging

Durante desarrollo y debugging, es probable usar servicios locales para probar más rápido y con menos coste:

- PostgreSQL local en lugar de Supabase PostgreSQL;
- un LLM local en lugar de OpenAI u otro proveedor remoto;
- mocks para OCR, storage o corrección cuando todavía no haga falta integrar servicios reales.

Esto no debe cambiar la estructura principal. La aplicación debe seguir dependiendo de interfaces y providers, no de implementaciones concretas.

La decisión entre servicios locales y servicios cloud debe resolverse por configuración de entorno.

Ejemplos:

- En desarrollo: `LocalPostgres` + `LocalLlmProvider` o `MockCorrectionProvider`.
- En producción: Supabase PostgreSQL + `OpenAICorrectionProvider`.

El objetivo es que el backend pueda cambiar entre proveedores locales, mocks y proveedores reales sin modificar los casos de uso ni la lógica de negocio.

### Providers esperados

#### AuthProvider

- Interfaz para verificar tokens de autenticación.
- Implementación inicial: `FirebaseAuthProvider`.

#### CorrectionProvider o LlmProvider

- Interfaz para evaluar respuestas con IA.
- Implementación inicial: `OpenAICorrectionProvider`.
- Implementación mock para pruebas: `MockCorrectionProvider`.

#### StorageProvider

- Interfaz para generar URLs firmadas y manejar archivos.
- Implementación inicial: `S3StorageProvider`.

#### OcrProvider

- Interfaz futura para extraer texto desde imágenes.
- Implementación futura: `AwsTextractProvider` o `GoogleVisionProvider`.
- Implementación mock para pruebas.

#### Database

- Prisma conectado a Supabase PostgreSQL.
- Supabase se usa solo como PostgreSQL gestionado, no como auth.

## 7. Ownership del backend y codigo compartido

### Base de datos en `apps/api`

La base de datos pertenece exclusivamente al backend.

Prisma, migraciones y seed data deben vivir dentro de `apps/api`.

Esto evita que `apps/web` o `apps/mobile` puedan depender accidentalmente de Prisma, PostgreSQL o detalles internos de persistencia.

Estructura esperada:

```txt
apps/api/
  prisma/
    schema.prisma
    migrations/
  src/
    shared/
      database/
        prisma.service.ts
```

Regla:

Web y mobile solo pueden hablar con la base de datos mediante endpoints de `apps/api`.

### Backend-owned providers

Los providers de infraestructura pertenecen a `apps/api`.

Esto incluye:

- `AuthProvider`;
- `CorrectionProvider` o `LlmProvider`;
- `StorageProvider`;
- `OcrProvider`;
- implementaciones Firebase Admin, OpenAI, S3, OCR y mocks backend.

Ubicación esperada:

```txt
apps/api/src/shared/providers/
  auth/
    auth-provider.interface.ts
    firebase-auth.provider.ts
  ai/
    correction-provider.interface.ts
    openai-correction.provider.ts
    mock-correction.provider.ts
  storage/
    storage-provider.interface.ts
    s3-storage.provider.ts
  ocr/
    ocr-provider.interface.ts
    mock-ocr.provider.ts
```

Regla:

No crear paquetes compartidos para auth, admin, IA, storage, OCR, Prisma, repositories, services, controllers, DTOs, mappers o entidades de API.

Si mas adelante se decide extraer codigo compartido, debe hacerse con una razon concreta y confirmacion explicita del usuario. La fundacion inicial no debe incluir `packages/`.

## 8. Arquitectura del backend

El backend debe usar una estructura modular similar a Spring Boot.

Conceptos esperados:

- controllers;
- services;
- DTOs;
- entities;
- mappers;
- repositories;
- module files de NestJS;
- providers compartidos para integraciones externas.

Estructura general:

```txt
apps/api/src/
  modules/
    auth/
    users/
    profiles/
    preferences/
    friends/
    subjects/
    topics/
    questions/
    attempts/
    corrections/
    exam-sessions/
    files/
    progress/
    achievements/
  shared/
    database/
      prisma.service.ts
    providers/
      auth/
      ai/
      storage/
      ocr/
    config/
    errors/
    guards/
    logger/
    utils/
  app.module.ts
  main.ts
```

Cada carpeta importante dentro de `apps/api/src/modules/` debe seguir esta estructura:

```txt
module-name/
  controllers/
    module-name.controller.ts
  dtos/
    create-module-name.dto.ts
    update-module-name.dto.ts
    module-name-response.dto.ts
  entities/
    module-name.entity.ts
  mappers/
    module-name.mapper.ts
  repositories/
    module-name.repository.ts
    prisma-module-name.repository.ts
  services/
    module-name.service.ts
  module-name.module.ts
```

### Responsabilidad de cada carpeta

#### `controllers/`

Contiene los controllers HTTP de NestJS:

- rutas;
- validacion de entrada;
- guards aplicados al endpoint;
- traduccion entre HTTP y servicios.

#### `dtos/`

Contiene contratos de entrada y salida:

- request DTOs;
- response DTOs;
- DTOs internos cuando hagan falta;
- schemas Zod si se usan para validar esos contratos.

#### `entities/`

Contiene las entidades de negocio de esa carpeta, separadas del modelo Prisma.

No deben ser simples copias automáticas de Prisma si hay reglas de negocio relevantes.

#### `mappers/`

Convierte entre:

- modelos Prisma;
- entidades;
- DTOs de respuesta;
- estructuras esperadas por providers externos.

#### `repositories/`

Contiene interfaces e implementaciones de persistencia de esa carpeta.

Convención:

- `question.repository.ts` define el contrato.
- `prisma-question.repository.ts` implementa el contrato usando Prisma.

#### `services/`

Contiene la lógica de esa parte de la API:

- crear una pregunta;
- listar preguntas;
- evaluar una respuesta;
- iniciar un examen;
- finalizar un examen;
- enviar solicitud de amistad;
- actualizar progreso.

Si un servicio crece demasiado, se puede dividir por responsabilidad dentro de `services/`, pero no se debe crear una carpeta `use-cases/` por defecto.

### Ejemplo de `questions`

```txt
questions/
  controllers/
    questions.controller.ts
  dtos/
    create-question.dto.ts
    update-question.dto.ts
    question-response.dto.ts
  entities/
    question.entity.ts
  mappers/
    question.mapper.ts
  repositories/
    question.repository.ts
    prisma-question.repository.ts
  services/
    questions.service.ts
  questions.module.ts
```

### Ejemplo de `corrections`

```txt
corrections/
  controllers/
    corrections.controller.ts
  dtos/
    evaluate-answer.dto.ts
    correction-response.dto.ts
  entities/
    correction.entity.ts
    correction-score.vo.ts
  mappers/
    correction.mapper.ts
  repositories/
    correction.repository.ts
    prisma-correction.repository.ts
  services/
    corrections.service.ts
  corrections.module.ts
```

Las carpetas de `apps/api/src/modules/` deben consumir interfaces, no implementaciones concretas:

- La parte de corrections depende de `CorrectionProvider`, no de OpenAI directamente.
- La parte de files depende de `StorageProvider`, no de AWS S3 directamente.
- La parte de auth depende de `AuthProvider`, no de Firebase Admin directamente en todos lados.

Las implementaciones concretas de providers externos viven en:

```txt
apps/api/src/shared/providers/
  auth/
  ai/
  storage/
  ocr/
```

## 9. Frontend web

`apps/web` debe usar:

- React;
- Vite;
- TypeScript;
- React Router;
- Zustand;
- TanStack Query;
- Zod;
- Tailwind CSS.

La web debe ser responsive para móvil, tablet y escritorio.

Aunque exista una app móvil descargable, la web también debe verse bien en móvil.

Estructura aproximada:

```txt
apps/web/src/
  app/
    router.tsx
    providers.tsx
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    SubjectsPage.tsx
    QuestionPage.tsx
    FlashcardsPage.tsx
    LandingPage.tsx
    ExamSessionPage.tsx
    ExamReviewPage.tsx
    ProfilePage.tsx
    FriendsPage.tsx
  features/
    auth/
    questions/
    attempts/
    corrections/
    flashcards/
    dashboard/
    exam-sessions/
    profile/
    friends/
    progress/
    brand-3d/
  shared/
    components/
    hooks/
    layouts/
    services/
  stores/
    auth.store.ts
    preferences.store.ts
  main.tsx
```

## 10. Logo 3D

El logo 3D interactivo de ExamInA será exclusivamente para la landing page de `apps/web`.

No debe implementarse en `apps/mobile`.

En mobile solo se usará un logo normal, imagen estática o placeholder.

Carpeta esperada:

```txt
apps/web/src/features/brand-3d/
  components/
    ExaminaLogoScene.tsx
    ExaminaLogoModel.tsx
  hooks/
    useMouseRotation.ts
  assets/
    examina-logo.glb
```

El logo 3D debe poder:

- rotar suavemente;
- responder al mouse;
- tener iluminación básica;
- no afectar gravemente al rendimiento;
- tener fallback si no carga.

## 11. App mobile

`apps/mobile` debe usar:

- Expo;
- React Native;
- TypeScript;
- Expo Router;
- Zustand;
- TanStack Query;
- Zod;
- AsyncStorage si hace falta;
- Expo ImagePicker o Camera más adelante.

La app móvil será una app descargable.

En mobile no se implementará logo 3D por ahora.

Estructura aproximada:

```txt
apps/mobile/
  app/
    _layout.tsx
    index.tsx
    login.tsx
    dashboard.tsx
    subjects.tsx
    profile.tsx
    friends.tsx
    question/
      [id].tsx
    exams/
      index.tsx
      [id].tsx
      review/
        [id].tsx
  src/
    features/
      auth/
      questions/
      attempts/
      corrections/
      flashcards/
      exam-sessions/
      profile/
      friends/
      progress/
    shared/
      components/
      hooks/
      services/
    stores/
      auth.store.ts
      preferences.store.ts
```

## 12. Separación entre web y mobile

`apps/web` y `apps/mobile` deben estar separados porque son plataformas distintas.

- La web responsive es para navegador.
- La app mobile es para instalación en Android/iOS mediante Expo.

No se debe duplicar lógica importante.

En la fundacion inicial no habra `packages/` compartidos.

La web y mobile pueden repetir una pequena capa HTTP local si hace falta. Solo se extraera codigo compartido mas adelante si existe una necesidad real, con confirmacion explicita del usuario.

La lógica backend-only debe vivir en `apps/api`.

Esto incluye:

- verificación de tokens;
- providers de IA;
- storage S3;
- OCR;
- Prisma;
- repositories;
- services;
- controllers;
- DTOs;
- mappers;
- entities.

## 13. Zod y validación

Zod se usara para validar DTOs y respuestas estructuradas.

Los schemas backend deben vivir dentro de `apps/api`.

Web y mobile pueden tener validaciones propias para formularios y entrada de usuario. No deben importar schemas internos del backend mientras no exista una decision explicita de extraer un paquete compartido.

Ejemplo de `CreateAttemptSchema`:

- `questionId`: string;
- `userAnswer`: string mínimo 1 carácter;
- `examSessionId`: string opcional o nullable.

Ejemplo de `CorrectionResultSchema`:

- `score`: number entre 0 y 10;
- `isCorrect`: boolean;
- `summary`: string;
- `feedback`: string;
- `detectedErrors`: string[];
- `missingKeywords`: string[];
- `suggestions`: string[];
- `recommendedTopics`: string[].

Muy importante: la respuesta de la IA también debe validarse con Zod.

No se debe tratar la respuesta de IA como texto libre sin estructura.

## 14. Flujo de corrección con IA

1. El usuario responde una pregunta.
2. El frontend valida datos básicos con Zod.
3. La API recibe la respuesta.
4. La API busca la pregunta, solución esperada, criterios de corrección y keywords.
5. La API llama al provider de IA.
6. La IA devuelve JSON estructurado.
7. La API valida ese JSON con Zod.
8. La API guarda `Attempt` y `Correction` en Supabase PostgreSQL.
9. El frontend muestra feedback al usuario.

### Matemáticas

El sistema no debe limitarse al resultado final. Debe intentar analizar el procedimiento y señalar errores como:

- sustitución directa cuando había indeterminación;
- simplificación incorrecta;
- error de signos;
- paso no justificado;
- factor común mal aplicado;
- conclusión incorrecta;
- resultado correcto pero procedimiento mal justificado.

### Biología y Física

Debe comparar:

- conceptos clave;
- explicación;
- palabras importantes;
- precisión de la respuesta;
- conceptos faltantes.

## 15. Storage con AWS S3

La parte de files/storage debe permitir subir imágenes de soluciones escritas a mano en una fase posterior.

Flujo deseado:

1. El frontend pide al backend una presigned URL.
2. El backend genera una presigned URL de S3.
3. El frontend sube la imagen directamente a S3.
4. El backend guarda la referencia en Supabase PostgreSQL.

Regla principal:

- AWS S3 guarda el archivo físico.
- Supabase PostgreSQL guarda la metadata y referencias del archivo.

No se deben guardar imágenes directamente dentro de PostgreSQL.

No se debe depender únicamente de una URL fija. Se debe preferir guardar `bucket` y `key` para generar signed URLs temporales desde el backend.

## 16. Entidades propuestas

La estructura de entidades no está completamente cerrada. Debe ser extensible para preguntas individuales, simulacros, comunidad, progreso, gamificación, archivos y revisión OCR/LLM.

### User

Representa al usuario dentro de la aplicación.

Campos sugeridos:

- `id`
- `firebaseUid`
- `email`
- `displayName`
- `photoUrl`
- `role`
- `status`
- `createdAt`
- `updatedAt`

Conecta la identidad de Firebase con los datos internos de ExamInA. No se guardan contraseñas.

`role` permite diferenciar estudiantes, moderadores y administradores.

`status` permite saber si la cuenta está activa, suspendida, baneada o eliminada lógicamente.

### UserProfile

Guarda información pública o semipública del perfil del usuario.

Campos sugeridos:

- `id`
- `userId`
- `username`
- `bio`
- `avatarFileId` nullable
- `bannerFileId` nullable
- `level`
- `experience`
- `currentStreakDays`
- `longestStreakDays`
- `lastStudyDate`
- `createdAt`
- `updatedAt`

`avatarFileId` y `bannerFileId` deben apuntar a `FileAsset`, no guardar URLs sueltas.

### UserPreferences

Guarda preferencias configurables y privadas del usuario.

Campos sugeridos:

- `id`
- `userId`
- `preferredTheme`
- `preferredLanguage`
- `notificationsEnabled`
- `studyReminderEnabled`
- `studyReminderTime`
- `timerSoundEnabled`
- `defaultTimerEnabled`
- `defaultExamDurationSeconds`
- `preferredSubjects`
- `createdAt`
- `updatedAt`

### Subject

Representa una asignatura.

Ejemplos:

- Matemáticas;
- Biología;
- Física;
- Química;
- Historia.

Campos sugeridos:

- `id`
- `name`
- `slug`
- `description`
- `createdAt`

### Topic

Representa un tema dentro de una asignatura.

Ejemplos:

- Límites;
- Derivadas;
- Genética;
- Evolución;
- Cinemática.

Campos sugeridos:

- `id`
- `subjectId`
- `name`
- `slug`
- `createdAt`

### Question

Guarda una pregunta del banco de preguntas.

Campos sugeridos:

- `id`
- `subjectId`
- `topicId`
- `statement`
- `type`
- `difficulty`
- `sourceYear`
- `sourceExam`
- `createdAt`
- `updatedAt`

### QuestionSolution

Guarda la solución esperada de una pregunta.

Campos sugeridos:

- `id`
- `questionId`
- `finalAnswer`
- `explanation`
- `gradingCriteria`
- `createdAt`
- `updatedAt`

### QuestionKeyword

Guarda palabras clave importantes asociadas a una pregunta.

Campos sugeridos:

- `id`
- `questionId`
- `keyword`

### Attempt

Guarda un intento de respuesta del usuario a una pregunta.

Campos sugeridos:

- `id`
- `userId`
- `questionId`
- `examSessionId` nullable
- `userAnswer`
- `score`
- `status`
- `createdAt`
- `updatedAt`

Si el usuario responde una pregunta individual, `examSessionId` puede ser null.

Si responde dentro de un examen, `examSessionId` debe apuntar al examen correspondiente.

### Correction

Guarda la corrección generada para un intento.

Campos sugeridos:

- `id`
- `attemptId`
- `isCorrect`
- `score`
- `summary`
- `feedback`
- `detectedErrors`
- `missingKeywords`
- `suggestions`
- `recommendedTopics`
- `createdAt`

### ExamSession

Representa un examen, simulacro o sesión de práctica completa.

Campos sugeridos:

- `id`
- `userId`
- `title`
- `mode`
- `status`
- `timerEnabled`
- `durationLimitSeconds`
- `startedAt`
- `finishedAt`
- `lastActivityAt`
- `resumeExpiresAt`
- `totalTimeSeconds`
- `totalScore`
- `maxScore`
- `createdAt`
- `updatedAt`

`lastActivityAt` permite saber cuándo el usuario interactuó por última vez con el examen.

`resumeExpiresAt` permite definir hasta cuándo un examen puede recuperarse o continuarse.

### ExamSessionQuestion

Guarda qué preguntas pertenecen a un examen y en qué orden aparecieron.

Campos sugeridos:

- `id`
- `examSessionId`
- `questionId`
- `order`
- `questionSnapshot`
- `solutionSnapshot`
- `createdAt`

Los snapshots son importantes para reconstruir exámenes históricos aunque el banco de preguntas cambie en el futuro.

### ExamSessionAnswer

Guarda la respuesta concreta del usuario dentro de un examen.

Campos sugeridos:

- `id`
- `examSessionId`
- `questionId`
- `attemptId`
- `userAnswer`
- `score`
- `isCorrect`
- `answeredAt`
- `createdAt`

### FileAsset

Guarda metadata general de cualquier archivo subido a AWS S3.

Campos sugeridos:

- `id`
- `userId`
- `bucket`
- `key`
- `url` nullable
- `mimeType`
- `sizeBytes`
- `originalFilename`
- `fileType`
- `visibility`
- `purpose`
- `checksum` nullable
- `width` nullable
- `height` nullable
- `createdAt`
- `updatedAt`

### AttemptAsset

Relaciona uno o varios archivos con un intento concreto.

Campos sugeridos:

- `id`
- `attemptId`
- `fileAssetId`
- `createdAt`

### ExamSessionAsset

Relaciona archivos con un examen completo.

Campos sugeridos:

- `id`
- `examSessionId`
- `fileAssetId`
- `createdAt`

### LlmReviewAsset

Guarda el ciclo de procesamiento de una imagen o documento que será analizado por OCR/LLM.

Campos sugeridos:

- `id`
- `fileAssetId`
- `userId`
- `attemptId` nullable
- `examSessionId` nullable
- `status`
- `extractedText` nullable
- `llmInputSnapshot` nullable
- `llmOutputSnapshot` nullable
- `errorMessage` nullable
- `createdAt`
- `processedAt` nullable

Flujo esperado:

1. Usuario sube una imagen.
2. Se crea `FileAsset`.
3. Se relaciona con `AttemptAsset` o `ExamSessionAsset`.
4. Se crea `LlmReviewAsset` con status `PENDING`.
5. OCR procesa la imagen y guarda `extractedText`.
6. LLM analiza la respuesta usando el texto extraído, la pregunta, solución esperada, criterios y keywords.
7. Se guarda `llmInputSnapshot` y `llmOutputSnapshot`.
8. Se crea o actualiza `Correction`.
9. El usuario puede ver la corrección.

### Friendship

Maneja solicitudes de amistad entre usuarios.

Campos sugeridos:

- `id`
- `requesterId`
- `receiverId`
- `status`
- `createdAt`
- `updatedAt`

Esta entidad guarda tanto solicitudes enviadas como recibidas. Si el usuario A envía una solicitud al usuario B, `requesterId` será A y `receiverId` será B.

Si la solicitud se rechaza, `status` pasa a `REJECTED`. Si se acepta, pasa a `ACCEPTED`. Si hay bloqueo entre usuarios, puede pasar a `BLOCKED`.

Este bloqueo es entre usuarios y no representa necesariamente un baneo global de plataforma.

### UserModerationAction

Guarda acciones de moderación aplicadas a usuarios.

Campos sugeridos:

- `id`
- `userId`
- `moderatorId` nullable
- `action`
- `reason`
- `notes` nullable
- `startsAt` nullable
- `endsAt` nullable
- `createdAt`

Registra advertencias, suspensiones temporales, baneos permanentes, restricciones de contenido o restauraciones de cuenta.

Esta entidad permite tener historial de moderación y no mezclar sanciones de plataforma con amistades o bloqueos personales entre usuarios.

### UserProgress

Guarda el progreso global del usuario.

Campos sugeridos:

- `id`
- `userId`
- `totalQuestionsAnswered`
- `totalCorrectAnswers`
- `totalExamsCompleted`
- `totalFlashcardsReviewed`
- `totalStudyTimeSeconds`
- `averageScore`
- `level`
- `experience`
- `createdAt`
- `updatedAt`

### UserSubjectProgress

Guarda el progreso del usuario por asignatura.

Campos sugeridos:

- `id`
- `userId`
- `subjectId`
- `questionsAnswered`
- `correctAnswers`
- `examsCompleted`
- `averageScore`
- `studyTimeSeconds`
- `masteryLevel`
- `createdAt`
- `updatedAt`

### UserTopicProgress

Guarda el progreso del usuario por tema específico.

Campos sugeridos:

- `id`
- `userId`
- `topicId`
- `questionsAnswered`
- `correctAnswers`
- `averageScore`
- `studyTimeSeconds`
- `masteryLevel`
- `lastPracticedAt`
- `createdAt`
- `updatedAt`

### StudyActivity

Guarda actividad diaria del usuario.

Campos sugeridos:

- `id`
- `userId`
- `activityDate`
- `questionsAnswered`
- `correctAnswers`
- `flashcardsReviewed`
- `examsCompleted`
- `studyTimeSeconds`
- `experienceEarned`
- `createdAt`
- `updatedAt`

### LevelRule

Define cuánta experiencia hace falta para subir de nivel.

Campos sugeridos:

- `id`
- `level`
- `requiredExperience`
- `title`
- `createdAt`

### Achievement

Define logros disponibles.

Campos sugeridos:

- `id`
- `code`
- `title`
- `description`
- `icon`
- `experienceReward`
- `createdAt`

### UserAchievement

Guarda qué logros ha desbloqueado cada usuario.

Campos sugeridos:

- `id`
- `userId`
- `achievementId`
- `unlockedAt`

### CommunityPost

Representa una publicación dentro del feed o zona de comunidad.

Campos sugeridos:

- `id`
- `authorId`
- `type`
- `visibility`
- `title` nullable
- `content`
- `examSessionId` nullable
- `sharedExamId` nullable
- `status`
- `createdAt`
- `updatedAt`

Puede ser un post de texto, una duda, un consejo, un resultado de examen compartido o una publicación asociada a un examen compartible.

### CommunityComment

Representa un comentario dentro de un post de comunidad.

Campos sugeridos:

- `id`
- `postId`
- `authorId`
- `parentCommentId` nullable
- `content`
- `status`
- `createdAt`
- `updatedAt`

Permite conversaciones dentro de un post. `parentCommentId` permite respuestas a comentarios.

### CommunityReaction

Guarda reacciones de usuarios a posts o comentarios.

Campos sugeridos:

- `id`
- `userId`
- `postId` nullable
- `commentId` nullable
- `type`
- `createdAt`

Permite interacciones como like, útil, enhorabuena, interesante o guardado.

### SharedExam

Representa un examen creado o compartido por un usuario para que otros puedan verlo, clonarlo o usarlo como práctica.

Campos sugeridos:

- `id`
- `ownerId`
- `sourceExamSessionId` nullable
- `title`
- `description` nullable
- `visibility`
- `status`
- `allowCloning`
- `createdAt`
- `updatedAt`

Puede venir de un `ExamSession` existente o crearse como plantilla pública, privada o visible solo para amigos.

`ownerId` indica quién creó o publicó el examen compartido.

### SharedExamUsage

Registra quién utiliza un examen compartido.

Campos sugeridos:

- `id`
- `sharedExamId`
- `userId`
- `examSessionId` nullable
- `status`
- `startedAt` nullable
- `finishedAt` nullable
- `createdAt`

Permite saber qué usuarios empezaron, terminaron o abandonaron un examen creado por otra persona.

Si un usuario decide hacer un examen compartido, se puede crear una `ExamSession` propia para ese usuario y enlazarla desde `examSessionId`.

Separación deseada:

- `SharedExam` es la plantilla compartida.
- `SharedExamUsage` registra el uso por usuario.
- `ExamSession` guarda el intento real de ese usuario.

### SharedExamQuestion

Guarda las preguntas que pertenecen a un examen compartido y el orden en el que aparecen.

Campos sugeridos:

- `id`
- `sharedExamId`
- `questionId`
- `order`
- `questionSnapshot`
- `solutionSnapshot`
- `createdAt`

Incluye snapshots para que el examen compartido no cambie accidentalmente si el banco de preguntas se edita después.

### ContentReport

Permite que la comunidad reporte contenido.

Campos sugeridos:

- `id`
- `reporterId`
- `targetType`
- `postId` nullable
- `commentId` nullable
- `sharedExamId` nullable
- `reportedUserId` nullable
- `reason`
- `details` nullable
- `status`
- `createdAt`
- `resolvedAt` nullable

Puede reportar posts, comentarios, usuarios o exámenes compartidos.

No debe sancionar automáticamente. Solo registra el reporte para que luego lo revise moderación o una regla automatizada.

## 17. Enums sugeridos

### UserRole

- `STUDENT`
- `MODERATOR`
- `ADMIN`

Explicación:
Permite controlar permisos principales dentro de ExamInA.

`STUDENT` será el rol normal de estudiante.

`MODERATOR` podrá revisar reportes y aplicar ciertas acciones de moderación.

`ADMIN` tendrá permisos administrativos completos.

### ExamMode

- `PRACTICE`
- `MOCK_EXAM`
- `FLASHCARDS`
- `CUSTOM`

### ExamSessionStatus

- `DRAFT`
- `IN_PROGRESS`
- `FINISHED`
- `ABANDONED`

### AttemptStatus

- `PENDING`
- `CORRECTED`
- `ERROR`

### QuestionType

- `OPEN_TEXT`
- `MULTIPLE_CHOICE`
- `PROCEDURE`
- `FLASHCARD`

### QuestionDifficulty

- `EASY`
- `MEDIUM`
- `HARD`

### FriendshipStatus

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `BLOCKED`

### FileType

- `IMAGE`
- `PDF`
- `AUDIO`
- `VIDEO`
- `OTHER`

### FileVisibility

- `PRIVATE`
- `PUBLIC`

### FilePurpose

- `PROFILE_AVATAR`
- `PROFILE_BANNER`
- `EXAM_ANSWER_IMAGE`
- `ATTEMPT_ANSWER_IMAGE`
- `QUESTION_ATTACHMENT`
- `OCR_SOURCE`
- `OTHER`

### LlmReviewStatus

- `PENDING`
- `OCR_PROCESSING`
- `OCR_COMPLETED`
- `LLM_PROCESSING`
- `COMPLETED`
- `FAILED`

### MasteryLevel

- `LOW`
- `MEDIUM`
- `HIGH`
- `MASTERED`

### ThemePreference

- `LIGHT`
- `DARK`
- `SYSTEM`

### UserStatus

- `ACTIVE`
- `SUSPENDED`
- `BANNED`
- `DELETED`

Explicación:
Permite controlar el estado global de una cuenta.

### ModerationActionType

- `WARNING`
- `TEMPORARY_SUSPENSION`
- `PERMANENT_BAN`
- `ACCOUNT_RESTORED`
- `CONTENT_RESTRICTION`

Explicación:
Permite registrar qué tipo de acción tomó la plataforma sobre un usuario.

### ModerationReason

- `SPAM`
- `HARASSMENT`
- `HATE_SPEECH`
- `EXPLICIT_CONTENT`
- `IMPERSONATION`
- `CHEATING`
- `COPYRIGHT_VIOLATION`
- `MALICIOUS_LINKS`
- `INAPPROPRIATE_PROFILE`
- `INAPPROPRIATE_CONTENT`
- `REPEATED_RULE_VIOLATIONS`
- `OTHER`

Explicación:
Permite clasificar por qué se sancionó o bloqueó a un usuario desde la plataforma.

### CommunityPostType

- `TEXT`
- `QUESTION`
- `EXAM_RESULT`
- `SHARED_EXAM`
- `PROGRESS_UPDATE`
- `TIP`
- `DOUBT`

Explicación:
Permite diferenciar publicaciones normales, dudas, consejos, progreso, resultados y exámenes compartidos.

### CommunityVisibility

- `PUBLIC`
- `FRIENDS_ONLY`
- `PRIVATE`

Explicación:
Permite controlar quién puede ver un post o examen compartido.

### CommunityContentStatus

- `PUBLISHED`
- `HIDDEN`
- `DELETED`
- `UNDER_REVIEW`

Explicación:
Permite moderar posts, comentarios y exámenes compartidos sin borrarlos físicamente.

### CommunityReactionType

- `LIKE`
- `USEFUL`
- `CONGRATS`
- `INTERESTING`
- `SAVED`

Explicación:
Permite representar interacciones rápidas dentro de la comunidad.

### SharedExamStatus

- `DRAFT`
- `PUBLISHED`
- `UNLISTED`
- `ARCHIVED`
- `HIDDEN`

Explicación:
Permite controlar el ciclo de vida de un examen compartido.

### SharedExamUsageStatus

- `STARTED`
- `FINISHED`
- `ABANDONED`

Explicación:
Permite saber si un usuario empezó, terminó o abandonó un examen compartido.

### ReportTargetType

- `POST`
- `COMMENT`
- `SHARED_EXAM`
- `USER`

Explicación:
Permite indicar qué tipo de recurso fue reportado.

### ReportStatus

- `OPEN`
- `UNDER_REVIEW`
- `RESOLVED`
- `DISMISSED`

Explicación:
Permite controlar el estado de revisión de un reporte.

## 18. Historial de exámenes

Cuando un usuario termine un examen o simulacro, deben quedar guardadas:

- las preguntas que aparecieron;
- el orden de las preguntas;
- las respuestas del usuario;
- la corrección de cada respuesta;
- la puntuación por pregunta;
- la puntuación total;
- la fecha de inicio;
- la fecha de finalización;
- el tiempo utilizado;
- si el temporizador estaba activado o desactivado;
- el límite de tiempo si existía;
- el estado del examen.

El usuario debe poder volver después a revisar un examen pasado y ver:

- qué preguntas respondió;
- qué respondió en cada una;
- cuál era la solución esperada;
- qué feedback recibió;
- qué errores cometió;
- qué keywords le faltaron;
- qué temas debería repasar.

## 19. Temporizador

Los exámenes deben tener temporizador opcional.

Ejemplos:

- modo práctica libre: sin temporizador;
- modo simulacro PAU: con temporizador;
- modo flashcards: normalmente sin temporizador;
- modo examen personalizado: el usuario puede activar o desactivar el contador.

Campos sugeridos en `ExamSession`:

- `timerEnabled`: boolean;
- `durationLimitSeconds`: number nullable;
- `startedAt`: DateTime;
- `finishedAt`: DateTime nullable;
- `lastActivityAt`: DateTime nullable;
- `resumeExpiresAt`: DateTime nullable;
- `totalTimeSeconds`: number nullable;
- `status`: enum.

Si `timerEnabled` es false, el examen funciona sin contador.

Si `timerEnabled` es true, debe respetarse `durationLimitSeconds`.

El progreso visual de un examen puede calcularse así:

```txt
totalQuestions = count(ExamSessionQuestion where examSessionId = X)
answeredQuestions = count(ExamSessionAnswer where examSessionId = X)
progressPercent = answeredQuestions / totalQuestions * 100
```

Un examen puede mostrarse como recuperable si su `status` es `IN_PROGRESS` o `ABANDONED`, tiene respuestas o actividad previa, `finishedAt` es null y `resumeExpiresAt` no ha vencido.

## 20. MVP deseado

Primera versión:

1. Login/Register con Firebase.
2. Login con Google.
3. Login con email y contraseña.
4. Backend verifica token con Firebase Admin.
5. Usuario se guarda en Supabase PostgreSQL.
6. Perfil básico de usuario.
7. Preferencias básicas de usuario.
8. Lista de asignaturas.
9. Lista de temas.
10. Banco de preguntas.
11. Flashcards.
12. Responder pregunta en texto.
13. Corrección con IA.
14. Historial de intentos.
15. Dashboard básico.
16. Crear simulacro/examen.
17. Responder preguntas dentro de un examen.
18. Finalizar examen.
19. Guardar respuestas y correcciones del examen.
20. Revisar examen pasado.
21. Temporizador opcional activable/desactivable.
22. Sistema base de progreso, nivel, experiencia y racha.
23. Estructura base de amigos.
24. Estructura base de archivos con `FileAsset`.
25. Landing page web con placeholder preparado para logo 3D.
26. Estructura base de moderación de usuarios.

Segunda versión:

1. Subida de imagen a S3.
2. OCR.
3. Corrección desde foto.
4. Estadísticas avanzadas por tema.
5. Recomendaciones personalizadas.
6. Más asignaturas.
7. Logo 3D final en landing web.
8. Sistema de logros.
9. Feed de comunidad con posts, comentarios y reacciones.
10. Compartir resultados de exámenes.
11. Crear y compartir exámenes propios.
12. Registrar quién usa exámenes compartidos.
13. Sistema de reportes para posts, comentarios, usuarios y exámenes compartidos.
14. Comunidad más completa.
15. Posible sistema de conversaciones privadas entre usuarios.

Nota:
Las conversaciones privadas no entran en el MVP inicial. Si se añaden más adelante, probablemente necesitarán entidades como `Conversation`, `ConversationParticipant`, `DirectMessage` y `MessageReport`, además de reglas de bloqueo, reportes, privacidad y notificaciones.

## 21. Prioridades técnicas iniciales

1. Crear estructura profesional.
2. Configurar TypeScript correctamente.
3. Configurar pnpm workspaces.
4. Configurar Turborepo.
5. Crear NestJS básico en `apps/api`.
6. Crear React + Vite básico en `apps/web`.
7. Crear Expo básico en `apps/mobile`.
8. Crear Prisma schema inicial dentro de `apps/api/prisma/schema.prisma`.
9. Crear interfaces de `AuthProvider`, `CorrectionProvider`, `StorageProvider` y `OcrProvider` dentro de `apps/api/src/shared/providers`.
10. Crear README inicial explicando estructura.
11. No mezclar lógica de web y mobile.
12. No crear `packages/` compartidos en la fundacion inicial.
13. Mantener separación clara entre controllers, DTOs, entities, mappers, repositories y services.
14. Preparar la base de datos pensando en historial de exámenes.
15. Preparar temporizador opcional para exámenes.
16. Validar entradas y salidas de IA con Zod.
17. Aislar servicios externos mediante providers dentro de `apps/api`.
18. Preparar metadata de archivos para AWS S3.
19. Preparar entidades de perfil, preferencias, amigos, progreso, racha, nivel y logros.

## 22. Primer bloque de implementación futura

Cuando se pase de planificación a implementación, el primer bloque será crear la base del monorepo:

- `package.json` raíz;
- `pnpm-workspace.yaml`;
- `turbo.json`;
- esqueletos mínimos de `apps/api`, `apps/web`, `apps/mobile`;
- `package.json` y `tsconfig.json` propios por app;
- estructura backend dentro de `apps/api`;
- validación inicial de compilación.

El objetivo inicial no será tener toda la lógica terminada, sino una base profesional, escalable y bien organizada para construir ExamInA.

## 23. Reglas de implementación futura

- Trabajar paso a paso, en bloques claros.
- No cambiar la estructura acordada por cuenta propia.
- Si algo es demasiado grande, crear primero el esqueleto y dejar TODOs claros.
- Respetar la separación entre `apps/api`, `apps/web` y `apps/mobile`.
- No crear `packages/` compartidos sin una decision explicita posterior.
- Revisar que la estructura compile antes de seguir acumulando lógica.
- Validar que web y mobile consumen la API por HTTP, sin imports internos del backend.
- Mantener una base limpia, compilable y coherente.
