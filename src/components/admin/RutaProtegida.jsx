import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Refuerza en la interfaz lo que ya garantiza RLS del lado de la base de datos: sin
// sesión no se entra al panel, las rutas marcadas `soloDueno` no se muestran a un empleado,
// y las que piden un `permiso` puntual (ej. "puedeProductos") solo se muestran al dueño o
// al empleado al que el dueño se lo haya activado (aunque, como pide el brief, la
// restricción real de datos vive en RLS, no aquí).
export function RutaProtegida({ children, soloDueno = false, permiso }) {
  const auth = useAuth()
  const { autenticado, cargando, cargandoPerfil, esDueno } = auth

  if (cargando) return <p className="texto-suave admin-cargando">Cargando…</p>
  if (!autenticado) return <Navigate to="/admin/login" replace />
  if (soloDueno && !esDueno) return <Navigate to="/admin/pedidos" replace />
  // El permiso de un empleado se consulta aparte (usuarios_admin, no viene en el JWT) — hay
  // que esperar a que esa consulta termine antes de decidir, o un empleado con permiso real
  // sería redirigido igual, solo por llegar aquí antes de que el dato cargara.
  if (permiso) {
    if (cargandoPerfil) return <p className="texto-suave admin-cargando">Cargando…</p>
    if (!auth[permiso]) return <Navigate to="/admin/pedidos" replace />
  }

  return children
}
