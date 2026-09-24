import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

// Se usa tanto desde el checkout público (crearPedido, sin sesión) como desde el panel
// admin (listar/actualizar estado, requiere sesión — reforzado por RLS). La suscripción
// en tiempo real es para que dueño/empleado vean un pedido nuevo sin recargar la
// pantalla, en línea con el requisito de "máxima usabilidad" del brief.
export function usePedidos({ tiempoReal = false } = {}) {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    const { data, error: errorConsulta } = await supabase
      .from('pedidos')
      .select('*')
      .eq('negocio_id', negocioConfig.negocioId)
      .order('creado_en', { ascending: false })

    if (errorConsulta) {
      setError(errorConsulta)
      setPedidos([])
    } else {
      setPedidos(data)
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  useEffect(() => {
    if (!tiempoReal) return undefined

    const canal = supabase
      .channel(`pedidos-negocio-${negocioConfig.negocioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `negocio_id=eq.${negocioConfig.negocioId}`,
        },
        () => recargar()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [tiempoReal, recargar])

  const crearPedido = useCallback(async (pedido) => {
    const { data, error: errorCrear } = await supabase
      .from('pedidos')
      .insert({ ...pedido, negocio_id: negocioConfig.negocioId, estado: 'nuevo' })
      .select()
      .single()

    return { exito: !errorCrear, error: errorCrear, pedido: data }
  }, [])

  const actualizarEstadoPedido = useCallback(
    async (id, estado) => {
      const { error: errorActualizar } = await supabase.from('pedidos').update({ estado }).eq('id', id)

      if (!errorActualizar) await recargar()
      return { exito: !errorActualizar, error: errorActualizar }
    },
    [recargar]
  )

  return { pedidos, cargando, error, recargar, crearPedido, actualizarEstadoPedido }
}
