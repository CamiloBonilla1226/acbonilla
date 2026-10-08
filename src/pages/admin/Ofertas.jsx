import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaOfertas } from '../../components/admin/TablaOfertas'
import { FormularioOferta } from '../../components/admin/FormularioOferta'
import { FormularioDomicilioGratis } from '../../components/admin/FormularioDomicilioGratis'
import { useOfertas } from '../../hooks/useOfertas'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../../lib/superposicion'
import { useToast } from '../../hooks/useToast'
import { useConfirmacion } from '../../hooks/useConfirmacion'
import { mensajeAmigablePostgres } from '../../lib/erroresAmigables'

// Modal abierto: 'nueva', 'domicilio' o una oferta del dueño (editar).
export function Ofertas() {
  const {
    ofertaDomicilio,
    otrasOfertas,
    cargando,
    error,
    crearOferta,
    actualizarOferta,
    configurarDomicilio,
    eliminarOferta,
    cambiarActiva,
    ponerEnInicio,
  } = useOfertas()

  const [modal, setModal] = useState(null)
  const cerrarModal = () => setModal(null)
  const swipe = useSwipeParaCerrar(cerrarModal)
  const mostrarToast = useToast()
  const confirmar = useConfirmacion()

  const avisar = (resultado, exito, mensajeError) =>
    mostrarToast(
      resultado.exito ? exito : mensajeAmigablePostgres(resultado.error, mensajeError),
      resultado.exito ? 'exito' : 'error'
    )

  const guardarOferta = async (datos) => {
    const esNueva = modal === 'nueva'
    const resultado = esNueva ? await crearOferta(datos) : await actualizarOferta(modal.id, datos)
    if (resultado.exito) {
      setModal(null)
      mostrarToast(esNueva ? 'Oferta creada' : 'Oferta actualizada')
    }
    return resultado
  }

  const guardarDomicilio = async (monto) => {
    const resultado = await configurarDomicilio(ofertaDomicilio.id, monto)
    if (resultado.exito) {
      setModal(null)
      mostrarToast('Monto del domicilio gratis actualizado')
    }
    return resultado
  }

  const confirmarEliminar = async (oferta) => {
    const aviso = oferta.en_inicio ? ' Es la que se muestra en Inicio: la tarjeta dejará de verse.' : ''
    const confirmado = await confirmar(`¿Eliminar la oferta "${oferta.titulo}"?${aviso}`)
    if (!confirmado) return
    avisar(await eliminarOferta(oferta.id), 'Oferta eliminada', 'No se pudo eliminar la oferta.')
  }

  const acciones = {
    onCambiarActiva: async (id, valor) =>
      avisar(await cambiarActiva(id, valor), valor ? 'Oferta activada' : 'Oferta desactivada', 'No se pudo cambiar la oferta.'),
    onPonerEnInicio: async (id) =>
      avisar(await ponerEnInicio(id), 'Ahora se muestra en Inicio', 'No se pudo cambiar la oferta de Inicio.'),
  }

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-ofertas">
        <h1>Ofertas</h1>
        <p className="texto-suave admin-ofertas__ayuda">
          Puedes tener varias ofertas activas al mismo tiempo; en la carta, Inicio muestra solo la marcada con ★.
        </p>

        {cargando && <p className="texto-suave">Cargando ofertas…</p>}
        {error && <p className="campo__error">No se pudieron cargar las ofertas.</p>}
        {!cargando && !error && (
          <>
            <section className="admin-ofertas__grupo">
              <h2 className="admin-ofertas__titulo">Domicilio gratis</h2>
              <TablaOfertas
                ofertas={ofertaDomicilio ? [ofertaDomicilio] : []}
                fija
                detalle="Toca para cambiar el monto"
                vacio="Preparando la oferta de domicilio gratis…"
                onEditar={() => setModal('domicilio')}
                {...acciones}
              />
            </section>

            <section className="admin-ofertas__grupo">
              <h2 className="admin-ofertas__titulo">Tus ofertas</h2>
              <button type="button" className="admin-crear admin-crear--boton" onClick={() => setModal('nueva')}>
                <span className="admin-crear__icono" aria-hidden="true">
                  +
                </span>
                Nueva oferta
              </button>
              <TablaOfertas
                ofertas={otrasOfertas}
                vacio="Todavía no has creado ofertas. Solo necesitan un título y una descripción."
                onEditar={setModal}
                onEliminar={confirmarEliminar}
                {...acciones}
              />
            </section>
          </>
        )}
      </main>

      {modal && (
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
            {modal === 'domicilio' ? (
              <>
                <h2>Domicilio gratis</h2>
                <FormularioDomicilioGratis oferta={ofertaDomicilio} onGuardar={guardarDomicilio} onCancelar={cerrarModal} />
              </>
            ) : (
              <>
                <h2>{modal === 'nueva' ? 'Nueva oferta' : 'Editar oferta'}</h2>
                <FormularioOferta
                  ofertaInicial={modal === 'nueva' ? null : modal}
                  onGuardar={guardarOferta}
                  onCancelar={cerrarModal}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
