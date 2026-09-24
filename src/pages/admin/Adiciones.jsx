import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaAdiciones } from '../../components/admin/TablaAdiciones'
import { FormularioAdicion } from '../../components/admin/FormularioAdicion'
import { useAdiciones } from '../../hooks/useAdiciones'

export function Adiciones() {
  const { adiciones, cargando, error, crearAdicion, actualizarAdicion, eliminarAdicion } = useAdiciones()

  const [adicionEnEdicion, setAdicionEnEdicion] = useState(null) // objeto o 'nuevo'

  const guardarAdicion = async (datos) => {
    if (adicionEnEdicion === 'nuevo') {
      await crearAdicion(datos)
    } else {
      await actualizarAdicion(adicionEnEdicion.id, datos)
    }
    setAdicionEnEdicion(null)
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
        <p className="texto-suave">
          Las adiciones son generales: al pedir cualquier producto, el cliente puede agregar (opcionalmente)
          cualquiera de estas adiciones, cada una con su propio precio.
        </p>

        <button type="button" className="admin-crear admin-crear--boton" onClick={() => setAdicionEnEdicion('nuevo')}>
          <span className="admin-crear__icono" aria-hidden="true">
            +
          </span>
          Nueva adición
        </button>

        {cargando && <p className="texto-suave">Cargando adiciones…</p>}
        {error && <p className="campo__error">No se pudieron cargar las adiciones.</p>}
        {!cargando && !error && (
          <TablaAdiciones adiciones={adiciones} onEditar={setAdicionEnEdicion} onEliminar={confirmarEliminar} />
        )}
      </main>

      {adicionEnEdicion && (
        <div className="superposicion" role="dialog" aria-modal="true">
          <div className="superposicion__panel">
            <button
              type="button"
              className="superposicion__cerrar-x"
              onClick={() => setAdicionEnEdicion(null)}
              aria-label="Cerrar"
            >
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
