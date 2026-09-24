import { AdminNav } from '../../components/admin/AdminNav'
import { GestionUsuarios } from '../../components/admin/GestionUsuarios'
import { useUsuariosAdmin } from '../../hooks/useUsuariosAdmin'

export function Usuarios() {
  const { usuarios, cargando, error, crearEmpleado, eliminarUsuario } = useUsuariosAdmin()

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-usuarios">
        <h1>Usuarios</h1>
        {cargando && <p className="texto-suave">Cargando usuarios…</p>}
        {error && <p className="campo__error">No se pudieron cargar los usuarios.</p>}
        {!cargando && !error && (
          <GestionUsuarios usuarios={usuarios} onCrear={crearEmpleado} onEliminar={eliminarUsuario} />
        )}
      </main>
    </>
  )
}
