import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { negocioConfig } from '../../config/negocio.config'
import { seccionesAdminVisibles } from '../../lib/seccionesAdmin'

export function AdminNav() {
  const auth = useAuth()
  const { cerrarSesion } = auth
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
          {seccionesAdminVisibles(auth).map(({ ruta, etiqueta }) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/admin'} className={claseEnlace} onClick={cerrar}>
              {etiqueta}
            </NavLink>
          ))}
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
