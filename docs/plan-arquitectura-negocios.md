# Plan de trabajo — arquitectura por negocio con núcleo compartido

Decidido el 2026-10-11. Este documento es la guía para convertir el proyecto base en un repositorio con **un código independiente por negocio** y **lógica y panel admin compartidos**. Se actualiza a medida que se avanza (marcar cada fase al terminarla).

## Decisiones tomadas

- **Un solo repositorio**, una carpeta por negocio. Cada negocio es una app de Vite independiente con **diseño 100 % propio**.
- **Núcleo compartido por npm workspaces**: la lógica (hooks, `lib/`) vive en `packages/core` y el panel de administración en `packages/admin`. No se publican en npm; se enlazan localmente.
- **Un proyecto de Vercel por negocio**, todos conectados al mismo repo, cada uno con su Root Directory, su dominio y sus variables de entorno.
- **Una sola base de datos de Supabase** y una sola carpeta `supabase/` (Edge Functions y documentación del esquema), como hoy. El aislamiento entre negocios sigue siendo `negocio_id` + RLS vía `app_metadata`.
- El proyecto base actual **no tiene ningún negocio real dentro**: pasa a ser la plantilla (`negocios/_plantilla`).

## Estructura objetivo

```
acbonilla/
  package.json            workspaces: ["packages/*", "negocios/*"]
  packages/
    core/                 NegocioProvider, hooks de datos, carrito, auth, lib/
    admin/                páginas y componentes del panel + su CSS (body.admin)
  negocios/
    _plantilla/           diseño base: Inicio, Carta, CartaFisica, menú/carrito, CSS, assets
    <slug>/               copia de la plantilla, ya personalizada
  supabase/functions/     Edge Functions (sin cambios)
  scripts/                nuevo-negocio, utilidades
  docs/                   este plan, explicacion-script-bd.txt, etc.
```

## Reglas de trabajo para todas las fases

1. **Se trabaja en la rama `arquitectura-negocios`, no en `main`.** Excepción explícita a la regla de CLAUDE.md "push inmediato a main": `main` se despliega solo en Vercel desde la raíz del repo, y reorganizar carpetas rompería ese deploy. La rama se une a `main` solo en la Fase 6, junto con el cambio de Root Directory en Vercel.
2. **Cada fase termina con `npm run build` y `npm run lint` sin errores nuevos**, y un commit propio con mensaje descriptivo. Una fase no se empieza si la anterior no compila.
3. **Cada fase se registra en `CHANGELOG.md`** (qué se movió y por qué).
4. **Los cambios en `packages/core` son aditivos.** Los hooks son una API pública: renombrar un campo de retorno o quitar un parámetro rompe el diseño de todos los negocios. Si hay que romper algo, se avisa y se prueba cada negocio.
5. **La interfaz no cambia durante la reorganización.** Si algo se ve distinto después de una fase, es un error de la fase.
6. Se mantienen las convenciones de CLAUDE.md: `app_metadata` (nunca `user_metadata`), RLS creado junto con cada tabla, esquinas rectas y mobile-first.

## Fases

### Fase 0 — Preparación (sin tocar código)
- Crear la rama `arquitectura-negocios`.
- Decidir qué pasa con el deploy actual de `main` en Vercel: o pasa a ser la demo de `negocios/_plantilla`, o se retira cuando exista el primer negocio real.
- Confirmar en el proyecto de Vercel que existe la opción de incluir archivos fuera del Root Directory (necesaria para que un negocio vea `packages/`), y revisar los límites vigentes de proyectos y dominios del plan.
- Anotar el inventario inicial: los 28 archivos que importan `negocio.config.js`.
- **Terminado cuando:** la rama existe y las dos confirmaciones de Vercel están hechas.

### Fase 1 — Workspaces sin mover nada
- Agregar un `package.json` raíz con `workspaces` y verificar que `npm install` y el build actual siguen funcionando.
- **Riesgo:** bajo. **Terminado cuando:** build y lint iguales que antes.

### Fase 2 — Núcleo (`packages/core`)
- Crear `NegocioProvider` y un hook `useNegocio()` que entrega `negocioId`, nombre, WhatsApp y marca.
- Mover `hooks/` (datos, carrito, auth, swipe, toasts, confirmaciones) y `lib/` a `packages/core`.
- `supabaseClient` se crea en el núcleo con las variables de entorno compartidas.
- Reemplazar los 28 usos de `negocioConfig` por `useNegocio()` (o por parámetros en las funciones de `lib/` que no son hooks).
- Mantener la advertencia del `negocioId` de ejemplo (lección del 2026-09-24).
- **Riesgo:** medio, es el cambio más grande. **Terminado cuando:** la app compila usando el núcleo y el comportamiento es idéntico (login, carrito, mensaje de WhatsApp).

### Fase 3 — Panel admin (`packages/admin`)
- Mover `pages/admin`, `components/admin` y la parte de `index.css` bajo `body.admin` a `packages/admin`, exponiendo un `AdminApp`.
- El panel toma el negocio del proveedor; no importa configuración directamente.
- **Riesgo:** medio (el CSS del admin y el de la carta comparten hoy un solo archivo de ~3.900 líneas). **Terminado cuando:** el panel se ve y funciona igual, incluida la navegación por deslizamiento.

### Fase 4 — Plantilla (`negocios/_plantilla`)
- Dejar en la plantilla lo que es diseño del negocio: páginas públicas, componentes de menú, carrito y layout, el CSS restante y los assets (como `piano-bar-banner.png`, que no debe quedar en la raíz).
- La plantilla tiene su propio `negocio.config.js` (con valores de ejemplo, no un negocio real), `index.html`, `vite.config.js` y `vercel.json`.
- **Terminado cuando:** `npm run build` dentro de `negocios/_plantilla` produce un sitio idéntico al actual.

### Fase 5 — Alta de negocios
- Script `scripts/nuevo-negocio` que copia `_plantilla` a `negocios/<slug>/` y completa `negocioId`, nombre, WhatsApp y colores.
- Actualizar `como-crear-usuario-admin-manual.txt`: el paso de `usuarios_admin` debe incluir `nombre` (columna obligatoria hoy) y el `id` igual al uid de `auth.users`. Evaluar convertir el alta completa (negocio + primer dueño) en una Edge Function `crear-negocio`, atómica como `crear-usuario-admin`.
- Documentar el procedimiento completo en `docs/`.
- **Terminado cuando:** se crea un negocio de prueba con el script y compila sin tocar nada a mano.

### Fase 6 — Despliegue
- Unir la rama a `main` **y a la vez** cambiar el Root Directory del proyecto de Vercel existente (a `negocios/_plantilla` u otra carpeta, según lo decidido en la Fase 0), con la opción de archivos fuera del Root Directory activa y el "Ignored Build Step" configurado (un cambio en una carpeta de negocio solo reconstruye ese negocio; un cambio en `packages/` reconstruye todos).
- Verificar el deploy: carta pública, carta física, login, panel y un pedido de prueba hasta el mensaje de WhatsApp.
- **Riesgo:** el más alto del plan, porque toca producción. Hacerlo con tiempo para revertir (la rama y el Root Directory anterior quedan como respaldo).

### Fase 7 — Seguridad y calidad antes del segundo negocio
Pendientes de seguridad detectados y aún sin corregir (ver `explicacion-script-bd.txt`):
- `negocios`: el dueño puede editar `activo`, `fecha_proximo_pago` y `dominio_propio` de su propio negocio; restringir las columnas editables.
- `adiciones` y `variantes_producto`: la política de escritura exige el rol solo en `with check`, así que un empleado podría borrar filas (DELETE); poner el rol también en `using`. Revisar `productos` y `categorias` por si repiten el patrón.
- `pedidos`: el insert público no valida `estado`, `total`, `atendido_por` ni que el negocio esté activo.

Calidad:
- Pruebas de humo por negocio (la carta carga, el carrito arma el mensaje, el login entra).
- Checklist de cambios transversales: cuando se toca `packages/`, probar cada negocio en la vista previa antes de unir a `main`.
- Consolidar el esquema (`schema.sql` o `migrations/` con `pg_dump --schema-only`) y retirar o marcar como obsoleto `contexto-proyecto-base.md`.

## Pendiente de confirmar

- Que Vercel permita incluir `packages/` en el build de cada negocio con tu configuración actual.
- Límites del plan de Vercel para varios proyectos y dominios propios.
- Qué se hace con el deploy actual de `main` (Fase 0).
- Si algún cliente va a exigir quedarse con su código: con un monorepo compartido habría que entregarle su carpeta más una copia de `packages/`, lo que conviene decidir antes de firmar con el primero.

## Instrucciones para una sesión de Claude Code

Al abrir una sesión para avanzar este plan, pedir algo como:

> Lee `docs/plan-arquitectura-negocios.md` y `CLAUDE.md`. Trabaja en la rama `arquitectura-negocios`. Hoy toca la Fase N: haz solo esa fase, sin cambiar cómo se ve nada. Al terminar, corre `npm run build` y `npm run lint`, agrega la entrada al CHANGELOG, haz el commit y dime qué falta para la siguiente fase. No hagas push a `main`.
