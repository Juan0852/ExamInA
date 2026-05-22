# ExamInA - Frontend Style Guide

Este documento define la dirección visual inicial de ExamInA para web y mobile.

Debe evolucionar junto con la interfaz real, pero sirve como base para que diferentes agentes mantengan consistencia visual.

## Referencias de marca

Assets guardados:

- [Logo wide con tagline](../assets/brand/examina-logo-wide-tagline.png)
- [Logo mark](../assets/brand/examina-logo-mark.png)
- [Logo horizontal](../assets/brand/examina-logo-horizontal.png)
- [Logo horizontal con tagline](../assets/brand/examina-logo-horizontal-tagline.png)

La marca actual usa una mezcla de:

- azul marino profundo;
- azul eléctrico;
- cian/turquesa;
- blanco limpio;
- brillos puntuales asociados a IA, aprendizaje y claridad.

## Personalidad visual

ExamInA debe sentirse:

- académica, pero no aburrida;
- moderna, pero no críptica;
- tecnológica, pero cercana;
- enfocada en estudio y progreso;
- limpia, clara y confiable.

Evitar que la app parezca una landing genérica de IA.

La experiencia principal debe parecer una herramienta de estudio real: dashboards legibles, preguntas cómodas de responder, correcciones fáciles de revisar y progreso visible.

## Paleta base

### Brand

| Token | Hex | Uso |
| --- | --- | --- |
| `brand.navy` | `#06265F` | Texto principal de marca, headers fuertes, navegación. |
| `brand.blue` | `#0879F2` | Acciones principales, enlaces activos, progreso. |
| `brand.cyan` | `#33D6D0` | Acentos, highlights, estados positivos suaves. |
| `brand.sky` | `#E8F7FF` | Fondos sutiles de secciones o badges. |

### Light theme

| Token | Hex | Uso |
| --- | --- | --- |
| `background` | `#F8FAFC` | Fondo general. |
| `surface` | `#FFFFFF` | Panels, cards y inputs. |
| `surface-muted` | `#F1F5F9` | Bloques secundarios. |
| `border` | `#D8E2EE` | Bordes normales. |
| `border-strong` | `#AFC1D6` | Bordes activos o enfocados. |
| `text` | `#0F172A` | Texto principal. |
| `text-muted` | `#475569` | Texto secundario. |
| `text-soft` | `#64748B` | Texto auxiliar. |

### Dark theme

| Token | Hex | Uso |
| --- | --- | --- |
| `background` | `#07111F` | Fondo general oscuro. |
| `surface` | `#0E1B2F` | Panels y cards. |
| `surface-muted` | `#12243B` | Bloques secundarios. |
| `border` | `#223A59` | Bordes normales. |
| `border-strong` | `#2D5E91` | Bordes activos o enfocados. |
| `text` | `#EAF2FF` | Texto principal. |
| `text-muted` | `#B7C6D9` | Texto secundario. |
| `text-soft` | `#8FA4BC` | Texto auxiliar. |

## Estados semánticos

| Token | Hex | Uso |
| --- | --- | --- |
| `success` | `#16A34A` | Correcto, progreso completado. |
| `warning` | `#F59E0B` | Atención, incompleto. |
| `danger` | `#DC2626` | Error, incorrecto, acciones destructivas. |
| `info` | `#0879F2` | Información, ayuda, enlaces. |

## Tipografía

Fuente recomendada:

```txt
Inter
```

Fallback:

```txt
ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Escala inicial:

| Token | Tamaño | Line-height | Uso |
| --- | --- | --- | --- |
| `text-xs` | `12px` | `16px` | Labels, metadata. |
| `text-sm` | `14px` | `20px` | Texto secundario, inputs compactos. |
| `text-base` | `16px` | `24px` | Texto general. |
| `text-lg` | `18px` | `28px` | Introducciones y bloques importantes. |
| `text-xl` | `20px` | `28px` | Títulos de cards/panels. |
| `text-2xl` | `24px` | `32px` | Títulos de página secundarios. |
| `text-4xl` | `36px` | `44px` | Landing o headers grandes. |
| `text-5xl` | `48px` | `56px` | Hero web. |

Reglas:

- No usar letter spacing negativo.
- No escalar fuente con viewport width.
- En dashboards, preferir títulos compactos y legibles antes que hero text.

## Espaciado

Usar escala basada en 4px:

| Token | Valor |
| --- | --- |
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-5` | `20px` |
| `space-6` | `24px` |
| `space-8` | `32px` |
| `space-10` | `40px` |
| `space-12` | `48px` |
| `space-16` | `64px` |

Reglas:

- Controles densos: 8-12px internos.
- Cards y panels: 16-24px internos.
- Secciones completas: 48-64px verticales.
- Mobile: reducir padding horizontal a 16-24px.

## Border radius

La UI debe sentirse moderna, pero no excesivamente redonda.

| Token | Valor | Uso |
| --- | --- | --- |
| `radius-sm` | `4px` | Inputs compactos, badges pequeños. |
| `radius-md` | `6px` | Botones, campos, chips. |
| `radius-lg` | `8px` | Cards y panels principales. |
| `radius-xl` | `12px` | Modales o contenedores destacados puntuales. |

Regla general:

- Cards repetidas y UI operacional: máximo 8px.
- Evitar cards dentro de cards.
- Evitar formas demasiado redondas para dashboards académicos.

## Sombras

Sombras discretas:

| Token | Valor |
| --- | --- |
| `shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.06)` |
| `shadow-md` | `0 8px 24px rgb(15 23 42 / 0.08)` |
| `shadow-focus` | `0 0 0 3px rgb(8 121 242 / 0.18)` |

Reglas:

- Preferir bordes y contraste antes que sombras fuertes.
- Reservar glow/cian para estados de foco o marca, no para decorar todo.

## Componentes

### Botones

Primary:

- fondo `brand.blue`;
- texto blanco;
- hover ligeramente más oscuro;
- focus con `shadow-focus`.

Secondary:

- fondo blanco o surface;
- borde `border`;
- texto `brand.navy`.

Danger:

- fondo `danger`;
- texto blanco.

Reglas:

- Usar iconos de `lucide-react` cuando sea posible.
- No usar texto dentro de botones si un icono estándar comunica mejor la acción.
- Siempre usar tooltip para iconos no obvios.

### Inputs

- Altura mínima web: `40px`.
- Border radius: `6px`.
- Borde normal: `border`.
- Borde focus: `brand.blue`.
- Mostrar errores debajo del campo, no solo color.

### Cards y panels

- Radius: `8px`.
- Borde visible suave.
- Fondo `surface`.
- Padding: `16px` a `24px`.
- No anidar cards dentro de cards.

### Progress bars

Uso principal:

- progreso de examen;
- experiencia/nivel;
- dominio por tema.

Estilo:

- track: `surface-muted`;
- fill: gradiente sutil de `brand.blue` a `brand.cyan`;
- altura recomendada: `8px` o `10px`;
- radius: `999px` solo para la barra, no para toda la UI.

### Feedback de corrección

Usar bloques visuales separados:

- resumen;
- nota;
- errores detectados;
- keywords faltantes;
- sugerencias;
- temas recomendados.

Estados:

- correcto: success;
- incompleto: warning;
- incorrecto: danger.

## Logo

### Web

- Landing puede usar logo completo u horizontal.
- Logo 3D futuro solo en landing web.
- Dentro de dashboard usar versión compacta o isotipo.

### Mobile

- No usar logo 3D.
- Usar isotipo o logo horizontal simple.

### Reglas

- Mantener suficiente espacio blanco alrededor.
- No deformar proporciones.
- Evitar poner el logo sobre fondos con poco contraste.
- No abusar del glow; debe sentirse premium, no ruidoso.

## Layout

### Web app

Estructura recomendada:

- sidebar o top nav según viewport;
- contenido principal con max-width cuando sea lectura;
- dashboards más densos para escaneo;
- preguntas y exámenes con layout enfocado.

### Mobile

Estructura recomendada:

- navegación simple;
- pantallas verticales;
- acciones principales visibles;
- evitar tablas anchas;
- usar cards simples y listas.

## Dark mode

Dark mode debe ser cómodo para estudiar.

Reglas:

- No usar negro puro como fondo.
- Evitar texto blanco puro en bloques largos.
- Mantener contraste suficiente en inputs y borders.
- Los acentos cian deben bajar intensidad si saturan demasiado.

## Accesibilidad

- Contraste mínimo AA.
- Estados focus visibles.
- No comunicar errores solo con color.
- Tamaño mínimo táctil mobile: 44px.
- Textos de botones deben caber en mobile sin romper layout.

## Notas para agentes

- Antes de crear pantallas nuevas, revisar este documento.
- Si se ajustan colores, spacing o componentes base, actualizar este documento.
- Mantener coherencia con los logos guardados en `assets/brand/`.
- Evitar una UI dominada por un solo color: usar azul/cian como marca, no como relleno de todo.
