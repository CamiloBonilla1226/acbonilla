import { useEffect, useState } from 'react'
import { ImagenProducto } from '../menu/ImagenProducto'
import { Interruptor } from './Interruptor'
import { SelectorCategorias } from './SelectorCategorias'
import { subirImagenProducto } from '../../lib/storage'
import { negocioConfig } from '../../config/negocio.config'
import { useVariantesProducto } from '../../hooks/useVariantesProducto'
import { mensajeAmigablePostgres } from '../../lib/erroresAmigables'
import { tienePrecioCartaFisica } from '../../lib/preciosCartaFisica'

const MAX_VARIANTES = 5
const VARIANTE_VACIA = { nombre: '', precio: '', precio_carta_fisica: '' }

const VACIO = {
  nombre: '',
  descripcion: '',
  categoria_ids: [],
  precio: '',
  precio_oferta: '',
  precio_carta_fisica: '',
  precio_oferta_carta_fisica: '',
  imagen_url: '',
  disponible: true,
  visible_domicilios: true,
  visible_carta_fisica: true,
  destacado: false,
}

// Formulario único de producto: si tiene variantes (switch "¿Tiene variantes?"), se
// ocultan precio/precio_oferta (esos campos dejan de aplicar — el precio real lo da cada
// variante) y aparece una lista de hasta 5 filas nombre+precio. Al guardar, el producto y
// sus variantes se crean/actualizan en una sola acción atómica (ver useProductos.js:
// crearProducto/actualizarProducto hacen rollback si falla la parte de variantes), para que
// en el panel se sienta como un solo paso y no dos formularios separados.
// Precio en carta física (opcional, switch "Precio diferente en la carta física"): apagado,
// la carta física usa los mismos precios de domicilios (se guarda null). Al encenderlo se
// copian los precios de domicilios como punto de partida, y se edita el precio, el de oferta
// (o, con variantes, el precio en el local de cada variante). Ver lib/preciosCartaFisica.js.
export function FormularioProducto({ categorias, productoInicial, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(
    productoInicial
      ? {
          nombre: productoInicial.nombre,
          descripcion: productoInicial.descripcion ?? '',
          categoria_ids: productoInicial.categorias.map((categoria) => categoria.id),
          precio: productoInicial.precio ?? '',
          precio_oferta: productoInicial.precio_oferta ?? '',
          precio_carta_fisica: productoInicial.precio_carta_fisica ?? '',
          precio_oferta_carta_fisica: productoInicial.precio_oferta_carta_fisica ?? '',
          imagen_url: productoInicial.imagen_url ?? '',
          disponible: productoInicial.disponible,
          visible_domicilios: productoInicial.visible_domicilios ?? true,
          visible_carta_fisica: productoInicial.visible_carta_fisica ?? true,
          destacado: productoInicial.destacado ?? false,
        }
      : VACIO
  )
  const [tieneVariantes, setTieneVariantes] = useState(productoInicial?.tiene_variantes ?? false)
  const [variantes, setVariantes] = useState([VARIANTE_VACIA])
  // `variantes_producto` del producto (embed liviano de useProductos) basta para saber al abrir
  // si alguna variante ya tiene precio propio en la carta física.
  const [precioFisicaDistinto, setPrecioFisicaDistinto] = useState(() =>
    tienePrecioCartaFisica(productoInicial, productoInicial?.variantes_producto ?? [])
  )
  const [guardando, setGuardando] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [errorImagen, setErrorImagen] = useState(null)
  const [errorGuardado, setErrorGuardado] = useState(null)

  // Al editar un producto que ya tiene variantes, se precargan editables en la misma lista.
  const { variantes: variantesExistentes, cargando: cargandoVariantes } = useVariantesProducto(
    productoInicial?.id ?? null
  )
  useEffect(() => {
    if (productoInicial && !cargandoVariantes && variantesExistentes.length > 0) {
      setVariantes(
        variantesExistentes.map((v) => ({
          nombre: v.nombre,
          precio: String(v.precio),
          precio_carta_fisica: v.precio_carta_fisica == null ? '' : String(v.precio_carta_fisica),
        }))
      )
    }
    // Solo se necesita precargar una vez, cuando termina de cargar; no debe volver a pisar
    // lo que la persona ya esté editando en filas posteriores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoVariantes])

  const actualizar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value
    setValores((actual) => ({ ...actual, [campo]: valor }))
  }

  const actualizarVariante = (indice, campo) => (evento) => {
    const valor = evento.target.value
    setVariantes((actuales) => actuales.map((v, i) => (i === indice ? { ...v, [campo]: valor } : v)))
  }

  const agregarFilaVariante = () => {
    setVariantes((actuales) => (actuales.length >= MAX_VARIANTES ? actuales : [...actuales, VARIANTE_VACIA]))
  }

  const quitarFilaVariante = (indice) => {
    setVariantes((actuales) => actuales.filter((_, i) => i !== indice))
  }

  // Al encender el precio de carta física, los campos vacíos arrancan con el precio de
  // domicilios ("mismo precio" como punto de partida); lo que ya tenía valor se respeta.
  const cambiarPrecioFisicaDistinto = (activo) => {
    setPrecioFisicaDistinto(activo)
    if (!activo) return
    setValores((actual) => ({
      ...actual,
      precio_carta_fisica: actual.precio_carta_fisica === '' ? actual.precio : actual.precio_carta_fisica,
      precio_oferta_carta_fisica:
        actual.precio_oferta_carta_fisica === '' ? actual.precio_oferta : actual.precio_oferta_carta_fisica,
    }))
    setVariantes((actuales) =>
      actuales.map((v) => (v.precio_carta_fisica === '' ? { ...v, precio_carta_fisica: v.precio } : v))
    )
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

    let variantesValidas = []
    if (tieneVariantes) {
      variantesValidas = variantes
        .map((v) => ({
          nombre: v.nombre.trim(),
          precio: v.precio,
          // Sin precio en el local (o con el switch apagado) = mismo precio de domicilios.
          precio_carta_fisica: precioFisicaDistinto && v.precio_carta_fisica !== '' ? v.precio_carta_fisica : null,
        }))
        .filter((v) => v.nombre !== '' && v.precio !== '')

      if (variantesValidas.length === 0) {
        setErrorGuardado('Agrega al menos una variante con nombre y precio, o apaga "¿Tiene variantes?".')
        return
      }
    }

    const fisicaPropia = precioFisicaDistinto && !tieneVariantes
    if (fisicaPropia && valores.precio_carta_fisica === '') {
      setErrorGuardado('Escribe el precio de la carta física, o apaga "Precio diferente en la carta física".')
      return
    }

    setGuardando(true)
    setErrorGuardado(null)

    const resultado = await onGuardar(
      {
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim() || null,
        precio: tieneVariantes ? null : Number(valores.precio),
        precio_oferta: tieneVariantes || valores.precio_oferta === '' ? null : Number(valores.precio_oferta),
        precio_carta_fisica: fisicaPropia ? Number(valores.precio_carta_fisica) : null,
        precio_oferta_carta_fisica:
          fisicaPropia && valores.precio_oferta_carta_fisica !== '' ? Number(valores.precio_oferta_carta_fisica) : null,
        imagen_url: valores.imagen_url.trim() || null,
        disponible: valores.disponible,
        visible_domicilios: valores.visible_domicilios,
        visible_carta_fisica: valores.visible_carta_fisica,
        destacado: valores.destacado,
        tiene_variantes: tieneVariantes,
      },
      tieneVariantes ? variantesValidas : [],
      valores.categoria_ids
    )

    setGuardando(false)
    if (resultado && !resultado.exito) {
      setErrorGuardado(mensajeAmigablePostgres(resultado.error, 'No se pudo guardar el producto.'))
    }
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

      <SelectorCategorias
        titulo="Categorías (puedes marcar varias)"
        categorias={categorias}
        seleccionadas={valores.categoria_ids}
        onCambiar={(categoria_ids) => setValores((actual) => ({ ...actual, categoria_ids }))}
      />

      <Interruptor activo={tieneVariantes} etiqueta="¿Tiene variantes?" onCambiar={setTieneVariantes} />

      {tieneVariantes ? (
        <div className="gestion-opciones">
          <div className="gestion-opciones__grupo tarjeta">
            <div className="gestion-opciones__grupo-encabezado">
              <strong>Variantes</strong>
              <span className="texto-suave">Ej. tamaños o sabores (máximo {MAX_VARIANTES}).</span>
            </div>

            {precioFisicaDistinto && (
              <div className="gestion-opciones__columnas" aria-hidden="true">
                <span>Domicilios</span>
                <span>Carta física</span>
                <span />
              </div>
            )}

            <ul className="gestion-opciones__lista">
              {variantes.map((variante, indice) => (
                <li key={indice}>
                  <div
                    className={`gestion-opciones__form-opcion${
                      precioFisicaDistinto ? ' gestion-opciones__form-opcion--dos-precios' : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={variante.nombre}
                      onChange={actualizarVariante(indice, 'nombre')}
                      placeholder="Nombre (ej. Grande)"
                      maxLength={40}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={variante.precio}
                      onChange={actualizarVariante(indice, 'precio')}
                      placeholder={precioFisicaDistinto ? 'Domicilios' : 'Precio'}
                      aria-label={precioFisicaDistinto ? 'Precio en domicilios' : 'Precio'}
                    />
                    {precioFisicaDistinto && (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={variante.precio_carta_fisica}
                        onChange={actualizarVariante(indice, 'precio_carta_fisica')}
                        placeholder="Carta física"
                        aria-label="Precio en carta física"
                      />
                    )}
                    <button
                      type="button"
                      className="carrito__quitar"
                      onClick={() => quitarFilaVariante(indice)}
                      disabled={variantes.length <= 1}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="boton boton--secundario boton--pequeno"
              onClick={agregarFilaVariante}
              disabled={variantes.length >= MAX_VARIANTES}
            >
              Agregar variante
            </button>
          </div>
        </div>
      ) : (
        <div className={precioFisicaDistinto ? 'precios-carta' : 'precios-carta precios-carta--uno'}>
          <fieldset className="precios-carta__grupo">
            {precioFisicaDistinto && <legend className="precios-carta__titulo">Domicilios</legend>}
            <label className="campo">
              <span>Precio</span>
              <input type="number" min="0" step="1" value={valores.precio} onChange={actualizar('precio')} required />
            </label>
            <label className="campo">
              <span>Precio con descuento (opcional)</span>
              <input type="number" min="0" step="1" value={valores.precio_oferta} onChange={actualizar('precio_oferta')} />
            </label>
          </fieldset>

          {precioFisicaDistinto && (
            <fieldset className="precios-carta__grupo">
              <legend className="precios-carta__titulo">Carta física (en el local)</legend>
              <label className="campo">
                <span>Precio</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={valores.precio_carta_fisica}
                  onChange={actualizar('precio_carta_fisica')}
                  required
                />
              </label>
              <label className="campo">
                <span>Precio con descuento (opcional)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={valores.precio_oferta_carta_fisica}
                  onChange={actualizar('precio_oferta_carta_fisica')}
                />
              </label>
            </fieldset>
          )}
        </div>
      )}

      <div className="precios-carta__interruptor">
        <Interruptor
          activo={precioFisicaDistinto}
          etiqueta="Precio diferente en la carta física"
          onCambiar={cambiarPrecioFisicaDistinto}
        />
        <span className="texto-suave">
          {precioFisicaDistinto
            ? tieneVariantes
              ? 'Cada variante tiene su precio en domicilios y en el local. Si dejas vacío el del local, usa el de domicilios.'
              : 'La carta física (consumo en el local) muestra estos precios.'
            : 'Apagado: la carta física muestra el mismo precio que domicilios.'}
        </span>
      </div>

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

      <label className="campo campo--linea">
        <input type="checkbox" checked={valores.visible_domicilios} onChange={actualizar('visible_domicilios')} />
        <span>Mostrar en carta de domicilios</span>
      </label>

      <label className="campo campo--linea">
        <input type="checkbox" checked={valores.visible_carta_fisica} onChange={actualizar('visible_carta_fisica')} />
        <span>Mostrar en carta física</span>
      </label>

      <label className="campo campo--linea">
        <input type="checkbox" checked={valores.destacado} onChange={actualizar('destacado')} />
        <span>Destacado (carrusel de Inicio en la carta de domicilios, máximo 5)</span>
      </label>

      {errorGuardado && <p className="campo__error">{errorGuardado}</p>}

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
