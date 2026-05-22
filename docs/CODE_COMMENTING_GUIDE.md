# ExamInA - Code Commenting Guide

Este documento define como comentar el codigo en ExamInA.

Queremos que el codigo quede bien explicado para humanos y agentes de IA, pero sin llenarlo de comentarios obvios.

## Regla principal

Comentar la intencion, no lo evidente.

Un comentario debe ayudar a entender:

- por que existe una decision;
- que contrato debe respetarse;
- que caso borde se esta cubriendo;
- que parte sera reemplazada por un provider real;
- que riesgo hay si se cambia algo;
- que queda pendiente.

No debe repetir literalmente lo que ya dice el codigo.

## Cuando comentar

Anadir comentarios cuando:

- una funcion coordina varias capas o providers;
- una regla de negocio no es obvia;
- una decision viene de arquitectura documentada;
- hay una limitacion temporal;
- hay una integracion externa;
- hay un fallback o mock deliberado;
- hay una validacion importante de seguridad;
- hay una transformacion de datos delicada;
- hay logica de fechas, rachas, progreso o temporizadores;
- hay prompts o parsing de respuestas LLM;
- hay TODOs intencionales para fases futuras.

## Cuando no comentar

Evitar comentarios como:

```ts
// Create user
const user = createUser();

// Increment count
count++;

// Return result
return result;
```

Ese tipo de comentario mete ruido y envejece mal.

## Formato recomendado

### Comentarios de intencion

```ts
// Keep Firebase identity separate from internal user data so business tables
// never depend on the auth provider implementation.
```

### Comentarios de fase futura

```ts
// TODO(ocr-phase): replace the mock OCR provider once image correction enters scope.
```

### Comentarios de seguridad

```ts
// Do not expose user preferences in public profiles; they contain private UX choices.
```

### Comentarios de reglas de negocio

```ts
// A finished exam must remain reviewable even if the original question changes later.
```

## TODOs

Los TODOs deben tener contexto.

Formato:

```ts
// TODO(scope): describe the concrete pending work and why it is not done yet.
```

Ejemplos:

```ts
// TODO(firebase-auth): initialize Firebase Admin once environment handling is finalized.
// TODO(local-llm): add provider configuration after the local model endpoint is chosen.
// TODO(exam-review): include correction snapshots when historical reviews are implemented.
```

## Comentarios por capa

### Domain

Comentar reglas de negocio y restricciones importantes.

### Application

Comentar coordinacion entre casos de uso cuando haya pasos no obvios.

### Infrastructure

Comentar integraciones externas, mocks y decisiones de provider.

### Presentation

Comentar comportamiento HTTP poco evidente, permisos o exposicion de datos.

## Agentes de IA

Todo agente que cree o modifique codigo debe:

1. Anadir comentarios cuando la intencion no sea obvia.
2. Evitar comentarios redundantes.
3. Mantener TODOs accionables.
4. Actualizar este documento si cambia el criterio.
5. Preferir nombres claros antes que comentarios que expliquen nombres malos.

## Regla practica

Si un futuro agente podria romper algo por no entender el motivo de una decision, dejar un comentario breve.

Si el comentario solo traduce el codigo a lenguaje natural, no escribirlo.
