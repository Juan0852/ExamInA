# ExamInA - Dependency Security Policy

Este documento define cómo manejaremos dependencias de npm/pnpm de forma prudente.

## Regla principal

No se deben ejecutar scripts de instalación de dependencias automáticamente.

Esto incluye scripts como:

- `preinstall`
- `install`
- `postinstall`
- build scripts de paquetes nativos
- scripts de generación automática no revisados

## Configuración actual

El repositorio usa `.npmrc` con:

```txt
ignore-scripts=true
```

Esto hace que `pnpm install` no ejecute lifecycle scripts de dependencias.

## Por qué

Los scripts de instalación pueden ejecutar código arbitrario durante la instalación.

Aunque muchas dependencias legítimas los usan para compilar binarios o generar clientes, también son una superficie de ataque importante.

## Consecuencia

Algunas dependencias pueden requerir pasos manuales después de instalar.

Ejemplos probables:

- Prisma puede necesitar generación manual del cliente.
- esbuild puede necesitar binarios.
- paquetes nativos pueden requerir builds explícitos.

## Regla para aprobar scripts

No usar aprobación global.

No ejecutar:

```txt
pnpm approve-builds
```

sin revisar antes qué paquetes piden ejecutar scripts.

Si una dependencia necesita scripts, se debe:

1. Identificar exactamente qué paquete lo necesita.
2. Revisar por qué lo necesita.
3. Confirmar que el paquete es esperado y legítimo.
4. Pedir confirmación explícita al usuario.
5. Documentar la decisión en este archivo y en `docs/AGENT_HANDOFF.md`.

## Instalación segura

Comando recomendado:

```txt
pnpm install --ignore-scripts
```

Como `.npmrc` ya define `ignore-scripts=true`, el flag es redundante pero explícito.

## Auditoría

Cuando el proyecto avance, usar:

```txt
pnpm audit
```

La auditoría debe revisarse con criterio. No todas las alertas implican riesgo explotable, pero ninguna debe ignorarse sin mirar.

## Reglas para agentes

- No habilitar scripts automáticamente.
- No ejecutar `pnpm approve-builds` sin permiso explícito.
- No cambiar `.npmrc` para permitir scripts globalmente.
- Si una herramienta falla porque necesita scripts, explicar el motivo antes de ejecutar cualquier aprobación.
- Documentar cualquier excepción.
