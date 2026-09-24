import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaUsuarios } from '../../components/admin/TablaUsuarios'
import { FormularioEmpleado } from '../../components/admin/FormularioEmpleado'
import { useUsuariosAdmin } from '../../hooks/useUsuariosAdmin'

export function Usuarios() {
  const { usuarios, cargando, error, crearEmpleado, eliminarUsuario } = useUsuariosAdmin()

  const [creando, setCreando] = useState(false)

  const guardarEmpleado = async (numero, contrasena) => {
    const resultado = await crearEmpleado(numero, contrasena)
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
        {!cargando && !error && <TablaUsuarios usuarios={usuarios} onEliminar={confirmarEliminar} />}
      </main>

      {creando && (
        <div className="superposicion" role="dialog" aria-modal="true">
          <div className="superposicion__panel">
            <h2>Crear empleado</h2>
            <FormularioEmpleado onGuardar={guardarEmpleado} onCancelar={() => setCreando(false)} />
          </div>
        </div>
      )}
    </>
  )
}
