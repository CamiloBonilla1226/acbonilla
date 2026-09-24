import { Link } from 'react-router-dom'
import { Nav } from '../components/layout/Nav'
import { Footer } from '../components/layout/Footer'
import { negocioConfig } from '../config/negocio.config'

export function Inicio() {
  return (
    <>
      <Nav />
      <main className="contenedor pagina-inicio">
        <h1>{negocioConfig.nombre}</h1>
        <p className="texto-suave">Pide en línea y recíbelo donde estés.</p>
        <Link to="/carta" className="boton pagina-inicio__cta">
          Ver carta y pedir
        </Link>
      </main>
      <Footer />
    </>
  )
}
