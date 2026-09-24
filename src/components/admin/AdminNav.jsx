import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { negocioConfig } from '../../config/negocio.config'

export function AdminNav() {
  const { esDueno, cerrarSesion } = useAuth()
  const [abierto, setAbierto] = useState(false)

  // Cierra el panel con Escape, y evita el scroll del fondo mientras está abierto: son
  // dos detalles esperables de cualquier panel lateral moderno (drawer) y evitan que el
  // usuario quede "atrapado" con el fondo scrolleando detrás del panel.
  useEffect(() => {
    if (!abierto) return

    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', alPresionarTecla)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      document.body.style.overflow = ''
    }
  }, [abierto])

  const cerrar = () => setAbierto(false)

  const claseEnlace = ({ isActive }) => `admin-drawer__enlace${isActive ? ' admin-drawer__enlace--activo' : ''}`

  return (
    <>
      <header className="admin-header">
        <button
          type="button"
          className={`admin-header__hamburguesa${abierto ? ' admin-header__hamburguesa--abierta' : ''}`}
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
        >
          <span />
          <span />
          <span />
        </button>
        <span className="admin-header__titulo">Administrador</span>
      </header>

      {abierto && <div className="admin-drawer__fondo" onClick={cerrar} />}

      <nav className={`admin-drawer${abierto ? ' admin-drawer--abierto' : ''}`} aria-hidden={!abierto}>
        <div className="admin-drawer__encabezado">
          <span className="admin-drawer__negocio">{negocioConfig.nombre}</span>
          <button type="button" className="admin-drawer__cerrar" onClick={cerrar} aria-label="Cerrar menú">
            ×
          </button>
        </div>

        <div className="admin-drawer__enlaces">
          <NavLink to="/admin" end className={claseEnlace} onClick={cerrar}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/pedidos" className={claseEnlace} onClick={cerrar}>
            Pedidos
          </NavLink>
          {esDueno && (
            <>
              <NavLink to="/admin/productos" className={claseEnlace} onClick={cerrar}>
                Productos
              </NavLink>
              <NavLink to="/admin/categorias" className={claseEnlace} onClick={cerrar}>
                Categorías
              </NavLink>
              <NavLink to="/admin/usuarios" className={claseEnlace} onClick={cerrar}>
                Usuarios
              </NavLink>
            </>
          )}
        </div>

        <div className="admin-drawer__pie">
          <button type="button" className="boton boton--secundario" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </nav>
    </>
  )
}
