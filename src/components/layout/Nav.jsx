import { Link } from 'react-router-dom'
import { negocioConfig } from '../../config/negocio.config'

export function Nav() {
  return (
    <header className="nav">
      <div className="contenedor nav__contenido">
        <Link to="/" className="nav__marca">
          {negocioConfig.nombre}
        </Link>
        <Link to="/carta" className="nav__enlace">
          Ver carta
        </Link>
      </div>
    </header>
  )
}
