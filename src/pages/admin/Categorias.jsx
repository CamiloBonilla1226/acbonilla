import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaCategorias } from '../../components/admin/TablaCategorias'
import { FormularioCategoria } from '../../components/admin/FormularioCategoria'
import { useCategorias } from '../../hooks/useCategorias'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../../lib/superposicion'

export function Categorias() {
  const { categorias, cargando, error, crearCategoria, actualizarCategoria, eliminarCategoria } = useCategorias()

  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null) // objeto o 'nuevo'
  const cerrarModal = () => setCategoriaEnEdicion(null)
  const swipe = useSwipeParaCerrar(cerrarModal)

  const guardarCategoria = async (datos) => {
    const resultado =
      categoriaEnEdicion === 'nuevo'
        ? await crearCategoria(datos.nombre)
        : await actualizarCategoria(categoriaEnEdicion.id, datos)

    if (resultado.exito) setCategoriaEnEdicion(null)
    return resultado
  }

  const confirmarEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return

    const { exito, error: errorEliminar } = await eliminarCategoria(id)
    if (!exito) {
      alert(errorEliminar?.message ?? 'No se pudo eliminar la categoría.')
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
