import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaAdiciones } from '../../components/admin/TablaAdiciones'
import { FormularioAdicion } from '../../components/admin/FormularioAdicion'
import { useAdiciones } from '../../hooks/useAdiciones'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../../lib/superposicion'

export function Adiciones() {
  const { adiciones, cargando, error, crearAdicion, actualizarAdicion, eliminarAdicion, toggleDisponible } =
    useAdiciones()

  const [adicionEnEdicion, setAdicionEnEdicion] = useState(null) // objeto o 'nuevo'
  const cerrarModal = () => setAdicionEnEdicion(null)
  const swipe = useSwipeParaCerrar(cerrarModal)

  const guardarAdicion = async (datos) => {
    const resultado =
      adicionEnEdicion === 'nuevo'
        ? await crearAdicion(datos)
        : await actualizarAdicion(adicionEnEdicion.id, datos)

    if (resultado.exito) setAdicionEnEdicion(null)
    return resultado
  }

  const confirmarEliminar = async (id) => {
    if (window.confirm('¿Eliminar esta adición? Esta acción no se puede deshacer.')) {
      await eliminarAdicion(id)
    }
  }

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-adiciones">
        <h1>Adiciones</h1>

        <button type="button" className="admin-crear admin-crear--boton" onClick={() => setAdicionEnEdicion('nuevo')}>
          <span className="admin-crear__icono" aria-hidden="true">
            +
          </span>
          Nueva adición
        </button>

        {cargando && <p className="texto-suave">Cargando adiciones…</p>}
        {error && <p className="campo__error">No se pudieron cargar las adiciones.</p>}
        {!cargando && !error && (
          <TablaAdiciones
            adiciones={adiciones}
            onEditar={setAdicionEnEdicion}
            onEliminar={confirmarEliminar}
            onToggleDisponible={toggleDisponible}
          />
        )}
      </main>

      {adicionEnEdicion && (
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
            <h2>{adicionEnEdicion === 'nuevo' ? 'Nueva adición' : 'Editar adición'}</h2>
            <FormularioAdicion
              adicionInicial={adicionEnEdicion === 'nuevo' ? null : adicionEnEdicion}
              onGuardar={guardarAdicion}
              onCancelar={() => setAdicionEnEdicion(null)}
            />
          </div>
        </div>
      )}
    </>
  )
}
