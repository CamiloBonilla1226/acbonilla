import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

// Trae cada producto con su categoría. Las adiciones (grupos_opciones/opciones) ya no
// pertenecen a un producto puntual, sino al negocio completo (ver useAdiciones.js), así
// que no se anidan aquí — se cargan aparte y aplican a cualquier producto por igual.
const SELECT_PRODUCTO_COMPLETO = `
  *,
  categoria:categorias(id, nombre)
`

export function useProductos({ categoriaId, soloDisponibles = false } = {}) {
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

    const { data, error: errorConsulta } = await consulta

    if (errorConsulta) {
      setError(errorConsulta)
      setProductos([])
    } else {
      setProductos(data)
    }
    setCargando(false)
  }, [categoriaId, soloDisponibles])

  useEffect(() => {
    recargar()
  }, [recargar])

  const crearProducto = useCallback(
    async (producto) => {
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

      if (!errorCrear) await recargar()
      return { exito: !errorCrear, error: errorCrear, producto: data }
    },
    [recargar]
  )

  const actualizarProducto = useCallback(
    async (id, cambiosOriginales) => {
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

      if (!errorActualizar) await recargar()
      return { exito: !errorActualizar, error: errorActualizar }
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
