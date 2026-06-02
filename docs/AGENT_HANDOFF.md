# ExamInA - Agent Handoff

Este documento existe para que cualquier agente de IA pueda continuar el desarrollo de ExamInA sin arrastrar decisiones antiguas.

## Regla principal

Antes de trabajar, un agente debe leer:

1. `README.md`
2. `docs/AGENT_HANDOFF.md`
3. `docs/CURRENT_PROBLEMS.md`
4. El documento especifico relacionado con la tarea:
   - `docs/GIT_WORKFLOW.md`
   - `docs/CODE_COMMENTING_GUIDE.md`
   - `docs/FRONTEND_STYLE_GUIDE.md`
   - `docs/DEPENDENCY_SECURITY.md`
   - `docs/EXAM_FLOW_AND_ENTITY_CONNECTIONS.md` si la tarea toca examenes, intentos, correcciones, preguntas, adjuntos o tiempo de estudio

Despues de trabajar, el agente debe actualizar este documento si cambio algo importante.

Regla obligatoria:

Cada vez que se cierre un commit o se realice un cambio importante, se debe actualizar `docs/AGENT_HANDOFF.md`.

Esto aplica aunque el cambio parezca pequeno si afecta contexto, decisiones, estructura, comandos, dependencias, endpoints, entidades, configuracion o tareas pendientes.

## Commits

Antes de crear cualquier commit, el agente debe mostrar al usuario el estado de los cambios y pedir confirmacion explicita.

Debe mostrar como minimo:

- rama actual;
- archivos modificados;
- resumen del cambio;
- mensaje de commit propuesto;
- si se hara push despues del commit.

No se debe hacer commit ni push sin confirmacion del usuario.

## Estado actual del proyecto

Estado: esqueleto inicial del monorepo preparado para primer commit.

Git local ya fue inicializado y `origin` apunta a `https://github.com/Juan0852/ExamInA.git`.

Este workspace contiene documentos de planificacion en `docs/` y assets de marca en `assets/brand/`.

## Arquitectura decidida

Monorepo objetivo:

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

No se deben crear `packages/` compartidos en la fundacion inicial.

La raiz tendra un `package.json` minimo para orquestar comandos:

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

Cada app tendra sus propias dependencias:

- `apps/api/package.json`
- `apps/web/package.json`
- `apps/mobile/package.json`

## Backend

Todo lo backend vive dentro de `apps/api`.

```txt
apps/api/
  prisma/
    schema.prisma
    migrations/
  src/
    modules/
      auth/
      health/
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
      [module]/
        controllers/
        dtos/
        entities/
        mappers/
        repositories/
        services/
        [module].module.ts
    shared/
      database/
        prisma.service.ts
      providers/
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
      config/
      errors/
      guards/
      logger/
      utils/
    app.module.ts
    main.ts
  package.json
  tsconfig.json
```

Prisma, migraciones, providers, repositories, services, controllers, guards y configuracion backend-only no deben salir de `apps/api`.

Cada carpeta de backend dentro de `apps/api/src/modules/` debe verse como una estructura estilo Spring Boot:

```txt
apps/api/src/modules/questions/
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

No usar por defecto carpetas `domain/`, `application/`, `infrastructure/` ni `presentation/`.

## Apps fuera del backend

Solo quedan fuera de `apps/api`:

- `apps/web`
- `apps/mobile`

Ambas consumen la API por HTTP. No importan Prisma, providers ni codigo interno del backend.

## Stack previsto

- TypeScript
- pnpm workspaces
- Turborepo solo como orquestador opcional
- NestJS para API
- React + Vite para web
- Expo + React Native para mobile
- Prisma dentro de `apps/api`
- PostgreSQL local en desarrollo
- Supabase PostgreSQL como base gestionada en produccion
- Firebase Auth
- Zod
- TanStack Query
- Zustand
- AWS S3 mediante presigned URLs
- LLM desacoplado mediante providers dentro de `apps/api`
- OCR desacoplado dentro de `apps/api`

## Decisiones importantes

### Auth

Firebase Auth se usara siempre para autenticacion.

Supabase no se usara como auth.

Supabase solo se usara como PostgreSQL gestionado en produccion.

Durante desarrollo/debugging se podra usar PostgreSQL local.

El backend verificara ID tokens mediante una interfaz en `apps/api/src/shared/providers/auth/`.

### Providers

Los servicios externos deben estar desacoplados mediante interfaces dentro de `apps/api/src/shared/providers/`:

- `AuthProvider`
- `CorrectionProvider` o `LlmProvider`
- `StorageProvider`
- `OcrProvider`

La logica de negocio no debe depender directamente de Firebase, OpenAI, AWS S3, OCR o Prisma.

Storage se implementara primero con `LocalStorageProvider` basado en filesystem de Node.js para desarrollo/debugging. Produccion usara `S3StorageProvider` detras de la misma interfaz. La estrategia vigente debe documentarse en `docs/CURRENT_PROBLEMS.md` hasta crear una especificacion nueva.

### Web y mobile

Web y mobile deben estar separados:

- `apps/web` para navegador responsive.
- `apps/mobile` para app instalable Expo.

El logo 3D solo va en web landing, no en mobile.

## Pendiente inmediato

1. Inicializar Git si el usuario lo pide.
2. Crear estructura real del monorepo.
3. Crear `package.json` raiz.
4. Crear `pnpm-workspace.yaml`.
5. Crear `apps/api`, `apps/web` y `apps/mobile`.
6. Crear `apps/api/prisma/schema.prisma`.
7. Crear estructura de carpetas backend dentro de `apps/api/src/modules`.
8. Crear providers backend dentro de `apps/api/src/shared/providers`.
9. Validar que no se crea ningun `packages/` accidentalmente.

## Historial de handoff

### 2026-05-29 - Codex

Branch:

`feature/exams-llm`

Cambios realizados:

- Se implemento el flujo real de correccion IA con provider LLM configurable (`LLM_PROVIDER`) y provider OpenAI-compatible para LM Studio/Gemma.
- Se eliminaron providers mock de auth/correccion del flujo principal y el login web usa Firebase real via backend.
- Se implementaron modulos backend Spring-style para `corrections`, `exam-sessions` y `shared-exams`.
- Se agregaron examenes oficiales compartidos mediante `SharedExam` y `SharedExamQuestion`.
- Se agrego seed oficial de Matematicas II: Limites y Continuidad con enunciados en LaTeX/KaTeX.
- Se agrego listado de examenes oficiales filtrable por asignatura usando `/shared-exams?subjectId=...`.
- Se separo la navegacion web entre `Temario` y `Examenes oficiales`; ambos flujos empiezan por pantalla de asignaturas.
- Se agrego pagina de sesion de examen resumible con progreso, timer, evaluacion IA, historial de intentos y eliminacion de intentos.
- Se agrego heartbeat de tiempo de estudio con `PATCH /exam-sessions/:examSessionId/activity`; el backend calcula delta contra `examSession.totalTimeSeconds` para evitar duplicar minutos.
- El boton de evaluar ya no es el unico disparador de tiempo; el frontend sincroniza cada 15 segundos y tambien al cambiar pregunta, evaluar, salir, ocultar pestana y finalizar.
- Se agrego KaTeX en web y `MathText` para renderizar formulas en enunciados y feedback.
- Se agrego UI de adjuntos de respuesta: subir imagen, tomar foto, tablero tipo paint y boton de voz deshabilitado como proximo paso. Los adjuntos son previews locales todavia, no se suben a S3.
- Se agrego informacion de creador con avatar en cards de examenes oficiales y temario (`CreatorBadge`).
- Se agregaron metricas de dashboard para tiempo de estudio diario/total, lightboxes de racha/tiempo, historial de examenes y estados de intentos.
- Se agrego sistema MVP de logros, medallas SVG y toasts.

Endpoints importantes agregados o usados:

- `GET /api/v1/shared-exams`
- `GET /api/v1/shared-exams?subjectId=:subjectId`
- `POST /api/v1/shared-exams/:sharedExamId/start`
- `GET /api/v1/exam-sessions/me`
- `GET /api/v1/exam-sessions/:examSessionId`
- `POST /api/v1/exam-sessions`
- `PATCH /api/v1/exam-sessions/:examSessionId/activity`
- `PATCH /api/v1/exam-sessions/:examSessionId/finish`
- `DELETE /api/v1/exam-sessions/:examSessionId`
- `POST /api/v1/corrections/evaluate-written-answer`
- `POST /api/v1/corrections/reset-attempts`

Archivos y areas tocadas:

- `apps/api/src/modules/corrections/`
- `apps/api/src/modules/exam-sessions/`
- `apps/api/src/modules/shared-exams/`
- `apps/api/src/shared/providers/ai/`
- `apps/api/src/seed-official-exams.ts`
- `apps/web/src/pages/ExamSessionPage.tsx`
- `apps/web/src/pages/OfficialExamsPage.tsx`
- `apps/web/src/pages/TopicsPage.tsx`
- `apps/web/src/pages/DashboardPage.tsx`
- `apps/web/src/shared/components/AnswerAttachmentComposer.tsx`
- `apps/web/src/shared/components/CreatorBadge.tsx`
- `apps/web/src/shared/components/MathText.tsx`
- `apps/web/src/viewmodels/useExamSessionViewModel.ts`
- `apps/web/src/viewmodels/useOfficialExamsViewModel.ts`
- `pnpm-lock.yaml`

Validacion ejecutada:

- `corepack pnpm --filter api typecheck`
- `corepack pnpm --filter web typecheck`
- `corepack pnpm --filter api build`
- `corepack pnpm --filter web build`

Pendientes:

- Implementar subida real de archivos con S3 mediante presigned URLs.
- Persistir adjuntos de respuesta en `FileAsset`/`AttemptAsset` y conectarlos a la correccion IA multimodal.
- Activar envio de imagenes al provider LLM cuando el provider soporte vision.
- Reemplazar los placeholders de reportar error por endpoint real usando `ContentReport`.
- Evaluar si se necesita tabla de logs de tiempo por sesion (`exam_session_time_logs`) para auditoria fina; el MVP actual usa delta sobre `exam_sessions.totalTimeSeconds`.
- Revisar documentacion de endpoints/entidades si se quiere dejar trazabilidad formal del bloque.

### 2026-05-25 - Antigravity

Branch:

`feature/web-minimum`

Cambios realizados:

- Se configuró el entorno del frontend web (`apps/web`) con Vite 8 y Tailwind CSS v4.
- Se implementó la estructura de arquitectura MVVM (Model-View-ViewModel) en React.
- Se añadió `api.service.ts` y el store Zustand `auth.store.ts` para gestionar la sesión con soporte para Mock Login (Modelo).
- Se implementaron esquemas de validación Zod locales (`loginSchema` y `answerSchema`) para validar de manera segura en el cliente.
- Se implementaron los hooks de ViewModel (`useLoginViewModel`, `useSubjectsViewModel`, `useTopicsQuestionsViewModel`, `useQuestionViewModel`).
- Se crearon las Vistas (`LoginPage`, `LandingPage`, `DashboardPage`, `SubjectsPage`, `TopicsPage`, `QuestionPage`) y el Layout global (`AppLayout` con `Navbar`).
- Se verificó que el proyecto compila y se genera el bundle sin errores.

Archivos tocados:

- `apps/web/index.html`
- `apps/web/vite.config.ts`
- `apps/web/src/`
- `docs/AGENT_HANDOFF.md`

Validacion ejecutada:

- `corepack pnpm --filter web typecheck`
- `corepack pnpm --filter web build`

Pendientes:

- Desarrollar el módulo backend de intentos (`attempts`) y correcciones (`corrections`) e integrarlo en la UI reemplazando el flujo mockeado actual.

### 2026-05-25 - Antigravity

Branch:

`feature/academic-catalog`

Cambios realizados:

- Se implementó el módulo de Asignaturas (`subjects`) con su controlador, servicio, mapper, DTOs y repositorio Prisma.
- Se implementó el módulo de Temas (`topics`) con su controlador, servicio, mapper, DTOs y repositorio Prisma, permitiendo filtrar temas por asignatura.
- Se implementó el módulo de Preguntas (`questions`) con su controlador, servicio, mapper, DTOs y repositorio Prisma, con soporte para listar por filtros (tema, asignatura, dificultad, tipo) y obtener detalles por ID.
- Se importaron `SubjectsModule`, `TopicsModule` y `QuestionsModule` en `AppModule`.

Archivos tocados:

- `apps/api/src/app.module.ts`
- `apps/api/src/modules/subjects/`
- `apps/api/src/modules/topics/`
- `apps/api/src/modules/questions/`
- `docs/AGENT_HANDOFF.md`

Validacion ejecutada:

- `corepack pnpm --filter api typecheck`
- `corepack pnpm --filter api build`

Pendientes:

- Crear e integrar la interfaz web mínima (React + Vite) para consumir este catálogo.
- Implementar los módulos de intentos (`attempts`) y correcciones (`corrections`).

### 2026-05-25 - Codex

Branch:

`feature/auth-firebase`

Cambios realizados:

- Se integró `chore/database-foundation` en `develop` mediante fast-forward y se publicó `develop`.
- Se creó la rama `feature/auth-firebase` desde `develop`.
- Se implementó `AuthModule` con estructura Spring-style.
- Se añadió `POST /api/v1/auth/session`.
- Se añadió `GET /api/v1/auth/me`.
- Se implementó `FirebaseAuthProvider` con Firebase Admin.
- Se dejó `MockAuthProvider` como default local mediante `AUTH_PROVIDER=mock`.
- Se implementó repositorio Prisma para buscar/crear usuario interno, perfil y preferencias.
- Se limpió el mapper de auth para no exponer campos internos de Prisma.

Archivos tocados:

- `apps/api/.env.example`
- `apps/api/src/app.module.ts`
- `apps/api/src/shared/providers/auth/firebase-auth.provider.ts`
- `apps/api/src/modules/auth/`
- `docs/AGENT_HANDOFF.md`

Validacion ejecutada:

- `corepack pnpm --filter api db:generate`
- `corepack pnpm --filter api typecheck`
- `corepack pnpm --filter api build`
- `corepack pnpm --filter api dev`
- `curl -s -X POST http://localhost:3000/api/v1/auth/session -H 'Authorization: Bearer local-test-token'`
- `curl -s http://localhost:3000/api/v1/auth/me -H 'Authorization: Bearer local-test-token'`
- `curl -s http://localhost:3000/api/v1/health/database`

Pendientes:

- Probar Firebase real cuando el usuario configure credenciales de Firebase Admin.
- Crear commit de auth backend si el usuario lo aprueba.

### 2026-05-22 - Codex

Branch:

`chore/database-foundation`

Cambios realizados:

- Se integró `chore/api-minimum` en `develop` mediante fast-forward y se publicó `develop`.
- Se creó la rama `chore/database-foundation` desde `develop`.
- Se añadió el schema Prisma core con `User`, `UserProfile`, `UserPreferences`, `Subject`, `Topic`, `Question`, `QuestionSolution` y `QuestionKeyword`.
- Se adaptó Prisma a la configuración de Prisma 7 usando `apps/api/prisma.config.ts`.
- Se añadió `@prisma/adapter-pg`, `pg` y `@types/pg`.
- Se implementó `DatabaseModule` y `PrismaService` lazy para no bloquear el arranque si no hay `DATABASE_URL`.
- Se añadió `/api/v1/health/database`.
- Se separaron los archivos de entorno por app: `apps/api/.env.example`, `apps/web/.env.example` y `apps/mobile/.env.example`.
- `apps/api/.env` queda como archivo local editable y no commiteable. El usuario debe colocar sus credenciales reales de PostgreSQL local.
- Se aplicó la migración inicial oficial de Prisma `20260525014804_init_core_schema`.
- La base local ya contiene las tablas core y `_prisma_migrations`.

Archivos tocados:

- `apps/api/package.json`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma.config.ts`
- `apps/api/.env.example`
- `apps/web/.env.example`
- `apps/mobile/.env.example`
- `apps/api/prisma/migrations/20260525014804_init_core_schema/migration.sql`
- `apps/api/src/shared/database/database.module.ts`
- `apps/api/src/shared/database/prisma.service.ts`
- `apps/api/src/modules/health/`
- `pnpm-lock.yaml`
- `docs/AGENT_HANDOFF.md`

Validacion ejecutada:

- `corepack pnpm --filter api db:validate` con `DATABASE_URL` definido en el entorno
- `corepack pnpm --filter api db:generate` con `DATABASE_URL` definido en el entorno
- `corepack pnpm --filter api typecheck`
- `corepack pnpm --filter api build`
- `corepack pnpm --filter api exec prisma migrate dev --name init_core_schema --create-only`
- `corepack pnpm --filter api exec prisma migrate dev`
- `corepack pnpm --filter api exec prisma migrate status`
- `corepack pnpm --filter api dev`
- `curl -s http://localhost:3000/api/v1/health`
- `curl -s -i http://localhost:3000/api/v1/health/database`
- `curl -s http://localhost:3000/api/v1/health/database`

Pendientes:

- Crear commit de database foundation si el usuario lo aprueba.

### 2026-05-22 - Codex

Branch:

`main`

Cambios realizados:

- Se inicializo Git local.
- Se configuro `origin` con `https://github.com/Juan0852/ExamInA.git`.
- Se preparo el primer commit base en `main`.
- Despues de publicar `main`, se debe crear `develop` desde `main` para continuar el flujo normal.

Archivos tocados:

- `docs/AGENT_HANDOFF.md`

Validacion ejecutada:

- `git remote -v`
- `git branch --show-current`
- `git status --short`

Pendientes:

- Crear commit inicial.
- Hacer push de `main`.
- Crear y publicar `develop`.
- Continuar trabajo normal desde `develop`.

### 2026-05-22 - Codex

Branch:

`chore/api-minimum`

Cambios realizados:

- Se inicio el trabajo normal desde `develop` en una rama de trabajo.
- Se añadió NestJS minimo en `apps/api`.
- Se creó `HealthModule` con estructura Spring-style dentro de `apps/api/src/modules/health`.
- Se añadieron endpoints base de health bajo el prefijo global `/api/v1`.
- Se ajustaron scripts de API para usar `tsx` en desarrollo y `tsc` para build.
- Se instalaron dependencias con `corepack pnpm install --ignore-scripts`.
- Se instalaron las dependencias backend documentadas: Prisma client, Firebase Admin, Zod, OpenAI, AWS S3 SDK, Nest config, class-validator y class-transformer.
- Se instalaron las dependencias web documentadas: React, Vite, React Router, Zustand, TanStack Query, Zod, Firebase client, Tailwind, React Three Fiber, Drei, Three y lucide-react.
- Se instalaron las dependencias mobile documentadas: Expo, React Native, Expo Router, Zustand, TanStack Query, Zod, Firebase client, AsyncStorage, Expo ImagePicker, Expo Camera y librerias base de navegacion React Native.
- Se alineo `prisma` CLI con `@prisma/client`.
- Se añadieron `apps/mobile/app/_layout.tsx` y `apps/mobile/app/index.tsx` minimos para que TypeScript tenga entradas reales en mobile.
- Se corrigió la inyección de `HealthService` con `@Inject(HealthService)` porque `tsx` no aporta metadata suficiente para inyección automática por tipo.

Archivos tocados:

- `apps/api/package.json`
- `apps/web/package.json`
- `apps/mobile/package.json`
- `apps/mobile/app/`
- `apps/api/tsconfig.json`
- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/modules/health/`
- `pnpm-lock.yaml`
- `README.md`
- `docs/AGENT_HANDOFF.md`
- documentos de planificacion obsoletos, eliminados posteriormente

Validacion ejecutada:

- `corepack pnpm install --ignore-scripts`
- `corepack pnpm --filter api add ...`
- `corepack pnpm --filter web add ...`
- `corepack pnpm --filter mobile add ...`
- `corepack pnpm ignored-builds`
- `corepack pnpm --filter api typecheck`
- `corepack pnpm --filter web typecheck`
- `corepack pnpm --filter mobile typecheck`
- `corepack pnpm --filter api build`
- `corepack pnpm --filter api dev`
- `curl -s http://localhost:3000/api/v1/health`
- `curl -s http://localhost:3000/api/v1/health/live`
- `curl -s http://localhost:3000/api/v1/health/ready`

Pendientes:

- Crear commit con API minima y dependencias completas si el usuario lo aprueba.

### 2026-05-22 - Codex

Branch:

No hay repositorio Git activo en este workspace.

Cambios realizados:

- Se creo `docs/` en la raiz.
- Se movieron los documentos Markdown de planificacion a `docs/`.
- Se mantuvo `README.md` en la raiz como entrada principal del repo.
- Se actualizaron enlaces del README raiz hacia `docs/`.
- Se actualizaron referencias internas a `docs/AGENT_HANDOFF.md`.
- Se corrigieron los enlaces del style guide hacia `../assets/brand/`.

Archivos tocados:

- `README.md`
- `docs/`
- `docs/AGENT_HANDOFF.md`
- `docs/FRONTEND_STYLE_GUIDE.md`
- `docs/DEPENDENCY_SECURITY.md`
- documentos de planificacion obsoletos, eliminados posteriormente

Validacion ejecutada:

- Revision textual con `rg` para encontrar enlaces antiguos a documentos Markdown de raiz y assets.

Pendientes:

- Revisar estructura final con el usuario antes de inicializar Git.

### 2026-05-22 - Codex

Branch:

No hay repositorio Git activo en este workspace.

Cambios realizados:

- Se creo el esqueleto inicial del monorepo.
- Se añadieron `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.env.example` y `.gitignore` en la raiz.
- Se crearon `apps/api`, `apps/web` y `apps/mobile`, cada una con su propio `package.json`.
- Se creo la estructura backend dentro de `apps/api` con Prisma, `src/modules`, `src/shared` y providers placeholder.
- Se respetó la estructura Spring-style en cada carpeta de backend: `controllers`, `dtos`, `entities`, `mappers`, `repositories` y `services`.
- Se añadieron `.gitkeep` para conservar carpetas vacias del esqueleto.
- No se instalaron dependencias ni se ejecutaron scripts.

Archivos tocados:

- `package.json`
- `pnpm-workspace.yaml`
- `.npmrc`
- `.env.example`
- `.gitignore`
- `apps/api/`
- `apps/web/`
- `apps/mobile/`
- `AGENT_HANDOFF.md`

Validacion ejecutada:

- Pendiente de instalar dependencias.
- Pendiente de ejecutar comandos de `pnpm`.

Pendientes:

- Recibir datos de Git/remoto del usuario.
- Inicializar Git cuando el usuario lo confirme o pase el remoto.
- Instalar dependencias solo con la politica de seguridad acordada.
- Implementar API minima con health checks en el siguiente paso.

### 2026-05-22 - Codex

Branch:

No hay repositorio Git activo en este workspace.

Cambios realizados:

- Se corrigieron los documentos para reflejar la estructura limpia decidida por el usuario.
- Se elimino la estructura antigua basada en `packages/` compartidos.
- Se dejo claro que Prisma y todos los providers viven dentro de `apps/api`.
- Se dejo claro que `apps/web` y `apps/mobile` son las unicas apps fuera del backend y consumen la API por HTTP.
- Se corrigio la estructura backend para que siga un estilo Spring Boot con controllers, DTOs, entities, mappers, repositories y services.
- Se reescribio el roadmap para que sea una lista simple de pasos concretos, no una guia pesada por fases y conceptos abstractos.
- Se limpio este handoff para no arrastrar historial de una estructura anterior borrada.

Archivos tocados:

- `README.md`
- `AGENT_HANDOFF.md`
- documentos de planificacion obsoletos, eliminados posteriormente
- `FRONTEND_STYLE_GUIDE.md`
- `DEPENDENCY_SECURITY.md`
- `GIT_WORKFLOW.md`

Validacion ejecutada:

- Revision textual con `rg` para encontrar referencias antiguas a `packages/`, `docs/`, `api-client` y rutas obsoletas.

Pendientes:

- Crear la estructura real del monorepo cuando el usuario lo confirme.
- Revisar de nuevo con `rg` antes de implementar para evitar referencias viejas.
