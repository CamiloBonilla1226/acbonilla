import { useRef, useState } from 'react'

const UMBRAL_PX = 80

// Gesto táctil para cerrar un panel/modal en móvil: deslizar de izquierda a derecha, o de
// arriba hacia abajo (como una hoja inferior). El eje se decide con el primer movimiento
// claro y ya no cambia durante ese gesto, para no mezclar un scroll con un cierre.
//
// El deslizamiento vertical solo cuenta si el contenido del panel estaba en lo más alto
// (scrollTop 0) al empezar el toque: si no, el gesto es para hacer scroll hacia arriba dentro
// del panel y no debe cerrarlo. Devuelve los handlers de touch para el elemento del panel (que
// es el que hace scroll) y un `estilo` que sigue el dedo mientras se arrastra (sin transición,
// para que no se sienta con retraso) y se resetea al soltar si no se llegó al umbral.
export function useSwipeParaCerrar(onCerrar) {
  const inicio = useRef(null)
  const eje = useRef(null) // 'x' | 'y' | null
  const [desplazamiento, setDesplazamiento] = useState({ x: 0, y: 0 })

  const onTouchStart = (evento) => {
    const toque = evento.touches[0]
    inicio.current = {
      x: toque.clientX,
      y: toque.clientY,
      // ¿Se puede arrastrar hacia abajo? Solo si el panel está scrolleado hasta arriba.
      arriba: (evento.currentTarget?.scrollTop ?? 0) <= 0,
    }
    eje.current = null
  }

  const onTouchMove = (evento) => {
    if (!inicio.current) return
    const toque = evento.touches[0]
    const deltaX = toque.clientX - inicio.current.x
    const deltaY = toque.clientY - inicio.current.y

    if (!eje.current) {
      // Espera un movimiento mínimo para decidir el eje (evita decidir con un temblor del dedo).
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return
      if (deltaX > 0 && deltaX > Math.abs(deltaY)) eje.current = 'x'
      else if (deltaY > 0 && deltaY > Math.abs(deltaX) && inicio.current.arriba) eje.current = 'y'
      else {
        // Movimiento hacia otro lado (izquierda, arriba, o scroll normal): no es un cierre.
        inicio.current = null
        return
      }
    }

    if (eje.current === 'x') setDesplazamiento({ x: Math.max(0, deltaX), y: 0 })
    else setDesplazamiento({ x: 0, y: Math.max(0, deltaY) })
  }

  const onTouchEnd = () => {
    if (desplazamiento.x > UMBRAL_PX || desplazamiento.y > UMBRAL_PX) {
      onCerrar()
    }
    setDesplazamiento({ x: 0, y: 0 })
    inicio.current = null
    eje.current = null
  }

  const arrastrando = desplazamiento.x > 0 || desplazamiento.y > 0

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    estilo: arrastrando
      ? { transform: `translate(${desplazamiento.x}px, ${desplazamiento.y}px)`, transition: 'none' }
      : undefined,
  }
}
