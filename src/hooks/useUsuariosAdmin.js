import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

// Gestión de usuarios_admin (dueño/empleados) del negocio. Igual que useGruposOpciones,
// no estaba en la lista original de hooks del brief, pero es necesaria para el punto 8
// ("gestión de usuarios empleados, solo visible para rol dueño").
export function useUsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    const { data, error: errorConsulta } = await supabase
      .from('usuarios_admin')
      .select('id, numero, nombre, rol, creado_en')
      .eq('negocio_id', negocioConfig.negocioId)
      .order('creado_en', { ascending: true })

    if (errorConsulta) {
      setError(errorConsulta)
      setUsuarios([])
    } else {
      setUsuarios(data)
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const crearEmpleado = useCallback(
    async (numero, contrasena, nombre) => {
      // La creación de la cuenta de Auth (con su app_metadata de negocio_id/rol) y el
      // registro en usuarios_admin ya no se hacen por separado desde el navegador: ambos
      // pasos ocurren dentro de la Edge Function `crear-usuario-admin`, con el cliente
      // service_role, como una sola operación. Antes, insertar la fila en usuarios_admin
      // desde aquí (con la sesión del dueño) dependía de que existieran políticas RLS para
      // esa tabla; cuando faltaron, el insert fallaba y dejaba un usuario "fantasma" en
      // auth.users sin fila en usuarios_admin. Ver CHANGELOG.md para el detalle completo.
      const { data, error: errorFuncion } = await supabase.functions.invoke('crear-usuario-admin', {
        body: { numero, contrasena, nombre, rol: 'empleado' },
      })

      if (errorFuncion) return { exito: false, error: errorFuncion }
      if (data?.error) return { exito: false, error: new Error(data.error) }

      await recargar()
      return { exito: true }
    },
    [recargar]
  )

  const eliminarUsuario = useCallback(
    async (id) => {
      const { error: errorEliminar } = await supabase.from('usuarios_admin').delete().eq('id', id)
      if (!errorEliminar) await recargar()
      return { exito: !errorEliminar, error: errorEliminar }
    },
    [recargar]
  )

  return { usuarios, cargando, error, recargar, crearEmpleado, eliminarUsuario }
}
