# ExamInA - Problemas actuales y deuda técnica

Última revisión: 2026-06-05.

Este documento centraliza problemas abiertos, riesgos técnicos y decisiones pendientes. No reemplaza al roadmap: sirve para no perder contexto antes de priorizar el siguiente bloque de trabajo.

## Prioridad preliminar

| Prioridad | Problema | Área | Estado |
| --- | --- | --- | --- |
| P1 | Feed/Comunidad: publicaciones tipo red social | API/Web/Mobile | Abierto |
| P2 | Pantalla especial para exámenes oficiales | Mobile | Abierto |
| P2 | Sistema de amigos (Friends) | API/Web/Mobile | Abierto |
| P2 | Tokens visuales hardcodeados en frontends | Web/Mobile | Abierto |
| P2 | Estrategia de assets compartidos entre web/mobile | Monorepo | Abierto |
| P2 | Tecnología del tablero/pizarra de examen | Mobile | En evaluación |
| P3 | Logs de debug en parser/proveedor IA | API | Abierto |
| P3 | Seeds oficiales de exámenes y limpieza de datos de prueba | API/DB | Abierto (Diferido) |
| P3 | Micro-recompensas de XP (anti-farming) y Toasts | API/Web/Mobile | Idea |

## Problemas abiertos

Ver también `docs/EXAM_FLOW_AND_ENTITY_CONNECTIONS.md` para el mapa actual de entidades, conexiones y reglas pendientes alrededor de exámenes.

### 1. Feed/Comunidad: publicaciones tipo red social

Estado: Abierto

Problema:
No existe un feed social dentro de la aplicación. Se necesita un espacio tipo Facebook/Instagram donde los usuarios puedan crear publicaciones, compartir su progreso, hacer preguntas e interactuar con la comunidad.

Requerimientos:
- Diseñar modelo de datos para posts (texto, imágenes, autor, timestamps, likes, comentarios).
- Crear endpoints CRUD en la API para publicaciones.
- Implementar la pantalla de Feed tanto en Web como en Mobile.
- Decidir si los posts serán públicos, por asignatura, o por grupo de amigos.
- Moderar contenido (reportar, ocultar, borrar).
- Paginación infinita con scroll.

Impacto: Feature core de engagement y retención. Sin esto, la app es solo un sistema de exámenes individual.

Branch sugerida: `feature/feed-community`

### 2. Sistema de amigos (Friends)

Estado: Abierto

Problema:
No existe un sistema de relaciones sociales entre usuarios. Los usuarios no pueden encontrar, agregar ni interactuar con otros usuarios.

Requerimientos:
- Modelo de datos para relaciones de amistad (solicitud, aceptación, bloqueo).
- Endpoints en API: enviar solicitud, aceptar/rechazar, listar amigos, buscar usuarios.
- UI en Web y Mobile para buscar usuarios, ver solicitudes pendientes y lista de amigos.
- Decidir si la amistad es bidireccional (ambos aceptan) o unidireccional (seguir).
- Integrar con el feed (ver posts de amigos) y con logros (medallas sociales).
- Protección anti-farming de XP por agregar/eliminar amigos.

Impacto: Base para todas las features sociales (feed filtrado, rankings, retos entre amigos).

Branch sugerida: `feature/friends-system`


### 4. Tokens visuales hardcodeados en frontends

Problema:
- Hay colores, radios, sombras, medidas y tamaños hardcodeados en componentes web/mobile.
- Esto complica mantener consistencia visual y rediseñar.

Acción propuesta:
- Definir fuente única por frontend:
  - Web: CSS variables/Tailwind theme o archivo de tokens.
  - Mobile: `src/theme` con `colors`, `spacing`, `radius`, `typography`, `shadows`.
- Reemplazar hardcodes gradualmente cuando se toque cada pantalla.

### 5. Estrategia de assets compartidos entre web/mobile

Pregunta:
- Mover todos los assets a la raíz y consumirlos desde web/mobile.

Propuesta:
- Mantener assets de marca compartidos en `assets/brand`.
- Para mobile, usar una capa explícita de imports o copiar assets necesarios al bundle mobile si Metro da problemas.

### 6. Tecnología del tablero/pizarra de examen

Riesgos de la implementación actual en React Native:
- Puede sufrir con muchos trazos.
- Borrador actual pinta blanco encima, no borra vectorialmente.

Decisión preliminar:
- Mantener la implementación actual para MVP si el rendimiento es aceptable.
- Evaluar migración a Skia si el tablero se vuelve central para matemáticas/física/química.

### 7. Logs de debug en IA/parser

Problema:
- Hay logs de debug en parser de respuestas IA y catch de correcciones que pueden exponer respuestas crudas del LLM.

Acción propuesta:
- Dejar logs controlados por variable de entorno. No imprimir payloads completos en producción.

### 8. Micro-recompensas de XP independientes por acciones (anti-farming)

Estado: Idea (dejado para el futuro).

Propuesta de nueva feature:
- Otorgar pequeñas recompensas de XP por acciones aisladas: crear exámenes, responder preguntas, añadir amigos.
- Se requiere diseñar cuidadosamente los algoritmos y límites diarios/semanales de farmeo.

### 9. Pantalla especial para exámenes oficiales

Estado: Abierto

Problema:
Se necesita una vista/pantalla especializada y diferenciada para listar, acceder y realizar exámenes oficiales, separada del flujo general de exámenes por temas o simulacros regulares.

Requerimientos:
- Diseñar y maquetar una nueva pantalla enfocada en exámenes oficiales.
- Conectar con la API para listar los exámenes oficiales disponibles.
- Diferenciar visualmente la "tarjeta" o botón de acceso a esta pantalla desde el Dashboard o Subject Details.

## Decisiones pendientes

- Confirmar si el heartbeat mobile será cada 30 segundos.
- Decidir si el tablero actual se queda para MVP o se migra a Skia antes.
- Decidir política final para assets compartidos.
- Definir si los seeds oficiales corren solo manualmente o también en bootstrap de desarrollo.

## Siguiente paso recomendado

Orden sugerido teniendo en cuenta dependencias:

1. Feed/Comunidad (feature core de engagement, backend + ambas plataformas).
2. Sistema de amigos (se integra con el feed).
3. Tokens y UI/UX Refactor.
