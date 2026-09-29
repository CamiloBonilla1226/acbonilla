import { useNegocioConfig } from '../../hooks/useNegocioConfig'

// Ficha fija de "oferta destacada" en Inicio, entre el logo y el carrusel. El diseño
// (ícono, borde, tipografía) es el mismo para todos los negocios; el único texto que se
// muestra es el que el dueño escribe en /admin/negocio (ver FormularioNegocio.jsx), sin
// ningún rótulo fijo agregado. Si el dueño la desactiva, o no le puso título, no se
// renderiza nada.
export function TarjetaOferta() {
  const { config } = useNegocioConfig()
  const oferta = config?.oferta

  if (!oferta?.activa || !oferta?.titulo?.trim()) return null

  return (
    <div className="tarjeta-oferta">
      <span className="tarjeta-oferta__brillo" aria-hidden="true" />
      <span className="tarjeta-oferta__icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="8" width="18" height="12" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="12" y1="8" x2="12" y2="20" />
          <path d="M12 8c-1.6-3-6-3.4-6-0.4C6 8.3 8 8 12 8Zm0 0c1.6-3 6-3.4 6-0.4C18 8.3 16 8 12 8Z" />
        </svg>
      </span>
      <div className="tarjeta-oferta__texto">
        <strong>{oferta.titulo}</strong>
        {oferta.subtitulo?.trim() && <span className="tarjeta-oferta__subtitulo">{oferta.subtitulo}</span>}
      </div>
    </div>
  )
}
