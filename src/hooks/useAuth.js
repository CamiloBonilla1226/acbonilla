import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { correoInternoANumero, numeroACorreoInterno } from '../lib/phoneAuth'
import { negocioConfig } from '../config/negocio.config'

// Compartida entre todas las instancias de useAuth() del árbol (ver el efecto de abajo que
// la usa) — no puede vivir dentro del hook porque cada componente que llama useAuth() tiene
// su propio estado local independiente.
let cerrandoSesionInvalida = false

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
  // Perfil propio en usuarios_admin (nombre + permisos por módulo): vive aparte de
  // app_metadata porque, igual que `activo`, son datos que el dueño puede cambiar en
  // cualquier momento sin que eso reescriba el JWT ya emitido del empleado.
  const [perfil, setPerfil] = useState(null)
  // Mientras el perfil todavía no llegó, RutaProtegida no debe decidir con `permiso` en
  // false por defecto — eso redirigiría a un empleado con permiso real, solo porque la
  // consulta a usuarios_admin (asíncrona) no había terminado en el primer render tras
  // iniciar sesión.
  const [cargandoPerfil, setCargandoPerfil] = useState(true)

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

  useEffect(() => {
    let activo = true

    if (!estado.usuario?.email) {
      setPerfil(null)
      setCargandoPerfil(false)
      return undefined
    }

    setCargandoPerfil(true)
    const numero = correoInternoANumero(estado.usuario.email)
    supabase
      .from('usuarios_admin')
      .select('nombre, activo, puede_productos, puede_categorias, puede_adiciones')
      .eq('negocio_id', negocioConfig.negocioId)
      .eq('numero', numero)
      .maybeSingle()
      .then(({ data, error: errorPerfil }) => {
        if (!activo) return
        // Log temporal de diagnóstico: si la consulta falla (RLS, columna inexistente,
        // numero que no matchea) o no encuentra fila, se ve en la consola en vez de fallar
        // en silencio con "sin permisos" como único síntoma visible.
        if (errorPerfil) {
          console.error('[useAuth] No se pudo cargar el perfil de usuarios_admin:', errorPerfil, { numero })
        } else if (!data) {
          console.warn('[useAuth] usuarios_admin no tiene ninguna fila para este usuario:', { numero })
        }
        setPerfil(data ?? null)
        setCargandoPerfil(false)
      })

    return () => {
      activo = false
    }
  }, [estado.usuario])

  // Si la sesión de Auth sigue viva (JWT todavía válido) pero la fila en usuarios_admin ya
  // no existe o quedó desactivada, hay que cerrar esa sesión activamente. Sin esto,
  // `autenticado` se queda en true con datos viejos y RutaProtegida.jsx, al redirigir a
  // /admin/login, rebotaría de vuelta a /admin en un loop (Login.jsx también navega a
  // /admin mientras `autenticado` sea true).
  //
  // `scope: 'local'` en vez del 'global' por defecto: si la cuenta de Auth ya no existe
  // (ej. se eliminó con eliminar-usuario-admin), el servidor no puede revocar esa sesión y
  // /logout devuelve 403 una y otra vez — con scope 'global' eso deja la sesión local sin
  // limpiar nunca y el rebote se vuelve infinito de verdad. 'local' borra el almacenamiento
  // del navegador de inmediato sin depender de que el servidor confirme nada.
  //
  // `cerrandoSesionInvalida` es de módulo (compartido por todas las instancias de
  // useAuth() — Login.jsx, RutaProtegida.jsx, AdminNav.jsx llaman a este hook por separado,
  // cada una con su propio efecto) para que solo se dispare un signOut a la vez, en vez de
  // 3-4 llamadas simultáneas.
  useEffect(() => {
    if (!estado.usuario || cargandoPerfil) return
    if ((perfil === null || perfil.activo === false) && !cerrandoSesionInvalida) {
      cerrandoSesionInvalida = true
      supabase.auth.signOut({ scope: 'local' }).finally(() => {
        cerrandoSesionInvalida = false
      })
    }
  }, [estado.usuario, cargandoPerfil, perfil])

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

  const esDueno = estado.rol === 'dueño'
  // Que Supabase Auth acepte la sesión no basta: si el dueño ya borró (o desactivó) la
  // fila de este usuario en usuarios_admin, la cuenta de Auth puede seguir viva un rato
  // (ver eliminarUsuario en useUsuariosAdmin.js) o el JWT seguir siendo válido hasta que
  // expire. `cuentaValida` es lo que RutaProtegida.jsx usa como el verdadero portón de
  // acceso, no `autenticado` a secas — evita el "flash" de contenido admin para un usuario
  // ya eliminado/desactivado mientras esta consulta todavía está en camino.
  const cuentaValida = Boolean(estado.usuario) && !cargandoPerfil && perfil !== null && perfil.activo !== false

  return {
    usuario: estado.usuario,
    rol: estado.rol,
    negocioId: estado.negocioId,
    cargando: estado.cargando,
    cargandoPerfil,
    autenticado: Boolean(estado.usuario),
    cuentaValida,
    esDueno,
    esEmpleado: estado.rol === 'empleado',
    nombre: perfil?.nombre ?? null,
    // El dueño siempre tiene acceso completo, sin depender de estas columnas (que solo
    // aplican a empleados).
    puedeProductos: esDueno || perfil?.puede_productos === true,
    puedeCategorias: esDueno || perfil?.puede_categorias === true,
    puedeAdiciones: esDueno || perfil?.puede_adiciones === true,
    error,
    iniciarSesion,
    cerrarSesion,
  }
}
