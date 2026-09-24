import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaCategorias } from '../../components/admin/TablaCategorias'
import { FormularioCategoria } from '../../components/admin/FormularioCategoria'
import { useCategorias } from '../../hooks/useCategorias'

export function Categorias() {
  const { categorias, cargando, error, crearCategoria, actualizarCategoria, eliminarCategoria } = useCategorias()

  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null) // objeto o 'nuevo'

  const guardarCategoria = async (datos) => {
    if (categoriaEnEdicion === 'nuevo') {
      await crearCategoria(datos.nombre)
    } else {
      await actualizarCategoria(categoriaEnEdicion.id, datos)
    }
    setCategoriaEnEdicion(null)
  }

  const confirmarEliminar = async (id) => {
    if (window.confirm('¿Eliminar esta categoría? Los productos asociados no se eliminan, pero quedarán sin categoría.')) {
      await eliminarCategoria(id)
    }
  }

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-categorias">
        <h1>Categorías</h1>

        <button type="button" className="admin-crear admin-crear--boton" onClick={() => setCategoriaEnEdicion('nuevo')}>
          <span className="admin-crear__icono" aria-hidden="true">
            +
          </span>
          Nueva categoría
        </button>

        {cargando && <p className="texto-suave">Cargando categorías…</p>}
        {error && <p className="campo__error">No se pudieron cargar las categorías.</p>}
        {!cargando && !error && (
          <TablaCategorias categorias={categorias} onEditar={setCategoriaEnEdicion} onEliminar={confirmarEliminar} />
        )}
      </main>

      {categoriaEnEdicion && (
        <div className="superposicion" role="dialog" aria-modal="true">
          <div className="superposicion__panel">
            <h2>{categoriaEnEdicion === 'nuevo' ? 'Nueva categoría' : 'Editar categoría'}</h2>
            <FormularioCategoria
              categoriaInicial={categoriaEnEdicion === 'nuevo' ? null : categoriaEnEdicion}
              onGuardar={guardarCategoria}
              onCancelar={() => setCategoriaEnEdicion(null)}
            />
          </div>
        </div>
      )}
    </>
  )
}
