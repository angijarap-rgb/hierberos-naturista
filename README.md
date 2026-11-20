# Hierberos · Directorio y catálogo naturista (MVP)

Caso **«Medicina naturista y hierberos»** — Práctica Calificada 2, Proyecto Final de Carrera III (Tipo K).

Aplicación web para encontrar hierberos y tiendas naturistas y consultar qué productos ofrecen, dónde están,
cuánto cuestan, si hay disponibilidad y qué procedencia y uso tradicional declara cada vendedor.

> **Datos ficticios.** Puestos, teléfonos, precios y stock son inventados con fines académicos.
> La información de uso tradicional no es consejo médico y la app rechaza afirmaciones de curación.

## Alcance del MVP

| Capacidad | Historia | Ruta |
|---|---|---|
| Directorio de puestos y filtro por distrito | H1, H2 | `/puestos` |
| Ficha del puesto (dirección, horario, contacto) | H3 | `/puestos/[id]` |
| Búsqueda por hierba, precio, disponibilidad | H5, H6, H7 | `/` |
| Solo productos publicados | H8 | `/`, `/api/productos` |
| Procedencia y uso tradicional con aviso | H9, H10, H11 | `/` |
| Registro/ingreso de hierberos (Supabase Auth) | H12 | `/login` |
| Publicar y actualizar productos propios (RLS) | H13, H14, H15 | `/panel` |
| API JSON del catálogo (ruta crítica) | H8 | `/api/productos?q=muna` |
| Health check con SHA desplegado | H18 | `/api/salud` |

## Stack

Next.js 16 (App Router, TypeScript) · Supabase (PostgreSQL + Auth + RLS) · Vitest · GitHub Actions
(CI, CodeQL, npm audit, Dependency Review, Gitleaks) · Vercel (despliegue por integración Git).

## Ejecutar localmente

Requisitos: Node 22 (ver `.nvmrc`).

```bash
npm ci
npm test            # pruebas unitarias
npm run build       # compilación de producción
npm run dev         # http://localhost:3000
```

Sin variables de entorno la app funciona en **modo demo** con los datos de `src/lib/seed.ts`.
Para usar Supabase, copiar `.env.example` a `.env.local` y completar `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (clave pública; la seguridad la imponen las políticas RLS).

## Base de datos

- `supabase/migrations/20261020000000_esquema_inicial.sql`: tablas `plantas`, `puestos`, `productos`, RLS y políticas.
- `supabase/seed.sql`: datos ficticios (generado con `node --experimental-strip-types scripts/generar-seed.ts`).

Las migraciones se aplican manualmente en el SQL Editor del proyecto Supabase (no se automatizan desde CI).

## Ramas y flujo

- `main`: producción. Solo recibe cambios por Pull Request con checks obligatorios en verde.
- `test`: integración y pruebas. Vercel genera un *preview* (modo demo, sin secretos de producción).

## Pipeline

| Workflow | Disparador | Etapas |
|---|---|---|
| `ci.yml` | PR y push a `main`/`test` | npm ci → typecheck → pruebas (JUnit) → build · npm audit · dependency review · Gitleaks |
| `codeql.yml` | PR, push y semanal | SAST CodeQL `security-extended` |
| `verificar-despliegue.yml` | `deployment_status` de Vercel (Production) | Espera el SHA en `/api/salud`, prueba `/` y `/api/productos`, publica resumen |

## Documentación

`docs/` contiene el informe, los diagramas SVG (`docs/diagramas/`), los datos de la simulación Scrum
(`docs/datos/backlog.json`) y las capturas de evidencia (`docs/evidencias/`).
