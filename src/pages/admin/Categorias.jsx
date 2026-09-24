import { AdminNav } from '../../components/admin/AdminNav'
import { GestionCategorias } from '../../components/admin/GestionCategorias'
import { useCategorias } from '../../hooks/useCategorias'

export function Categorias() {
  const { categorias, cargando, error, crearCategoria, actualizarCategoria, eliminarCategoria } = useCategorias()

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-categorias">
        <h1>Categorías</h1>
        {cargando && <p className="texto-suave">Cargando categorías…</p>}
        {error && <p className="campo__error">No se pudieron cargar las categorías.</p>}
        {!cargando && !error && (
          <GestionCategorias
            categorias={categorias}
            onCrear={crearCategoria}
            onActualizar={actualizarCategoria}
            onEliminar={eliminarCategoria}
          />
        )}
      </main>
    </>
  )
}
