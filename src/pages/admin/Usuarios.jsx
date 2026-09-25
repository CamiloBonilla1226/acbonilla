import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaUsuarios } from '../../components/admin/TablaUsuarios'
import { FormularioEmpleado } from '../../components/admin/FormularioEmpleado'
import { useUsuariosAdmin } from '../../hooks/useUsuariosAdmin'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../../lib/superposicion'

export function Usuarios() {
  const { usuarios, cargando, error, crearEmpleado, eliminarUsuario } = useUsuariosAdmin()

  const [creando, setCreando] = useState(false)
  const cerrarModal = () => setCreando(false)
  const swipe = useSwipeParaCerrar(cerrarModal)

  // Esta pantalla es para que el dueño administre a SUS empleados: no tiene sentido que se
  // vea a sí mismo en la lista (ni podría eliminarse ni tendría nada que hacer con su propia
  // fila). Como cada negocio tiene un único dueño, ocultar todas las filas con rol "dueño"
  // equivale a ocultar la del dueño que está mirando el panel, sin depender de comparar IDs
  // (el id de usuarios_admin no es el mismo que el id de auth.users de la sesión).
  const empleados = usuarios.filter((usuario) => usuario.rol !== 'dueño')

  const guardarEmpleado = async (numero, contrasena, nombre) => {
    const resultado = await crearEmpleado(numero, contrasena, nombre)
    if (resultado.exito) setCreando(false)
    return resultado
  }

  const confirmarEliminar = async (id) => {
    if (window.confirm('¿Eliminar este usuario? Ya no podrá iniciar sesión en el panel.')) {
      await eliminarUsuario(id)
    }
  }

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-usuarios">
        <h1>Usuarios</h1>

        <button type="button" className="admin-crear admin-crear--boton" onClick={() => setCreando(true)}>
          <span className="admin-crear__icono" aria-hidden="true">
            +
          </span>
          Crear empleado
        </button>

        {cargando && <p className="texto-suave">Cargando usuarios…</p>}
        {error && <p className="campo__error">No se pudieron cargar los usuarios.</p>}
        {!cargando && !error && <TablaUsuarios usuarios={empleados} onEliminar={confirmarEliminar} />}
      </main>

      {creando && (
        <div className="superposicion" role="dialog" aria-modal="true" onClick={alSoltarFondo(cerrarModal)}>
          <div
            className="superposicion__panel"
            style={swipe.estilo}
            onTouchStart={swipe.onTouchStart}
            onTouchMove={swipe.onTouchMove}
            onTouchEnd={swipe.onTouchEnd}
          >
            <button type="button" className="superposicion__cerrar-x" onClick={cerrarModal} aria-label="Cerrar">
              ×
            </button>
            <h2>Crear empleado</h2>
            <FormularioEmpleado onGuardar={guardarEmpleado} onCancelar={cerrarModal} />
          </div>
        </div>
      )}
    </>
  )
}
