# Inventario de Endpoints API (ExamInA)

*Última revisión: 2026-06-02*

Este documento lista todos los endpoints actualmente implementados en los controladores del backend (`apps/api/src/modules`), comparados con las necesidades actuales de los clientes (Web y Mobile).

## Estado de Implementación

- **Implementado**: El endpoint existe en la API y es utilizado por al menos un cliente.
- **Parcial**: El endpoint existe, pero le faltan funcionalidades o validaciones requeridas por el cliente.
- **Faltante**: El cliente lo requiere o está planificado, pero no existe en el backend.
- **No necesario aún**: Existe en la API, pero ningún cliente lo está consumiendo actualmente.

---

### Achievements (`/achievements`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/me` | `GET` | Implementado | Utilizado para listar los logros del usuario actual. |
| `/me/evaluate` | `POST` | Implementado | Fuerza la evaluación de logros desbloqueables. |

### Auth (`/auth`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/me` | `GET` | Implementado | Recupera el usuario autenticado actual. |
| `/profile/username-availability` | `GET` | Implementado | Valida disponibilidad del username en onboarding. |
| `/friends` | `GET` | Implementado | Lista amigos. |
| `/friends/pending` | `GET` | Implementado | Solicitudes de amistad pendientes. |
| `/register` | `POST` | Implementado | Registro estándar. (Requiere revisión de validaciones según CURRENT_PROBLEMS). |
| `/login` | `POST` | Implementado | Login estándar. |
| `/google` | `POST` | Implementado | Login con Google usado en mobile y web. |
| `/session` | `POST` | Implementado | Creación de sesión. |
| `/onboarding/complete` | `POST` | Implementado | Guarda el progreso de onboarding atómicamente. |
| `/friends/request` | `POST` | Implementado | Enviar solicitud de amistad. |
| `/friends/respond` | `POST` | Implementado | Aceptar/Rechazar solicitud. |

### Community Posts (`/community/posts`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `GET` | Implementado | Obtener feed de la comunidad. |
| `/me` | `GET` | Implementado | Obtener posts del usuario actual. |
| `/` | `POST` | Implementado | Crear publicación. |
| `/:id/comments` | `POST` | Implementado | Comentar en publicación. |
| `/:id/reactions` | `POST` | Implementado | Reaccionar a publicación. |

### Corrections (`/corrections`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/evaluate-written-answer` | `POST` | Implementado | Llama al motor de IA para evaluar la respuesta a una pregunta de desarrollo. Protegido contra re-evaluaciones en una misma sesión. |

### Dashboard (`/dashboard`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/summary` | `GET` | Implementado | Resumen general para la pantalla de inicio. |
| `/streak/months` | `GET` | Implementado | Gráfico de racha mensual (heatmaps). |
| `/study-time` | `GET` | Implementado | Estadísticas de tiempo de estudio. |
| `/recent-exams` | `GET` | Implementado | Exámenes recientes del dashboard. |

### Exam Sessions (`/exam-sessions`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `POST` | Implementado | Crear nueva sesión de examen. |
| `/me` | `GET` | Implementado | Lista las sesiones del usuario actual. Permite filtro `?subjectId=`. |
| `/:examSessionId` | `GET` | Implementado | Obtiene detalle de sesión, incluyendo preguntas y evaluación. |
| `/:examSessionId/finish` | `PATCH` | Implementado | Cierra la sesión (requiere `totalTimeSeconds`). |
| `/:examSessionId/activity` | `PATCH` | Implementado | Endpoint de Heartbeat para sincronizar el tiempo transcurrido en segundos. |
| `/:examSessionId` | `DELETE` | Implementado | Eliminar o abandonar la sesión. |

### Files (`/files`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/presign` | `POST` | Implementado | Genera URL prefirmada para subida a S3. |
| `/:id` | `GET` | Implementado | Obtiene metadata y URL de descarga de un archivo. |
| `/:id` | `DELETE` | Implementado | Elimina un archivo lógico y físico. |

### Health (`/health`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `GET` | Implementado | Devuelve estado básico. |
| `/live` | `GET` | Implementado | Liveness probe (Kubernetes/Render). |
| `/ready` | `GET` | Implementado | Readiness probe. |
| `/database` | `GET` | Implementado | Verifica conexión a DB Prisma. |

### Notifications (`/notifications`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `GET` | Implementado | Lista notificaciones del usuario. |
| `/read-all` | `POST` | Implementado | Marca todas como leídas. |
| `/:id/read` | `PATCH` | Implementado | Marca una específica como leída. |
| `/clear` | `DELETE` | Implementado | Elimina notificaciones antiguas/todas. |

### Questions (`/questions`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `GET` | Implementado | Buscar y filtrar preguntas. |
| `/:id` | `GET` | Implementado | Detalle de pregunta. |
| `/generate-ai` | `POST` | Implementado | Generar nueva pregunta bajo demanda con IA. |

### Shared Exams (`/shared-exams`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `GET` | Implementado | Listar exámenes compartidos (públicos/descubrimiento). |
| `/me` | `GET` | Implementado | Exámenes compartidos por el usuario actual. |
| `/` | `POST` | Implementado | Crear un examen compartido a partir de una sesión propia. |
| `/:sharedExamId/start` | `POST` | Implementado | El usuario actual inicia una sesión clonando un examen compartido. |
| `/:sharedExamId/visibility` | `PATCH` | Implementado | Cambiar estado (público, privado, amigos). |

### Subjects (`/subjects`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `GET` | Implementado | Lista materias disponibles. |
| `/:subjectId/topics` | `GET` | Implementado | Lista temas asociados a una materia. |

### Topics (`/topics`)
| Endpoint | Método | Estado | Notas |
|----------|--------|--------|-------|
| `/` | `GET` | Implementado | Buscar y listar temas globalmente. |

---

## Endpoints Faltantes o por Revisar (Gap Analysis)

1. **Gestión de Errores Unificada:**
   - La lista de endpoints está completa respecto al código, pero las respuestas de error a través de estos endpoints no tienen una estrategia estandarizada para Mobile/Web (reportado en `CURRENT_PROBLEMS.md`).
2. **Registro Mobile:**
   - `POST /auth/register` funciona, pero tiene problemas con el token expirado inmediatamente después de crearlo, lo cual es un issue funcional abierto.
3. **Manejo de Perfil:**
   - No hay un controlador `users.controller.ts` para editar el perfil directamente. Se hace todo mediante `/auth/onboarding/complete`, lo que podría ser insuficiente cuando se deba cambiar el avatar posteriormente. (Posible `PUT /auth/me` faltante).
