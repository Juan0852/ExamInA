# ExamInA - Propuesta inicial de endpoints

Este documento describe una primera propuesta de endpoints para la API de ExamInA.

No es una especificación final de OpenAPI todavía. La intención es tener un mapa claro de recursos, flujos y módulos antes de implementar controllers en NestJS.

## Convenciones generales

Base sugerida:

```txt
/api/v1
```

Autenticación:

```txt
Authorization: Bearer <firebase_id_token>
```

El backend debe verificar el token con `AuthProvider`, obtener el `firebaseUid`, buscar o crear el usuario interno y usar ese `userId` para las operaciones protegidas.

Formato general de respuesta:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Formato general de error:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje legible",
    "details": {}
  }
}
```

## Auth

Endpoints relacionados con sesión, usuario autenticado y sincronización con Firebase.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/session` | Sí | Verifica el ID token de Firebase y crea/actualiza el usuario interno. | `User`, `UserProfile`, `UserPreferences`, `UserProgress` |
| `GET` | `/auth/me` | Sí | Devuelve el usuario autenticado actual. | `User`, `UserProfile` |
| `POST` | `/auth/logout` | Sí | Invalida sesión local si se implementa estado server-side. | `User` |

Notas:

- El login real ocurre en web/mobile con Firebase Auth.
- La API no recibe ni guarda contraseñas.
- Google login y email/password conviven en Firebase, no en PostgreSQL.

## Users

Endpoints para consultar usuarios y perfiles públicos.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/users/:userId` | Sí | Consulta información pública básica de un usuario. | `User`, `UserProfile` |
| `GET` | `/users/by-username/:username` | Sí | Consulta un usuario por username. | `User`, `UserProfile` |
| `GET` | `/users/search` | Sí | Busca usuarios por username/displayName. | `User`, `UserProfile`, `Friendship` |
| `GET` | `/users/:userId/profile` | Sí | Devuelve perfil público extendido de otro usuario. | `User`, `UserProfile`, `UserProgress`, `Friendship` |
| `GET` | `/users/:userId/posts` | Sí | Lista posts publicados por un usuario. | `CommunityPost` |
| `GET` | `/users/:userId/shared-exams` | Sí | Lista exámenes creados/compartidos por un usuario. | `SharedExam` |

Notas:

- `UserPreferences` no debe exponerse en perfiles ajenos.
- El perfil ajeno puede incluir relación de amistad: sin relación, pendiente, amigo o bloqueado.

## Profile

Endpoints para gestionar el perfil del usuario autenticado.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/profile` | Sí | Devuelve el perfil propio completo. | `User`, `UserProfile`, `UserProgress` |
| `PATCH` | `/profile` | Sí | Actualiza username, bio, avatar, banner u otros datos editables. | `UserProfile`, `FileAsset` |
| `GET` | `/profile/posts` | Sí | Lista mis posts. | `CommunityPost` |
| `GET` | `/profile/exams/created` | Sí | Lista los exámenes compartidos creados por mí. | `SharedExam` |
| `GET` | `/profile/exams/in-progress` | Sí | Lista exámenes propios o compartidos que estoy haciendo. | `ExamSession`, `SharedExamUsage` |
| `GET` | `/profile/exams/completed` | Sí | Lista mis exámenes finalizados. | `ExamSession` |

## Preferences

Preferencias privadas del usuario autenticado.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/preferences` | Sí | Devuelve mis preferencias. | `UserPreferences` |
| `PATCH` | `/preferences` | Sí | Actualiza preferencias. | `UserPreferences` |

## Subjects

Asignaturas disponibles.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/subjects` | No/Sí | Lista asignaturas. | `Subject` |
| `GET` | `/subjects/:subjectId` | No/Sí | Detalle de una asignatura. | `Subject` |
| `GET` | `/subjects/:subjectId/topics` | No/Sí | Lista temas de una asignatura. | `Topic` |
| `POST` | `/subjects` | Admin | Crea asignatura. | `Subject` |
| `PATCH` | `/subjects/:subjectId` | Admin | Actualiza asignatura. | `Subject` |
| `DELETE` | `/subjects/:subjectId` | Admin | Elimina o desactiva asignatura. | `Subject` |

## Topics

Temas dentro de asignaturas.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/topics` | No/Sí | Lista temas con filtros por asignatura. | `Topic`, `Subject` |
| `GET` | `/topics/:topicId` | No/Sí | Detalle de tema. | `Topic`, `Subject` |
| `POST` | `/topics` | Admin | Crea tema. | `Topic` |
| `PATCH` | `/topics/:topicId` | Admin | Actualiza tema. | `Topic` |
| `DELETE` | `/topics/:topicId` | Admin | Elimina o desactiva tema. | `Topic` |

## Questions

Banco de preguntas.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/questions` | Sí | Lista preguntas con filtros por subject, topic, difficulty, type. | `Question`, `Subject`, `Topic` |
| `GET` | `/questions/:questionId` | Sí | Detalle de una pregunta. | `Question`, `QuestionKeyword` |
| `GET` | `/questions/:questionId/solution` | Sí | Devuelve solución esperada según permisos/contexto. | `QuestionSolution`, `QuestionKeyword` |
| `POST` | `/questions` | Admin | Crea pregunta. | `Question`, `QuestionSolution`, `QuestionKeyword` |
| `PATCH` | `/questions/:questionId` | Admin | Actualiza pregunta. | `Question` |
| `DELETE` | `/questions/:questionId` | Admin | Elimina o desactiva pregunta. | `Question` |

Notas:

- En práctica normal quizá no se debe mostrar solución antes de responder.
- En revisión de examen sí debe poder mostrarse.

## Flashcards

Flashcards como modo de estudio. Inicialmente pueden apoyarse en `Question` con `type = FLASHCARD`.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/flashcards` | Sí | Lista flashcards con filtros. | `Question`, `Topic`, `Subject` |
| `GET` | `/flashcards/:flashcardId` | Sí | Detalle de una flashcard. | `Question`, `QuestionSolution` |
| `POST` | `/flashcards/:flashcardId/review` | Sí | Registra repaso de flashcard. | `StudyActivity`, `UserProgress`, `UserTopicProgress` |

## Attempts

Intentos individuales de respuesta.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/attempts` | Sí | Crea un intento de respuesta a una pregunta. | `Attempt` |
| `GET` | `/attempts` | Sí | Lista mis intentos. | `Attempt`, `Question`, `Correction` |
| `GET` | `/attempts/:attemptId` | Sí | Detalle de un intento. | `Attempt`, `Question`, `Correction`, `AttemptAsset` |
| `GET` | `/attempts/:attemptId/correction` | Sí | Obtiene la corrección del intento. | `Correction` |
| `POST` | `/attempts/:attemptId/assets` | Sí | Asocia un archivo a un intento. | `AttemptAsset`, `FileAsset` |

## Corrections

Corrección asistida por IA.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/corrections/evaluate-written-answer` | Sí | Evalúa una respuesta escrita. | `Attempt`, `Correction`, `Question`, `QuestionSolution`, `QuestionKeyword` |
| `POST` | `/corrections/evaluate-image-answer` | Sí | Evalúa una respuesta desde imagen/OCR cuando exista. | `FileAsset`, `LlmReviewAsset`, `Attempt`, `Correction` |
| `GET` | `/corrections/:correctionId` | Sí | Consulta una corrección. | `Correction` |

Flujo escrito recomendado:

1. Validar input con Zod.
2. Crear o localizar `Attempt`.
3. Buscar pregunta, solución, criterios y keywords.
4. Llamar a `CorrectionProvider`.
5. Validar salida IA con Zod.
6. Guardar `Correction`.
7. Actualizar progreso.

## Exam Sessions

Exámenes, simulacros y sesiones de práctica completas.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/exam-sessions` | Sí | Crea un examen/simulacro. | `ExamSession`, `ExamSessionQuestion` |
| `GET` | `/exam-sessions` | Sí | Lista mis sesiones con filtros por status/mode. | `ExamSession` |
| `GET` | `/exam-sessions/resumable` | Sí | Lista exámenes recuperables. | `ExamSession`, `ExamSessionQuestion`, `ExamSessionAnswer` |
| `GET` | `/exam-sessions/:examSessionId` | Sí | Detalle de sesión. | `ExamSession`, `ExamSessionQuestion`, `ExamSessionAnswer` |
| `POST` | `/exam-sessions/:examSessionId/start` | Sí | Inicia una sesión. | `ExamSession` |
| `POST` | `/exam-sessions/:examSessionId/answers` | Sí | Guarda respuesta a una pregunta del examen. | `ExamSessionAnswer`, `Attempt` |
| `POST` | `/exam-sessions/:examSessionId/finish` | Sí | Finaliza examen y calcula resumen. | `ExamSession`, `ExamSessionAnswer`, `Correction` |
| `POST` | `/exam-sessions/:examSessionId/abandon` | Sí | Marca examen como abandonado. | `ExamSession` |
| `POST` | `/exam-sessions/:examSessionId/resume` | Sí | Recupera un examen si no expiró. | `ExamSession` |
| `GET` | `/exam-sessions/:examSessionId/progress` | Sí | Devuelve progreso para progress bar. | `ExamSessionQuestion`, `ExamSessionAnswer` |
| `GET` | `/exam-sessions/:examSessionId/review` | Sí | Devuelve revisión completa del examen. | `ExamSession`, `ExamSessionQuestion`, `ExamSessionAnswer`, `Correction` |

Progreso sugerido:

```txt
totalQuestions = count(ExamSessionQuestion)
answeredQuestions = count(ExamSessionAnswer)
progressPercent = answeredQuestions / totalQuestions * 100
```

## Shared Exams

Exámenes creados o compartidos por usuarios.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/shared-exams` | Sí | Crea un examen compartible desde cero. | `SharedExam`, `SharedExamQuestion` |
| `POST` | `/shared-exams/from-session/:examSessionId` | Sí | Crea examen compartible desde una sesión existente. | `ExamSession`, `SharedExam`, `SharedExamQuestion` |
| `GET` | `/shared-exams` | Sí | Lista exámenes compartidos con filtros. | `SharedExam`, `UserProfile` |
| `GET` | `/shared-exams/:sharedExamId` | Sí | Detalle de examen compartido. | `SharedExam`, `SharedExamQuestion` |
| `PATCH` | `/shared-exams/:sharedExamId` | Sí/Owner | Actualiza título, descripción, visibilidad o estado. | `SharedExam` |
| `DELETE` | `/shared-exams/:sharedExamId` | Sí/Owner/Admin | Elimina o archiva examen compartido. | `SharedExam` |
| `POST` | `/shared-exams/:sharedExamId/start` | Sí | Empieza a usar un examen compartido y crea sesión propia. | `SharedExamUsage`, `ExamSession` |
| `GET` | `/shared-exams/:sharedExamId/usages` | Owner/Admin | Lista quién ha usado el examen. | `SharedExamUsage`, `UserProfile` |
| `GET` | `/shared-exams/usages/me` | Sí | Lista exámenes compartidos que estoy usando o he usado. | `SharedExamUsage`, `SharedExam`, `ExamSession` |

## Files

Subida de archivos mediante presigned URLs.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/files/presigned-url` | Sí | Genera URL firmada para subir a S3. | `FileAsset` |
| `POST` | `/files` | Sí | Confirma metadata de archivo ya subido. | `FileAsset` |
| `GET` | `/files/:fileId` | Sí | Devuelve metadata de archivo. | `FileAsset` |
| `GET` | `/files/:fileId/signed-url` | Sí | Genera URL temporal de lectura. | `FileAsset` |
| `DELETE` | `/files/:fileId` | Sí/Owner/Admin | Elimina o marca archivo como borrado. | `FileAsset` |

## OCR and LLM Review Assets

Procesamiento futuro de imágenes/documentos.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/llm-review-assets` | Sí | Crea proceso de revisión OCR/LLM para archivo. | `LlmReviewAsset`, `FileAsset` |
| `GET` | `/llm-review-assets/:reviewId` | Sí | Consulta estado de revisión. | `LlmReviewAsset` |
| `POST` | `/llm-review-assets/:reviewId/process` | Admin/System | Lanza procesamiento OCR/LLM. | `LlmReviewAsset`, `Correction` |

## Friends

Amistades, solicitudes y bloqueos entre usuarios.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/friends` | Sí | Lista mis amigos. | `Friendship`, `UserProfile` |
| `GET` | `/friends/requests/incoming` | Sí | Solicitudes recibidas. | `Friendship`, `UserProfile` |
| `GET` | `/friends/requests/outgoing` | Sí | Solicitudes enviadas. | `Friendship`, `UserProfile` |
| `POST` | `/friends/requests` | Sí | Envía solicitud de amistad. | `Friendship` |
| `POST` | `/friends/requests/:friendshipId/accept` | Sí | Acepta solicitud. | `Friendship` |
| `POST` | `/friends/requests/:friendshipId/reject` | Sí | Rechaza solicitud. | `Friendship` |
| `DELETE` | `/friends/:friendshipId` | Sí | Elimina amistad. | `Friendship` |
| `POST` | `/friends/block` | Sí | Bloquea a un usuario. | `Friendship` |
| `POST` | `/friends/:friendshipId/unblock` | Sí | Desbloquea a un usuario. | `Friendship` |

## Progress

Progreso, estadísticas y actividad.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/progress` | Sí | Progreso global del usuario. | `UserProgress` |
| `GET` | `/progress/subjects` | Sí | Progreso por asignatura. | `UserSubjectProgress`, `Subject` |
| `GET` | `/progress/topics` | Sí | Progreso por tema. | `UserTopicProgress`, `Topic` |
| `GET` | `/progress/activity` | Sí | Actividad diaria/calendario. | `StudyActivity` |
| `GET` | `/progress/dashboard` | Sí | Resumen para dashboard. | `UserProgress`, `StudyActivity`, `ExamSession`, `Attempt` |

## Achievements

Logros y gamificación.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/achievements` | Sí | Lista logros disponibles. | `Achievement` |
| `GET` | `/achievements/me` | Sí | Lista mis logros desbloqueados. | `UserAchievement`, `Achievement` |
| `POST` | `/achievements` | Admin | Crea logro. | `Achievement` |
| `PATCH` | `/achievements/:achievementId` | Admin | Actualiza logro. | `Achievement` |

## Community

Feed, posts, comentarios y reacciones.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/community/feed` | Sí | Feed principal. | `CommunityPost`, `CommunityReaction`, `CommunityComment` |
| `POST` | `/community/posts` | Sí | Crea post. | `CommunityPost` |
| `GET` | `/community/posts/:postId` | Sí | Detalle de post. | `CommunityPost`, `CommunityComment`, `CommunityReaction` |
| `PATCH` | `/community/posts/:postId` | Sí/Owner | Edita post. | `CommunityPost` |
| `DELETE` | `/community/posts/:postId` | Sí/Owner/Admin | Borra u oculta post. | `CommunityPost` |
| `POST` | `/community/posts/:postId/comments` | Sí | Comenta un post. | `CommunityComment` |
| `PATCH` | `/community/comments/:commentId` | Sí/Owner | Edita comentario. | `CommunityComment` |
| `DELETE` | `/community/comments/:commentId` | Sí/Owner/Admin | Borra u oculta comentario. | `CommunityComment` |
| `POST` | `/community/posts/:postId/reactions` | Sí | Reacciona a un post. | `CommunityReaction` |
| `DELETE` | `/community/posts/:postId/reactions` | Sí | Quita reacción de un post. | `CommunityReaction` |
| `POST` | `/community/comments/:commentId/reactions` | Sí | Reacciona a un comentario. | `CommunityReaction` |
| `DELETE` | `/community/comments/:commentId/reactions` | Sí | Quita reacción de un comentario. | `CommunityReaction` |

Tipos de post esperados:

- texto;
- duda;
- consejo;
- progreso;
- resultado de examen;
- examen compartido.

## Reports

Reportes de contenido o usuarios.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `POST` | `/reports` | Sí | Crea reporte sobre post, comentario, usuario o examen compartido. | `ContentReport` |
| `GET` | `/reports/me` | Sí | Lista reportes hechos por mí. | `ContentReport` |
| `GET` | `/reports` | Moderator/Admin | Cola de reportes. | `ContentReport`, `CommunityPost`, `CommunityComment`, `SharedExam`, `User` |
| `GET` | `/reports/:reportId` | Moderator/Admin | Detalle de reporte. | `ContentReport` |
| `POST` | `/reports/:reportId/resolve` | Moderator/Admin | Marca reporte como resuelto. | `ContentReport`, `UserModerationAction` |
| `POST` | `/reports/:reportId/dismiss` | Moderator/Admin | Descarta reporte. | `ContentReport` |

## Moderation

Acciones de moderación de plataforma.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/moderation/users/:userId/actions` | Moderator/Admin | Historial de moderación de usuario. | `UserModerationAction` |
| `POST` | `/moderation/users/:userId/warn` | Moderator/Admin | Advierte a un usuario. | `UserModerationAction`, `User` |
| `POST` | `/moderation/users/:userId/suspend` | Moderator/Admin | Suspende temporalmente usuario. | `UserModerationAction`, `User` |
| `POST` | `/moderation/users/:userId/ban` | Admin | Banea usuario. | `UserModerationAction`, `User` |
| `POST` | `/moderation/users/:userId/restore` | Admin | Restaura cuenta. | `UserModerationAction`, `User` |
| `POST` | `/moderation/posts/:postId/hide` | Moderator/Admin | Oculta post. | `CommunityPost` |
| `POST` | `/moderation/comments/:commentId/hide` | Moderator/Admin | Oculta comentario. | `CommunityComment` |
| `POST` | `/moderation/shared-exams/:sharedExamId/hide` | Moderator/Admin | Oculta examen compartido. | `SharedExam` |

## Admin

Endpoints administrativos generales.

| Método | Endpoint | Protegido | Propósito | Entidades |
| --- | --- | --- | --- | --- |
| `GET` | `/admin/users` | Admin | Lista usuarios con filtros. | `User`, `UserProfile` |
| `GET` | `/admin/users/:userId` | Admin | Detalle administrativo de usuario. | `User`, `UserProfile`, `UserProgress`, `UserModerationAction` |
| `PATCH` | `/admin/users/:userId/role` | Admin | Cambia rol de usuario. | `User` |
| `PATCH` | `/admin/users/:userId/status` | Admin | Cambia estado de usuario. | `User`, `UserModerationAction` |

## Health and Internal

Endpoints técnicos.

| Método | Endpoint | Protegido | Propósito |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Estado general de la API. |
| `GET` | `/health/live` | No | Liveness check: confirma que el proceso está vivo. |
| `GET` | `/health/ready` | No/Admin | Readiness check: confirma que dependencias mínimas están listas. |
| `GET` | `/health/api` | No | Verifica que NestJS responde correctamente. |
| `GET` | `/health/database` | Admin/System | Verifica conexión a PostgreSQL local o Supabase PostgreSQL. |
| `GET` | `/health/prisma` | Admin/System | Verifica que Prisma puede ejecutar una query simple. |
| `GET` | `/health/auth` | Admin/System | Verifica que el `AuthProvider` está configurado. |
| `GET` | `/health/auth/firebase` | Admin/System | Verifica Firebase Admin en entornos donde esté activo. |
| `GET` | `/health/llm` | Admin/System | Verifica provider LLM configurado, local o remoto. |
| `GET` | `/health/llm/local` | Admin/System | Verifica LLM local durante desarrollo/debugging. |
| `GET` | `/health/llm/openai` | Admin/System | Verifica OpenAI u otro proveedor remoto cuando aplique. |
| `GET` | `/health/storage` | Admin/System | Verifica storage configurado. |
| `GET` | `/health/storage/s3` | Admin/System | Verifica acceso/configuración de AWS S3. |
| `GET` | `/health/ocr` | Admin/System | Verifica provider OCR configurado. |
| `GET` | `/health/ocr/mock` | Admin/System | Verifica OCR mock durante desarrollo. |
| `GET` | `/health/files` | Admin/System | Verifica flujo base de archivos y presigned URLs. |
| `GET` | `/health/corrections` | Admin/System | Verifica módulo de correcciones y provider de IA. |
| `GET` | `/health/exam-sessions` | Admin/System | Verifica módulo de sesiones de examen. |
| `GET` | `/health/community` | Admin/System | Verifica módulo de comunidad/feed. |
| `GET` | `/health/reports` | Admin/System | Verifica módulo de reportes. |
| `GET` | `/health/moderation` | Admin/System | Verifica módulo de moderación. |

Respuesta sugerida para un health check:

```json
{
  "data": {
    "status": "ok",
    "service": "database",
    "provider": "local-postgres",
    "latencyMs": 12,
    "checkedAt": "2026-05-22T10:00:00.000Z"
  },
  "meta": {},
  "error": null
}
```

Estados sugeridos:

- `ok`
- `degraded`
- `down`

Notas:

- `/health/live` debe ser barato y no depender de servicios externos.
- `/health/ready` sí puede comprobar dependencias mínimas como base de datos y configuración crítica.
- Los endpoints específicos de proveedores permiten saber si falla el sistema completo o solo una integración concreta.
- En desarrollo puede estar sano `/health/llm/local` aunque `/health/llm/openai` no esté configurado.

## Posibles endpoints futuros

Conversaciones privadas no entran en el MVP inicial, pero podrían añadirse después.

| Método | Endpoint | Propósito |
| --- | --- | --- |
| `GET` | `/conversations` | Lista conversaciones del usuario. |
| `POST` | `/conversations` | Crea conversación. |
| `GET` | `/conversations/:conversationId/messages` | Lista mensajes. |
| `POST` | `/conversations/:conversationId/messages` | Envía mensaje. |
| `POST` | `/messages/:messageId/report` | Reporta mensaje privado. |

Entidades futuras probables:

- `Conversation`
- `ConversationParticipant`
- `DirectMessage`
- `MessageReport`

## Prioridad sugerida para implementación

1. `Auth`
2. `Profile`
3. `Subjects`
4. `Topics`
5. `Questions`
6. `Attempts`
7. `Corrections`
8. `Exam Sessions`
9. `Progress`
10. `Files/Uploads` base
11. `Friends`
12. `Shared Exams`
13. `Community`
14. `Reports`
15. `Moderation`
16. `Admin`

El MVP debería centrarse primero en autenticación, preguntas, intentos, corrección, exámenes, progreso y perfil. Comunidad, reportes y moderación pueden entrar como base estructural, pero no tienen que estar completos desde el primer bloque funcional.
