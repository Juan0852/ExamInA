# ExamInA - Roadmap simple

Este roadmap existe para construir ExamInA sin volver a enredar la estructura.

La regla principal es sencilla: primero una base que arranque, luego datos, luego flujo academico, luego IA real y social.

## Reglas fijas

- No crear `packages/` en la fundacion inicial.
- No sacar backend fuera de `apps/api`.
- No meter Prisma, providers, repositories, services, controllers, DTOs, mappers ni entities fuera de `apps/api`.
- No empezar comunidad, reportes ni features grandes antes de tener estudiar pregunta -> responder -> corregir -> ver feedback.
- No hacer commits sin mostrar cambios y pedir confirmacion.
- Mantener `docs/AGENT_HANDOFF.md` actualizado cuando cambie algo importante.

## Estructura que se debe crear

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

## Backend esperado

Todo el backend vive en `apps/api`.

```txt
apps/api/
  prisma/
    schema.prisma
    migrations/
  src/
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
  package.json
  tsconfig.json
```

Cada carpeta dentro de `apps/api/src/modules/` debe verse asi:

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

Nada de `domain/`, `application/`, `infrastructure/`, `presentation/` ni `use-cases/` por defecto.

## Paso 1 - Raiz del monorepo

Crear solamente la base:

- `package.json`
- `pnpm-workspace.yaml`
- `.npmrc`
- `.env.example`
- `apps/api`
- `apps/web`
- `apps/mobile`

El `package.json` raiz solo orquesta:

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

Validacion:

- Las carpetas existen.
- Cada app tiene su propio `package.json`.
- No existe `packages/`.

## Paso 2 - API minima

Crear NestJS dentro de `apps/api`.

Primero solo debe arrancar y responder health:

- `GET /health`
- `GET /health/live`
- `GET /health/ready`

Estructura minima:

```txt
apps/api/src/
  modules/
  shared/
  app.module.ts
  main.ts
```

Validacion:

- `pnpm --filter api dev` arranca.
- `/health` responde.

## Paso 3 - Prisma y database

Crear:

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/`
- `apps/api/src/shared/database/prisma.service.ts`

Primeras tablas:

- `User`
- `UserProfile`
- `UserPreferences`
- `Subject`
- `Topic`
- `Question`
- `QuestionSolution`
- `QuestionKeyword`

Validacion:

- Prisma valida el schema.
- La API puede comprobar database en `/health/database`.

## Paso 4 - Auth local primero

Crear la carpeta `auth` con estructura Spring-style:

```txt
apps/api/src/modules/auth/
  controllers/
  dtos/
  entities/
  mappers/
  repositories/
  services/
  auth.module.ts
```

Crear providers compartidos:

```txt
apps/api/src/shared/providers/auth/
  auth-provider.interface.ts
  mock-auth.provider.ts
  firebase-auth.provider.ts
```

Primero usar mock/local. Firebase real viene despues.

Validacion:

- La API puede crear o devolver usuario interno desde un token mock.
- No se usa Supabase Auth.

## Paso 5 - Catalogo academico

Crear estas carpetas con la misma estructura:

- `subjects`
- `topics`
- `questions`

Endpoints minimos:

- listar asignaturas;
- listar temas;
- listar preguntas;
- ver detalle de pregunta.

Validacion:

- La web/mobile pueden pedir datos por HTTP.
- No importan nada interno de `apps/api`.

## Paso 6 - Web minima

Crear React + Vite en `apps/web`.

Pantallas iniciales:

- landing;
- login;
- dashboard;
- subjects;
- topics;
- question.

Validacion:

- `pnpm --filter web dev` arranca.
- La web navega entre pantallas.
- La web consume la API por HTTP.

## Paso 7 - Responder pregunta y correccion mock

Crear:

- `attempts`
- `corrections`

Crear provider:

```txt
apps/api/src/shared/providers/ai/
  correction-provider.interface.ts
  mock-correction.provider.ts
  openai-correction.provider.ts
```

Flujo:

1. Usuario abre una pregunta.
2. Usuario responde.
3. API crea attempt.
4. Mock correction devuelve feedback.
5. API guarda correction.
6. Web muestra resultado.

Validacion:

- El flujo completo funciona sin OpenAI.
- La respuesta del provider se valida antes de guardarse.

## Paso 8 - Mobile minima

Crear Expo en `apps/mobile`.

Pantallas iniciales:

- login;
- dashboard;
- subjects;
- question;
- profile.

Validacion:

- `pnpm --filter mobile start` arranca.
- Mobile consume la API por HTTP.
- No hay logo 3D en mobile.

## Paso 9 - Examen simple

Crear:

- `exam-sessions`

Flujo minimo:

1. Crear examen con varias preguntas.
2. Responder preguntas.
3. Guardar progreso.
4. Finalizar.
5. Ver revision.

Validacion:

- Se puede abandonar y volver a una sesion.
- Se puede revisar un examen terminado.

## Paso 10 - Progreso basico

Crear:

- `progress`
- `achievements`

Primero solo:

- intentos totales;
- score promedio;
- progreso por asignatura;
- racha simple;
- nivel/experiencia basicos.

Validacion:

- El dashboard muestra progreso real desde API.

## Despues del MVP academico

Estas cosas van despues, no antes:

- Firebase Auth real.
- OpenAI o LLM local real.
- S3 y subida de imagenes.
- OCR.
- amigos.
- comunidad.
- shared exams.
- reportes.
- moderacion.
- polish de release.

## Checklist antes de avanzar

Antes de pasar al siguiente paso:

- el paso actual arranca;
- no hay imports raros entre apps;
- no existe `packages/`;
- backend sigue dentro de `apps/api`;
- web/mobile consumen API por HTTP;
- docs importantes siguen actualizados.
