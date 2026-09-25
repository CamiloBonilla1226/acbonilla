import { useRef, useState } from 'react'

const UMBRAL_PX = 80

// Gesto táctil de "deslizar de izquierda a derecha para cerrar", pensado para paneles a
// pantalla completa en móvil (ej. OpcionesProducto). Se ignoran los gestos donde el
// desplazamiento vertical domina al horizontal, para no interferir con el scroll normal
// del contenido del panel. Devuelve los handlers de touch para el elemento del panel y
// un `estilo` que sigue el dedo mientras se arrastra (sin transición, para que no se
// sienta con retraso) y se resetea al soltar si no se llegó al umbral.
export function useSwipeParaCerrar(onCerrar) {
  const inicio = useRef(null)
  const [desplazamiento, setDesplazamiento] = useState(0)

  const onTouchStart = (evento) => {
    const toque = evento.touches[0]
    inicio.current = { x: toque.clientX, y: toque.clientY }
  }

  const onTouchMove = (evento) => {
    if (!inicio.current) return
    const toque = evento.touches[0]
    const deltaX = toque.clientX - inicio.current.x
    const deltaY = toque.clientY - inicio.current.y

    if (deltaX > 0 && deltaX > Math.abs(deltaY)) {
      setDesplazamiento(deltaX)
    }
  }

  const onTouchEnd = () => {
    if (desplazamiento > UMBRAL_PX) {
      onCerrar()
    }
    setDesplazamiento(0)
    inicio.current = null
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    estilo:
      desplazamiento > 0
        ? { transform: `translateX(${desplazamiento}px)`, transition: 'none' }
        : undefined,
  }
}
