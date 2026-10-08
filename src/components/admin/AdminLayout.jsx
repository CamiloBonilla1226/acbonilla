import { useEffect, useLayoutEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSwipeNavegacion } from '../../hooks/useSwipeNavegacion'
import { seccionesAdminVisibles } from '../../lib/seccionesAdmin'

// Donde un swipe horizontal no debe cambiar de sección: modales y confirmaciones (ahí
// deslizar ya sirve para cerrarlos, ver useSwipeParaCerrar), el menú lateral abierto,
// campos de texto (arrastrar ahí selecciona o mueve el cursor) y controles con scroll
// horizontal propio (filtros segmentados). Tampoco en la barra de acciones masivas de
// Productos: cambiar de sección ahí perdería la selección por un roce del dedo.
const SELECTOR_IGNORAR_ADMIN = [
  '.superposicion',
  '.admin-drawer',
  '.admin-drawer__fondo',
  '.filtros-admin__segmentos',
  '.acciones-masivas',
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
].join(', ')

// Marca el <body> con la clase `admin` mientras se está en el panel: el tema del admin
// (index.css, sección "Tema del panel admin") se aplica solo a `body.admin`, y va en el
// body y no en un div envolvente porque los modales y confirmaciones también deben verse
// con el tema del admin sin importar dónde se monten.
export function AdminLayout() {
  const auth = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.classList.add('admin')
    return () => document.body.classList.remove('admin')
  }, [])

  // Cada sección arranca desde arriba, venga del menú lateral o de un swipe.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Swipe de derecha a izquierda → siguiente sección del menú lateral; de izquierda a
  // derecha → la anterior. Solo entre las secciones que este usuario puede ver, y sin dar
  // la vuelta en los extremos. En /admin/login no hay sección actual y no hace nada.
  const irARelativa = (paso) => {
    if (!auth.autenticado) return
    const secciones = seccionesAdminVisibles(auth)
    const actual = secciones.findIndex((seccion) => seccion.ruta === pathname)
    const destino = secciones[actual + paso]
    if (actual === -1 || !destino) return
    navigate(destino.ruta)
  }

  const swipe = useSwipeNavegacion({
    onSwipeIzquierda: () => irARelativa(1),
    onSwipeDerecha: () => irARelativa(-1),
    selectorIgnorar: SELECTOR_IGNORAR_ADMIN,
  })

  return (
    <div className="admin-zona-swipe" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      <Outlet />
    </div>
  )
}
