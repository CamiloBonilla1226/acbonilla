import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { numeroACorreoInterno } from '../lib/phoneAuth'
import { negocioConfig } from '../config/negocio.config'

function extraerSesion(session) {
  if (!session?.user) {
    return { usuario: null, rol: null, negocioId: null }
  }

  // rol/negocio_id se leen de app_metadata, no de user_metadata: app_metadata solo lo
  // puede escribir el servidor (con la service_role key, ver la Edge Function
  // crear-usuario-admin), mientras que user_metadata lo puede modificar el propio
  // usuario autenticado con supabase.auth.updateUser(). Si el rol/negocio_id vivieran en
  // user_metadata, cualquier admin podría cambiarse a sí mismo el negocio_id y acceder a
  // datos de otro negocio. Las políticas RLS ya se corrigieron para exigir app_metadata.
  const metadata = session.user.app_metadata ?? {}
  return {
    usuario: session.user,
    rol: metadata.rol ?? null,
    negocioId: metadata.negocio_id ?? null,
  }
}

export function useAuth() {
  const [estado, setEstado] = useState({
    usuario: null,
    rol: null,
    negocioId: null,
    cargando: true,
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return
      setEstado({ ...extraerSesion(data.session), cargando: false })
    })

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (!activo) return
      setEstado({ ...extraerSesion(session), cargando: false })
    })

    return () => {
      activo = false
      suscripcion.subscription.unsubscribe()
    }
  }, [])

  const iniciarSesion = useCallback(async (numero, contrasena) => {
    setError(null)
    const correoInterno = numeroACorreoInterno(numero, negocioConfig.negocioId)

    const { data, error: errorLogin } = await supabase.auth.signInWithPassword({
      email: correoInterno,
      password: contrasena,
    })

    if (errorLogin) {
      setError('Número o contraseña incorrectos.')
      return { exito: false, error: errorLogin }
    }

    // Verificación adicional (no es la seguridad real, esa la aplica RLS): un usuario
    // autenticado solo debe poder operar en el negocio para el que este proyecto está
    // configurado. Si por alguna razón la sesión trae otro negocio_id, se cierra.
    const negocioIdSesion = data.user?.app_metadata?.negocio_id
    if (negocioIdSesion !== negocioConfig.negocioId) {
      await supabase.auth.signOut()
      setError('Este usuario no pertenece a este negocio.')
      return { exito: false, error: new Error('negocio_id no coincide') }
    }

    // El rol/negocio_id vive en app_metadata (verificado arriba), pero `activo` vive en
    // usuarios_admin: se consulta aparte porque desactivar una cuenta no reescribe el JWT
    // ya emitido (seguiría trayendo la sesión válida hasta que expire). numero se limpia
    // igual que en la Edge Function crear-usuario-admin, para que coincida con lo guardado.
    const numeroLimpio = numero.replace(/\D/g, '')
    const { data: filaUsuario, error: errorFila } = await supabase
      .from('usuarios_admin')
      .select('activo')
      .eq('negocio_id', negocioConfig.negocioId)
      .eq('numero', numeroLimpio)
      .maybeSingle()

    if (errorFila || !filaUsuario || filaUsuario.activo === false) {
      await supabase.auth.signOut()
      setError('Esta cuenta está desactivada.')
      return { exito: false, error: new Error('usuario desactivado') }
    }

    return { exito: true }
  }, [])

  const cerrarSesion = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return {
    usuario: estado.usuario,
    rol: estado.rol,
    negocioId: estado.negocioId,
    cargando: estado.cargando,
    autenticado: Boolean(estado.usuario),
    esDueno: estado.rol === 'dueño',
    esEmpleado: estado.rol === 'empleado',
    error,
    iniciarSesion,
    cerrarSesion,
  }
}
