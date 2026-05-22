# ExamInA - Agent Handoff

Este documento existe para que cualquier agente de IA pueda continuar el desarrollo de ExamInA sin arrastrar decisiones antiguas.

## Regla principal

Antes de trabajar, un agente debe leer:

1. `README.md`
2. `docs/AGENT_HANDOFF.md`
3. El documento especifico relacionado con la tarea:
   - `docs/EXAMINA_PROJECT_PLAN.md`
   - `docs/EXAMINA_ENTITY_DIAGRAM.md`
   - `docs/EXAMINA_API_ENDPOINTS.md`
   - `docs/IMPLEMENTATION_ROADMAP.md`
   - `docs/GIT_WORKFLOW.md`
   - `docs/CODE_COMMENTING_GUIDE.md`

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
- Se corrigió la inyección de `HealthService` con `@Inject(HealthService)` porque `tsx` no aporta metadata suficiente para inyección automática por tipo.

Archivos tocados:

- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/modules/health/`
- `pnpm-lock.yaml`
- `README.md`
- `docs/AGENT_HANDOFF.md`
- `docs/EXAMINA_PROJECT_PLAN.md`
- `docs/IMPLEMENTATION_ROADMAP.md`

Validacion ejecutada:

- `corepack pnpm install --ignore-scripts`
- `corepack pnpm --filter api typecheck`
- `corepack pnpm --filter api build`
- `corepack pnpm --filter api dev`
- `curl -s http://localhost:3000/api/v1/health`
- `curl -s http://localhost:3000/api/v1/health/live`
- `curl -s http://localhost:3000/api/v1/health/ready`

Pendientes:

- Crear commit de la API minima si el usuario lo aprueba.

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
- `docs/IMPLEMENTATION_ROADMAP.md`

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
- `EXAMINA_PROJECT_PLAN.md`
- `IMPLEMENTATION_ROADMAP.md`
- `EXAMINA_API_ENDPOINTS.md`
- `FRONTEND_STYLE_GUIDE.md`
- `DEPENDENCY_SECURITY.md`
- `GIT_WORKFLOW.md`

Validacion ejecutada:

- Revision textual con `rg` para encontrar referencias antiguas a `packages/`, `docs/`, `api-client` y rutas obsoletas.

Pendientes:

- Crear la estructura real del monorepo cuando el usuario lo confirme.
- Revisar de nuevo con `rg` antes de implementar para evitar referencias viejas.
