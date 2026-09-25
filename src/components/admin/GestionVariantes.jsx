import { useState } from 'react'
import { Interruptor } from './Interruptor'
import { useVariantesProducto } from '../../hooks/useVariantesProducto'
import { useToast } from '../../hooks/useToast'
import { useConfirmacion } from '../../hooks/useConfirmacion'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const VACIO = { nombre: '', precio: '', orden: 0 }

// Administra las variantes de un producto puntual (ej. tamaños, sabores) directamente
// dentro del formulario de producto, con el mismo patrón de campos que adiciones
// (nombre + precio + disponible), pero inline en vez de en una página/modal aparte,
// porque una variante no existe sin su producto (`producto_id` es obligatorio).
export function GestionVariantes({ productoId }) {
  const { variantes, cargando, crearVariante, actualizarVariante, eliminarVariante } =
    useVariantesProducto(productoId)
  const [nuevaVariante, setNuevaVariante] = useState(VACIO)
  const [idEnEdicion, setIdEnEdicion] = useState(null)
  const [valoresEdicion, setValoresEdicion] = useState(VACIO)
  const [error, setError] = useState(null)
  const mostrarToast = useToast()
  const confirmar = useConfirmacion()

  const agregarVariante = async () => {
    setError(null)
    const resultado = await crearVariante({
      nombre: nuevaVariante.nombre.trim(),
      precio: Number(nuevaVariante.precio) || 0,
      orden: Number(nuevaVariante.orden) || 0,
      disponible: true,
    })

    if (resultado.exito) {
      setNuevaVariante(VACIO)
      mostrarToast('Variante agregada')
    } else {
      setError(resultado.error?.message ?? 'No se pudo agregar la variante.')
    }
  }

  const iniciarEdicion = (variante) => {
    setIdEnEdicion(variante.id)
    setValoresEdicion({ nombre: variante.nombre, precio: variante.precio, orden: variante.orden })
  }

  const guardarEdicion = async (id) => {
    setError(null)
    const resultado = await actualizarVariante(id, {
      nombre: valoresEdicion.nombre.trim(),
      precio: Number(valoresEdicion.precio) || 0,
      orden: Number(valoresEdicion.orden) || 0,
    })

    if (resultado.exito) {
      setIdEnEdicion(null)
      mostrarToast('Variante actualizada')
    } else {
      setError(resultado.error?.message ?? 'No se pudo actualizar la variante.')
    }
  }

  const cambiarDisponible = async (id, valor) => {
    const { exito } = await actualizarVariante(id, { disponible: valor })
    mostrarToast(
      exito ? (valor ? 'Variante activada' : 'Variante desactivada') : 'No se pudo actualizar la variante',
      exito ? 'exito' : 'error'
    )
  }

  const eliminar = async (id) => {
    const confirmado = await confirmar('¿Eliminar esta variante?')
    if (!confirmado) return

    const { exito } = await eliminarVariante(id)
    mostrarToast(exito ? 'Variante eliminada' : 'No se pudo eliminar la variante', exito ? 'exito' : 'error')
  }

  if (!productoId) {
    return (
      <div className="gestion-opciones">
        <p className="texto-suave">Guarda el producto primero para poder agregarle variantes (ej. tamaños o sabores).</p>
      </div>
    )
  }

  return (
    <div className="gestion-opciones">
      <div className="gestion-opciones__grupo tarjeta">
        <div className="gestion-opciones__grupo-encabezado">
          <strong>Variantes</strong>
          <span className="texto-suave">Ej. tamaños o sabores. Si hay variantes, el precio de arriba deja de usarse.</span>
        </div>

        {cargando && <p className="texto-suave">Cargando variantes…</p>}

        {variantes.length > 0 && (
          <ul className="gestion-opciones__lista">
            {variantes.map((variante) =>
              idEnEdicion === variante.id ? (
                <li key={variante.id}>
                  <div className="gestion-opciones__form-opcion">
                    <input
                      type="text"
                      value={valoresEdicion.nombre}
                      onChange={(e) => setValoresEdicion((a) => ({ ...a, nombre: e.target.value }))}
                      placeholder="Nombre"
                      maxLength={40}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={valoresEdicion.precio}
                      onChange={(e) => setValoresEdicion((a) => ({ ...a, precio: e.target.value }))}
                      placeholder="Precio"
                    />
                    <input
                      type="number"
                      step="1"
                      value={valoresEdicion.orden}
                      onChange={(e) => setValoresEdicion((a) => ({ ...a, orden: e.target.value }))}
                      placeholder="Orden"
                    />
                    <button type="button" className="boton boton--pequeno" onClick={() => guardarEdicion(variante.id)}>
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="boton boton--secundario boton--pequeno"
                      onClick={() => setIdEnEdicion(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </li>
              ) : (
                <li key={variante.id}>
                  <span>
                    {variante.nombre} — {formatoPrecio.format(variante.precio)}
                    {!variante.disponible && ' · No disponible'}
                  </span>
                  <span className="gestion-opciones__form-opcion">
                    <Interruptor
                      activo={variante.disponible}
                      onCambiar={(valor) => cambiarDisponible(variante.id, valor)}
                    />
                    <button
                      type="button"
                      className="boton boton--secundario boton--pequeno"
                      onClick={() => iniciarEdicion(variante)}
                    >
                      Editar
                    </button>
                    <button type="button" className="carrito__quitar" onClick={() => eliminar(variante.id)}>
                      Eliminar
                    </button>
                  </span>
                </li>
              )
            )}
          </ul>
        )}

        <div className="gestion-opciones__form-opcion">
          <input
            type="text"
            value={nuevaVariante.nombre}
            onChange={(e) => setNuevaVariante((a) => ({ ...a, nombre: e.target.value }))}
            placeholder="Nombre (ej. Grande)"
            maxLength={40}
          />
          <input
            type="number"
            min="0"
            step="1"
            value={nuevaVariante.precio}
            onChange={(e) => setNuevaVariante((a) => ({ ...a, precio: e.target.value }))}
            placeholder="Precio"
          />
          <input
            type="number"
            step="1"
            value={nuevaVariante.orden}
            onChange={(e) => setNuevaVariante((a) => ({ ...a, orden: e.target.value }))}
            placeholder="Orden"
          />
          <button
            type="button"
            className="boton boton--secundario boton--pequeno"
            onClick={agregarVariante}
            disabled={!nuevaVariante.nombre.trim() || nuevaVariante.precio === ''}
          >
            Agregar variante
          </button>
        </div>

        {error && <span className="campo__error">{error}</span>}
      </div>
    </div>
  )
}
