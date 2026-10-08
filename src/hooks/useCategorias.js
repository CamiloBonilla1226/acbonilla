import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

export function useCategorias({
  soloActivas = false,
  soloVisibleDomicilios = false,
  soloVisibleCartaFisica = false,
} = {}) {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    let consulta = supabase
      .from('categorias')
      .select('*')
      .eq('negocio_id', negocioConfig.negocioId)
      .order('nombre', { ascending: true })

    if (soloActivas) {
      consulta = consulta.eq('activo', true)
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
      setCategorias([])
    } else {
      setCategorias(data)
    }
    setCargando(false)
  }, [soloActivas, soloVisibleDomicilios, soloVisibleCartaFisica])

  useEffect(() => {
    recargar()
  }, [recargar])

  const crearCategoria = useCallback(
    async (datos) => {
      const nombreLimpio = datos.nombre.trim()
      if (!nombreLimpio) {
        return { exito: false, error: new Error('El nombre es obligatorio.') }
      }

      // ilike sin comodines (%) hace una comparación exacta insensible a mayúsculas/acentos
      // de caja, suficiente para detectar duplicados como "Bebidas" vs "bebidas".
      const { data: existente, error: errorConsulta } = await supabase
        .from('categorias')
        .select('id')
        .eq('negocio_id', negocioConfig.negocioId)
        .ilike('nombre', nombreLimpio)
        .maybeSingle()

      if (errorConsulta) return { exito: false, error: errorConsulta }
      if (existente) {
        return { exito: false, error: new Error('Ya existe una categoría con ese nombre.') }
      }

      const { error: errorCrear } = await supabase
        .from('categorias')
        .insert({ ...datos, nombre: nombreLimpio, negocio_id: negocioConfig.negocioId })

      if (!errorCrear) await recargar()
      return { exito: !errorCrear, error: errorCrear }
    },
    [recargar]
  )

  const actualizarCategoria = useCallback(
    async (id, cambiosOriginales) => {
      let cambios = cambiosOriginales

      if (cambios.nombre !== undefined) {
        const nombreLimpio = cambios.nombre.trim()
        if (!nombreLimpio) {
          return { exito: false, error: new Error('El nombre es obligatorio.') }
        }

        const { data: existente, error: errorConsulta } = await supabase
          .from('categorias')
          .select('id')
          .eq('negocio_id', negocioConfig.negocioId)
          .neq('id', id)
          .ilike('nombre', nombreLimpio)
          .maybeSingle()

        if (errorConsulta) return { exito: false, error: errorConsulta }
        if (existente) {
          return { exito: false, error: new Error('Ya existe una categoría con ese nombre.') }
        }

        cambios = { ...cambios, nombre: nombreLimpio }
      }

      const { error: errorActualizar } = await supabase
        .from('categorias')
        .update(cambios)
        .eq('id', id)

      if (!errorActualizar) await recargar()
      return { exito: !errorActualizar, error: errorActualizar }
    },
    [recargar]
  )

  const eliminarCategoria = useCallback(
    async (id) => {
      // En la base de datos, borrar la categoría solo quitaría sus filas de
      // productos_categorias (on delete cascade). Se bloquea desde aquí para que no se pierda
      // por accidente la organización de productos que todavía la usan.
      const { count, error: errorConteo } = await supabase
        .from('productos_categorias')
        .select('producto_id', { count: 'exact', head: true })
        .eq('categoria_id', id)

      if (errorConteo) return { exito: false, error: errorConteo }

      if (count > 0) {
        return {
          exito: false,
          error: new Error(
            `No se puede eliminar: hay ${count} producto${count === 1 ? '' : 's'} usando esta categoría.`
          ),
        }
      }

      const { error: errorEliminar } = await supabase.from('categorias').delete().eq('id', id)

      if (!errorEliminar) await recargar()
      return { exito: !errorEliminar, error: errorEliminar }
    },
    [recargar]
  )

  const toggleActivo = useCallback(
    async (id, valor) => {
      // Desactivar una categoría solo la oculta: sus productos no se tocan. Como un producto
      // puede estar en varias categorías, deja de verse dentro de esta pero sigue en sus otras
      // categorías activas (ver lib/productosVisibles.js). Al reactivarla todo vuelve igual.
      const { error: errorActualizar } = await supabase.from('categorias').update({ activo: valor }).eq('id', id)

      if (errorActualizar) {
        return { exito: false, error: errorActualizar }
      }

      await recargar()
      return { exito: true }
    },
    [recargar]
  )

  return {
    categorias,
    cargando,
    error,
    recargar,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    toggleActivo,
  }
}
