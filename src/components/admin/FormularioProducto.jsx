import { useState } from 'react'
import { ImagenProducto } from '../menu/ImagenProducto'
import { subirImagenProducto } from '../../lib/storage'
import { negocioConfig } from '../../config/negocio.config'

const VACIO = {
  nombre: '',
  descripcion: '',
  categoria_id: '',
  precio: '',
  precio_oferta: '',
  imagen_url: '',
  disponible: true,
}

export function FormularioProducto({ categorias, productoInicial, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(
    productoInicial
      ? {
          nombre: productoInicial.nombre,
          descripcion: productoInicial.descripcion ?? '',
          categoria_id: productoInicial.categoria_id ?? '',
          precio: productoInicial.precio,
          precio_oferta: productoInicial.precio_oferta ?? '',
          imagen_url: productoInicial.imagen_url ?? '',
          disponible: productoInicial.disponible,
        }
      : VACIO
  )
  const [guardando, setGuardando] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [errorImagen, setErrorImagen] = useState(null)

  const actualizar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value
    setValores((actual) => ({ ...actual, [campo]: valor }))
  }

  const subirArchivo = async (evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = '' // permite volver a elegir el mismo archivo si falla
    if (!archivo) return

    setSubiendoImagen(true)
    setErrorImagen(null)

    const { url, error } = await subirImagenProducto(negocioConfig.negocioId, archivo)

    setSubiendoImagen(false)

    if (error) {
      setErrorImagen('No se pudo subir la imagen. Intenta de nuevo o pega una URL.')
      console.error(error)
      return
    }

    setValores((actual) => ({ ...actual, imagen_url: url }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()

    // La imagen es obligatoria (nombre y precio ya lo son vía el atributo `required` nativo
    // del input, pero no hay forma de marcar así un campo que se llena subiendo un archivo
    // o pegando una URL, así que se valida a mano aquí).
    if (!valores.imagen_url.trim()) {
      setErrorImagen('La imagen es obligatoria: sube un archivo o pega una URL.')
      return
    }

    setGuardando(true)

    await onGuardar({
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim() || null,
      categoria_id: valores.categoria_id || null,
      precio: Number(valores.precio),
      precio_oferta: valores.precio_oferta === '' ? null : Number(valores.precio_oferta),
      imagen_url: valores.imagen_url.trim() || null,
      disponible: valores.disponible,
    })

    setGuardando(false)
  }

  return (
    <form className="checkout formulario-producto" onSubmit={enviar} noValidate>
      <label className="campo">
        <span>Nombre</span>
        <input type="text" value={valores.nombre} onChange={actualizar('nombre')} required maxLength={80} />
      </label>

      <label className="campo">
        <span>Descripción</span>
        <input type="text" value={valores.descripcion} onChange={actualizar('descripcion')} maxLength={200} />
      </label>

      <label className="campo">
        <span>Categoría</span>
        <select value={valores.categoria_id} onChange={actualizar('categoria_id')}>
          <option value="">Sin categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="campo">
        <span>Precio</span>
        <input type="number" min="0" step="1" value={valores.precio} onChange={actualizar('precio')} required />
      </label>

      <label className="campo">
        <span>Precio de oferta (opcional)</span>
        <input type="number" min="0" step="1" value={valores.precio_oferta} onChange={actualizar('precio_oferta')} />
      </label>

      <div className="campo campo-imagen">
        <span>Imagen del producto (obligatoria)</span>

        <ImagenProducto src={valores.imagen_url} alt={valores.nombre || 'Vista previa'} relacionAspecto="4 / 3" prioridad />

        <label className="boton boton--secundario boton--pequeno campo-imagen__subir">
          {subiendoImagen ? 'Subiendo…' : 'Subir imagen'}
          <input type="file" accept="image/*" onChange={subirArchivo} disabled={subiendoImagen} hidden />
        </label>

        {errorImagen && <span className="campo__error">{errorImagen}</span>}

        <input
          type="text"
          placeholder="…o pega una URL de imagen"
          value={valores.imagen_url}
          onChange={actualizar('imagen_url')}
        />
      </div>

      <label className="campo campo--linea">
        <input type="checkbox" checked={valores.disponible} onChange={actualizar('disponible')} />
        <span>Disponible</span>
      </label>

      <div className="opciones-producto__acciones">
        <button type="button" className="boton boton--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton" disabled={guardando || subiendoImagen}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
