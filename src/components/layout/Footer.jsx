import { negocioConfig } from '../../config/negocio.config'

export function Footer() {
  const anio = new Date().getFullYear()
  const linkWhatsapp = `https://wa.me/${negocioConfig.whatsappContacto}`

  return (
    <footer className="footer">
      <div className="contenedor footer__contenido">
        <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="footer__whatsapp">
          Escríbenos por WhatsApp
        </a>
        <p className="texto-suave footer__copy">
          © {anio} {negocioConfig.nombre}
        </p>
        <p className="texto-suave footer__creditos">
          Desarrollado por acbonilla1226 ·{' '}
          <a href="mailto:acbonilla1226@gmail.com" className="footer__creditos-enlace">
            acbonilla1226@gmail.com
          </a>
        </p>
      </div>
    </footer>
  )
}
