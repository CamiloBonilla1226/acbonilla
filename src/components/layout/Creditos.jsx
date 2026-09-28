// Línea de autoría del desarrollador del proyecto base, independiente de la marca de cada
// negocio clonado. Se usa tanto en las vistas públicas (Footer) como en la carta física y en
// el panel admin, que no tienen Footer propio.
const NUMERO_CONTACTO = '3146032055'
const LINK_WHATSAPP_CONTACTO = `https://wa.me/57${NUMERO_CONTACTO}`

export function Creditos() {
  return (
    <p className="texto-suave creditos">
      Desarrollado por acbonilla1226 ·{' '}
      <a href={LINK_WHATSAPP_CONTACTO} target="_blank" rel="noreferrer" className="creditos__enlace">
        {NUMERO_CONTACTO}
      </a>
    </p>
  )
}
