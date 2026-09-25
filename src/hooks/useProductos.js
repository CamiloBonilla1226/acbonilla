import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

// Trae cada producto con su categoría. Las adiciones (grupos_opciones/opciones) ya no
// pertenecen a un producto puntual, sino al negocio completo (ver useAdiciones.js), así
// que no se anidan aquí — se cargan aparte y aplican a cualquier producto por igual.
// `categoria.activo`/`visible_domicilios`/`visible_carta_fisica` viajan junto con el
// resto: las cartas públicas los usan para ocultar productos de una categoría
// desactivada o no visible en esa carta, aunque no se esté filtrando por ella (ver
// Carta.jsx/CartaFisica.jsx); no se puede filtrar directo en esta consulta porque un join
// `!inner` excluiría también a los productos sin categoría (categoria_id null).
// `variantes_producto(precio, disponible)` trae solo lo necesario para que la carta
// pública sepa, sin una consulta aparte por producto, si debe mostrar "Desde $X" en la
// tarjeta y forzar el modal de selección obligatoria antes de agregar al carrito (ver
// Carta.jsx/ProductoCard.jsx). El detalle completo (id, nombre, orden) se carga con
// useVariantesProducto.js cuando el modal ya está abierto.
const SELECT_PRODUCTO_COMPLETO = `
  *,
  categoria:categorias(id, nombre, activo, visible_domicilios, visible_carta_fisica),
  variantes_producto(precio, disponible)
`

// Inserta las filas de variantes de un producto (nombre + precio, orden = posición en la
// lista). Se usa tanto al crear como al editar; en ambos casos el llamador decide qué hacer
// si falla (ver crearProducto/actualizarProducto).
async function insertarVariantes(productoId, variantes) {
  const filas = variantes.map((variante, indice) => ({
    producto_id: productoId,
    negocio_id: negocioConfig.negocioId,
    nombre: variante.nombre.trim(),
    precio: Number(variante.precio) || 0,
    orden: indice,
  }))
  const { error } = await supabase.from('variantes_producto').insert(filas)
  return { error }
}

export function useProductos({
  categoriaId,
  soloDisponibles = false,
  soloVisibleDomicilios = false,
  soloVisibleCartaFisica = false,
} = {}) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    let consulta = supabase
      .from('productos')
      .select(SELECT_PRODUCTO_COMPLETO)
      .eq('negocio_id', negocioConfig.negocioId)
      .order('nombre', { ascending: true })

    if (categoriaId) {
      consulta = consulta.eq('categoria_id', categoriaId)
    }
    if (soloDisponibles) {
      consulta = consulta.eq('disponible', true)
    }
    if (soloVisibleDomicilios) {
      consulta = consulta.eq('visible_domicilios', true)
    }
    if (soloVisibleCartaFisica) {
      consulta = consulta.eq('visible_carta_fisica', true)
    }

    const { data, error: errorConsulta } = await consulta

    if (errorConsulta) {
      setError(errorConsulta)
      setProductos([])
    } else {
      setProductos(data)
    }
    setCargando(false)
  }, [categoriaId, soloDisponibles, soloVisibleDomicilios, soloVisibleCartaFisica])

  useEffect(() => {
    recargar()
  }, [recargar])

  // `variantes`: cuando el producto tiene variantes (switch encendido en el formulario), la
  // lista completa de {nombre, precio} a guardar en variantes_producto, en la misma acción
  // de crear — para el panel se siente como un solo "Crear producto", no dos pasos.
  const crearProducto = useCallback(
    async (producto, variantes = []) => {
      const nombreLimpio = producto.nombre?.trim() ?? ''
      if (!nombreLimpio) {
        return { exito: false, error: new Error('El nombre es obligatorio.') }
      }

      const { data: existente, error: errorConsulta } = await supabase
        .from('productos')
        .select('id')
        .eq('negocio_id', negocioConfig.negocioId)
        .ilike('nombre', nombreLimpio)
        .maybeSingle()

      if (errorConsulta) return { exito: false, error: errorConsulta }
      if (existente) {
        return { exito: false, error: new Error('Ya existe un producto con ese nombre.') }
      }

      const { data, error: errorCrear } = await supabase
        .from('productos')
        .insert({ ...producto, nombre: nombreLimpio, negocio_id: negocioConfig.negocioId })
        .select()
        .single()

      if (errorCrear) return { exito: false, error: errorCrear }

      if (variantes.length > 0) {
        const { error: errorVariantes } = await insertarVariantes(data.id, variantes)
        if (errorVariantes) {
          // Rollback: no dejar un producto a medias sin sus variantes — mismo criterio de
          // atomicidad que ya se usa en la Edge Function crear-usuario-admin.
          await supabase.from('productos').delete().eq('id', data.id)
          return { exito: false, error: errorVariantes }
        }
      }

      await recargar()
      return { exito: true, producto: data }
    },
    [recargar]
  )

  // `variantes`: `null` deja intactas las variantes existentes (no se tocó esa parte del
  // formulario); un arreglo (aunque esté vacío) reemplaza por completo las variantes del
  // producto — se borran todas las anteriores y se insertan las que llegaron.
  const actualizarProducto = useCallback(
    async (id, cambiosOriginales, variantes = null) => {
      let cambios = cambiosOriginales

      if (cambios.nombre !== undefined) {
        const nombreLimpio = cambios.nombre.trim()
        if (!nombreLimpio) {
          return { exito: false, error: new Error('El nombre es obligatorio.') }
        }

        const { data: existente, error: errorConsulta } = await supabase
          .from('productos')
          .select('id')
          .eq('negocio_id', negocioConfig.negocioId)
          .neq('id', id)
          .ilike('nombre', nombreLimpio)
          .maybeSingle()

        if (errorConsulta) return { exito: false, error: errorConsulta }
        if (existente) {
          return { exito: false, error: new Error('Ya existe un producto con ese nombre.') }
        }

        cambios = { ...cambios, nombre: nombreLimpio }
      }

      const { error: errorActualizar } = await supabase.from('productos').update(cambios).eq('id', id)
      if (errorActualizar) return { exito: false, error: errorActualizar }

      if (variantes !== null) {
        const { error: errorEliminar } = await supabase.from('variantes_producto').delete().eq('producto_id', id)
        if (errorEliminar) return { exito: false, error: errorEliminar }

        if (variantes.length > 0) {
          const { error: errorVariantes } = await insertarVariantes(id, variantes)
          if (errorVariantes) return { exito: false, error: errorVariantes }
        }
      }

      await recargar()
      return { exito: true }
    },
    [recargar]
  )

  const eliminarProducto = useCallback(
    async (id) => {
      const { error: errorEliminar } = await supabase.from('productos').delete().eq('id', id)

      if (!errorEliminar) await recargar()
      return { exito: !errorEliminar, error: errorEliminar }
    },
    [recargar]
  )

  const toggleDisponible = useCallback(
    async (id, valor) => {
      const { error: errorActualizar } = await supabase
        .from('productos')
        .update({ disponible: valor })
        .eq('id', id)

      if (!errorActualizar) await recargar()
      return { exito: !errorActualizar, error: errorActualizar }
    },
    [recargar]
  )

  return {
    productos,
    cargando,
    error,
    recargar,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    toggleDisponible,
  }
}
