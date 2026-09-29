import { useRef } from 'react'

const UMBRAL_PX = 50

// Contenedores con su propio scroll horizontal (carrusel, chips de categoría): un swipe que
// empieza ahí debe scrollearlos a ellos, no disparar la navegación de secciones/categorías.
const SELECTOR_SCROLL_INTERNO = '.carrusel-destacados__pista, .seccion-categorias__grid, .filtro-categorias'

// Gesto de swipe horizontal para navegar sin tocar los tabs (ver Carta.jsx: en Inicio/Carrito
// cambia de sección, en Menú primero recorre categorías y solo cambia de sección al pasarse
// del límite). Se ignora si el gesto domina en vertical (para no pelear con el scroll normal
// de la página) o si empieza sobre un contenedor con scroll horizontal propio.
export function useSwipeNavegacion({ onSwipeIzquierda, onSwipeDerecha }) {
  const inicio = useRef(null)

  const onTouchStart = (evento) => {
    if (evento.target.closest?.(SELECTOR_SCROLL_INTERNO)) {
      inicio.current = null
      return
    }
    const toque = evento.touches[0]
    inicio.current = { x: toque.clientX, y: toque.clientY }
  }

  const onTouchEnd = (evento) => {
    if (!inicio.current) return
    const toque = evento.changedTouches[0]
    const deltaX = toque.clientX - inicio.current.x
    const deltaY = toque.clientY - inicio.current.y
    inicio.current = null

    if (Math.abs(deltaX) < UMBRAL_PX || Math.abs(deltaX) < Math.abs(deltaY)) return

    if (deltaX < 0) onSwipeIzquierda()
    else onSwipeDerecha()
  }

  return { onTouchStart, onTouchEnd }
}
