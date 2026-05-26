# Dashboard Data Strategy

Este documento guarda la decision de carga de datos para el dashboard web y los futuros endpoints del backend. La regla principal es simple: el dashboard inicial debe cargar rapido y los lightboxes deben pedir informacion detallada solo cuando el usuario los abre.

Estado actual: ya existe una primera implementacion backend en `apps/api/src/modules/dashboard`. Todavia falta conectar el frontend a estos endpoints y ajustar las reglas de negocio finas cuando tengamos mas datos reales.

## Dashboard inicial

El dashboard deberia cargar con un endpoint agregado y liviano, pensado para pintar la primera vista sin traer historiales completos.

Endpoint propuesto:

```txt
GET /dashboard/summary
```

Contenido esperado:

- Resumen de racha actual.
- Ventana corta de racha: dos dias anteriores, dia actual y dos dias siguientes.
- Resumen de tiempo de estudio semanal.
- Ultimos 10 examenes iniciados, en progreso o terminados recientemente.
- Progreso general del usuario, nivel o XP cuando exista esa regla de negocio.

Este endpoint no debe traer el calendario completo de rachas, meses anteriores, historico largo de estudio ni todos los examenes del usuario.

## Lightbox de racha

Cuando el usuario abre la tarjeta de racha, el frontend debe pedir la vista mensual bajo demanda. La vista inicial puede cargar el mes actual y permitir paginar hacia meses anteriores.

Endpoint propuesto:

```txt
GET /dashboard/streak/months?cursor=2026-05&limit=1
```

Comportamiento esperado:

- El cursor representa el mes de referencia en formato `YYYY-MM`.
- `limit` define cuantos meses se devuelven.
- Para ver el mes pasado y el antepasado, el frontend pagina hacia atras.
- La respuesta debe incluir metadatos de paginacion para saber si hay mas meses disponibles.

Forma de respuesta sugerida:

```json
{
  "months": [
    {
      "month": "2026-05",
      "days": [
        {
          "date": "2026-05-26",
          "status": "completed",
          "studySeconds": 3600
        }
      ]
    }
  ],
  "pageInfo": {
    "previousCursor": "2026-04",
    "hasMorePrevious": true
  }
}
```

Estados sugeridos para cada dia:

- `completed`: el usuario cumplio la actividad minima para sostener la racha.
- `missed`: el usuario corto la racha ese dia.
- `pending`: dia futuro o dia actual todavia sin cerrar.
- `inactive`: dia sin informacion relevante antes de que exista actividad.

## Lightbox de tiempo de estudio

La tarjeta de tiempo de estudio debe abrir un lightbox con grafica y desglose por dia, semana o rango. Ese detalle no debe vivir dentro del endpoint inicial del dashboard.

Endpoint propuesto:

```txt
GET /dashboard/study-time?from=2026-05-01&to=2026-05-31
```

Contenido esperado:

- Total de tiempo estudiado en el rango.
- Promedio diario.
- Mejor dia del rango.
- Serie diaria para graficas.
- Comparativa con el rango anterior cuando tenga sentido.

## Ultimos examenes

El dashboard inicial debe mostrar una lista corta de examenes recientes o pendientes, no un banco de asignaturas. La materia se usa como contexto del examen, pero la accion principal del usuario es continuar o revisar un examen.

El resumen puede traer los ultimos 10 examenes. Para vistas mas profundas, se usaran endpoints dedicados de sesiones o examenes.

Endpoints propuestos:

```txt
GET /dashboard/recent-exams
GET /exam-sessions/:id
```

Cada item deberia incluir:

- Nombre del examen.
- Materia asociada.
- Estado del examen.
- Progreso.
- Tiempo acumulado.
- Ultima apertura.
- Siguiente accion recomendada.

## Frontend

Comportamiento recomendado:

- Cargar `dashboard/summary` al montar el dashboard.
- Abrir lightbox de racha y pedir el mes actual solo en ese momento.
- Mantener cache por mes para no repetir peticiones si el usuario abre y cierra el lightbox.
- Paginar hacia atras para ver mes pasado y antepasado.
- Mostrar skeleton o estado de carga dentro del lightbox, no bloquear todo el dashboard.
- Hacer lo mismo con el lightbox de tiempo de estudio usando rangos.

## Backend

La logica de dashboard deberia vivir en un servicio de lectura agregado, sin mezclar reglas de escritura de examenes, intentos o progreso.

Fuentes probables de datos:

- Sesiones de examen.
- Intentos y respuestas.
- Actividad diaria de estudio.
- Progreso por materia o tema.
- Logros y XP cuando se implementen.

Cuando se conecte con datos reales, hay que evitar traer historicos completos en memoria para calcular la primera vista del dashboard. El resumen debe calcular solo lo necesario para la primera pantalla.
