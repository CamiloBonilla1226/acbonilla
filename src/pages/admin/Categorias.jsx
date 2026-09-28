import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaCategorias } from '../../components/admin/TablaCategorias'
import { FormularioCategoria } from '../../components/admin/FormularioCategoria'
import { useCategorias } from '../../hooks/useCategorias'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../../lib/superposicion'
import { useToast } from '../../hooks/useToast'
import { useConfirmacion } from '../../hooks/useConfirmacion'

export function Categorias() {
  const { categorias, cargando, error, crearCategoria, actualizarCategoria, eliminarCategoria, toggleActivo } =
    useCategorias()

  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null) // objeto o 'nuevo'
  const cerrarModal = () => setCategoriaEnEdicion(null)
  const swipe = useSwipeParaCerrar(cerrarModal)
  const mostrarToast = useToast()
  const confirmar = useConfirmacion()

  const guardarCategoria = async (datos) => {
    const esNueva = categoriaEnEdicion === 'nuevo'
    const resultado = esNueva
      ? await crearCategoria(datos)
      : await actualizarCategoria(categoriaEnEdicion.id, datos)

    if (resultado.exito) {
      setCategoriaEnEdicion(null)
      mostrarToast(esNueva ? 'Categoría creada' : 'Categoría actualizada')
    }
    return resultado
  }

  const confirmarEliminar = async (id) => {
    const confirmado = await confirmar('¿Eliminar esta categoría?')
    if (!confirmado) return

    const { exito, error: errorEliminar } = await eliminarCategoria(id)
    mostrarToast(
      exito ? 'Categoría eliminada' : errorEliminar?.message ?? 'No se pudo eliminar la categoría.',
      exito ? 'exito' : 'error'
    )
  }

  const cambiarActivo = async (id, valor) => {
    const { exito, error: errorActualizar } = await toggleActivo(id, valor)
    mostrarToast(
      exito ? (valor ? 'Categoría activada' : 'Categoría desactivada') : errorActualizar.message,
      exito ? 'exito' : 'error'
    )
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
          <TablaCategorias
            categorias={categorias}
            onEditar={setCategoriaEnEdicion}
            onEliminar={confirmarEliminar}
            onToggleActivo={cambiarActivo}
          />
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
