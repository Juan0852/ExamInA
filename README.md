# ExamInA

ExamInA sera una plataforma para preparar Selectividad/PAU mediante flashcards, preguntas tipo examen, simulacros y correccion asistida por IA.

Tagline:

```txt
Estudia. Practica. Aprueba.
```

## Estructura objetivo

El proyecto debe ser un monorepo limpio con tres apps y sin paquetes compartidos iniciales:

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

La raiz solo debe orquestar comandos del monorepo. Las dependencias reales de cada aplicacion viven en su propio `package.json`.

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

Prisma, migraciones, providers, repositories, services, controllers, guards y configuracion backend-only no deben salir de `apps/api`.

Cada carpeta de backend dentro de `apps/api/src/modules/` debe seguir una estructura parecida a Spring Boot:

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

No usar carpetas `domain/`, `application/`, `infrastructure/` y `presentation/` por defecto. La estructura base del backend debe ser directa y reconocible: controllers, DTOs, entities, mappers, repositories y services.

## Apps

```txt
apps/web/
  package.json

apps/mobile/
  package.json

apps/api/
  package.json
```

`apps/web` y `apps/mobile` consumen la API por HTTP. No importan Prisma, providers ni codigo interno del backend.

## Documentos de trabajo

- [Plan maestro del proyecto](./docs/EXAMINA_PROJECT_PLAN.md)
- [Diagrama de entidades](./docs/EXAMINA_ENTITY_DIAGRAM.md)
- [Propuesta inicial de endpoints](./docs/EXAMINA_API_ENDPOINTS.md)
- [Frontend style guide](./docs/FRONTEND_STYLE_GUIDE.md)
- [Dependency security policy](./docs/DEPENDENCY_SECURITY.md)
- [Implementation roadmap](./docs/IMPLEMENTATION_ROADMAP.md)
- [Code commenting guide](./docs/CODE_COMMENTING_GUIDE.md)
- [Workflow de Git](./docs/GIT_WORKFLOW.md)
- [Handoff para agentes](./docs/AGENT_HANDOFF.md)

Antes de implementar una parte grande del sistema, revisar si ya existe una decision documentada aqui. Si durante la implementacion cambia una decision importante, actualizar el documento correspondiente.
