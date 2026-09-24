import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

export function useCategorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    const { data, error: errorConsulta } = await supabase
      .from('categorias')
      .select('*')
      .eq('negocio_id', negocioConfig.negocioId)
      .order('nombre', { ascending: true })

    if (errorConsulta) {
      setError(errorConsulta)
      setCategorias([])
    } else {
      setCategorias(data)
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const crearCategoria = useCallback(
    async (nombre) => {
      const { error: errorCrear } = await supabase
        .from('categorias')
        .insert({ nombre, negocio_id: negocioConfig.negocioId })

      if (!errorCrear) await recargar()
      return { exito: !errorCrear, error: errorCrear }
    },
    [recargar]
  )

  const actualizarCategoria = useCallback(
    async (id, cambios) => {
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
      // Se verifica desde el cliente en vez de depender de una restricción de clave foránea
      // en la base de datos, porque el modelo documentado en contexto-proyecto-base.md no
      // define el comportamiento on delete de productos.categoria_id. Si más adelante se
      // agrega esa restricción a nivel de base de datos, esta verificación sigue siendo una
      // capa extra que da un mensaje de error entendible en vez de un código de Postgres.
      const { count, error: errorConteo } = await supabase
        .from('productos')
        .select('id', { count: 'exact', head: true })
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

  return { categorias, cargando, error, recargar, crearCategoria, actualizarCategoria, eliminarCategoria }
}
