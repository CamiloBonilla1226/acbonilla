import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaOfertas } from '../../components/admin/TablaOfertas'
import { FormularioOferta } from '../../components/admin/FormularioOferta'
import { useOfertas } from '../../hooks/useOfertas'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../../lib/superposicion'
import { useToast } from '../../hooks/useToast'
import { useConfirmacion } from '../../hooks/useConfirmacion'
import { mensajeAmigablePostgres } from '../../lib/erroresAmigables'

export function Ofertas() {
  const { ofertas, cargando, error, crearOferta, actualizarOferta, eliminarOferta, cambiarActiva, ponerEnInicio } =
    useOfertas()

  const [ofertaEnEdicion, setOfertaEnEdicion] = useState(null) // objeto o 'nueva'
  const cerrarModal = () => setOfertaEnEdicion(null)
  const swipe = useSwipeParaCerrar(cerrarModal)
  const mostrarToast = useToast()
  const confirmar = useConfirmacion()

  const avisar = (resultado, exito, error) =>
    mostrarToast(
      resultado.exito ? exito : mensajeAmigablePostgres(resultado.error, error),
      resultado.exito ? 'exito' : 'error'
    )

  const guardarOferta = async (datos) => {
    const esNueva = ofertaEnEdicion === 'nueva'
    const resultado = esNueva ? await crearOferta(datos) : await actualizarOferta(ofertaEnEdicion.id, datos)
    if (resultado.exito) {
      setOfertaEnEdicion(null)
      mostrarToast(esNueva ? 'Oferta creada' : 'Oferta actualizada')
    }
    return resultado
  }

  const confirmarEliminar = async (oferta) => {
    const aviso = oferta.en_inicio ? ' Es la que se muestra en Inicio: la tarjeta dejará de verse.' : ''
    const confirmado = await confirmar(`¿Eliminar la oferta "${oferta.titulo}"?${aviso}`)
    if (!confirmado) return
    avisar(await eliminarOferta(oferta.id), 'Oferta eliminada', 'No se pudo eliminar la oferta.')
  }

  const alternarActiva = async (id, valor) => {
    avisar(await cambiarActiva(id, valor), valor ? 'Oferta activada' : 'Oferta desactivada', 'No se pudo cambiar la oferta.')
  }

  const mostrarEnInicio = async (id) => {
    avisar(await ponerEnInicio(id), 'Ahora se muestra en Inicio', 'No se pudo cambiar la oferta de Inicio.')
  }

  const activas = ofertas.filter((oferta) => oferta.activa).length

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-ofertas">
        <h1>Ofertas</h1>
        <p className="texto-suave admin-ofertas__ayuda">
          Puedes tener varias ofertas activas al mismo tiempo; en la carta, Inicio muestra solo la marcada con ★.
        </p>

        <button type="button" className="admin-crear admin-crear--boton" onClick={() => setOfertaEnEdicion('nueva')}>
          <span className="admin-crear__icono" aria-hidden="true">
            +
          </span>
          Nueva oferta
        </button>

        {cargando && <p className="texto-suave">Cargando ofertas…</p>}
        {error && <p className="campo__error">No se pudieron cargar las ofertas.</p>}
        {!cargando && !error && (
          <>
            {ofertas.length > 0 && (
              <p className="texto-suave admin-ofertas__resumen">
                {ofertas.length} oferta{ofertas.length === 1 ? '' : 's'} · {activas} activa{activas === 1 ? '' : 's'}
              </p>
            )}
            <TablaOfertas
              ofertas={ofertas}
              onEditar={setOfertaEnEdicion}
              onEliminar={confirmarEliminar}
              onCambiarActiva={alternarActiva}
              onPonerEnInicio={mostrarEnInicio}
            />
          </>
        )}
      </main>

      {ofertaEnEdicion && (
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
            <h2>{ofertaEnEdicion === 'nueva' ? 'Nueva oferta' : 'Editar oferta'}</h2>
            <FormularioOferta
              ofertaInicial={ofertaEnEdicion === 'nueva' ? null : ofertaEnEdicion}
              onGuardar={guardarOferta}
              onCancelar={cerrarModal}
            />
          </div>
        </div>
      )}
    </>
  )
}
