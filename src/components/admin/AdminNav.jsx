import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AdminNav() {
  const { esDueno, cerrarSesion } = useAuth()

  return (
    <header className="admin-nav">
      <nav className="admin-nav__enlaces">
        <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'admin-nav__activo' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/pedidos" className={({ isActive }) => (isActive ? 'admin-nav__activo' : '')}>
          Pedidos
        </NavLink>
        {esDueno && (
          <>
            <NavLink to="/admin/productos" className={({ isActive }) => (isActive ? 'admin-nav__activo' : '')}>
              Productos
            </NavLink>
            <NavLink to="/admin/usuarios" className={({ isActive }) => (isActive ? 'admin-nav__activo' : '')}>
              Usuarios
            </NavLink>
          </>
        )}
      </nav>
      <button type="button" className="boton boton--secundario boton--pequeno" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </header>
  )
}
