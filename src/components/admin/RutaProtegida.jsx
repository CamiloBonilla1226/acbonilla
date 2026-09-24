import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Refuerza en la interfaz lo que ya garantiza RLS del lado de la base de datos: sin
// sesión no se entra al panel, y las rutas marcadas `soloDueno` no se muestran a un
// empleado (aunque, como pide el brief, la restricción real de datos vive en RLS, no aquí).
export function RutaProtegida({ children, soloDueno = false }) {
  const { autenticado, cargando, esDueno } = useAuth()

  if (cargando) return <p className="texto-suave admin-cargando">Cargando…</p>
  if (!autenticado) return <Navigate to="/admin/login" replace />
  if (soloDueno && !esDueno) return <Navigate to="/admin/pedidos" replace />

  return children
}
