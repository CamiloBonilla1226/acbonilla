import { useState } from 'react'
import { Interruptor } from './Interruptor'
import { TarjetaOferta } from '../layout/TarjetaOferta'
import { TIPOS_OFERTA } from '../../lib/tiposOferta'
import { OFERTA_SUBTITULO_MAX, OFERTA_TITULO_MAX } from '../../hooks/useOfertas'
import { mensajeAmigablePostgres } from '../../lib/erroresAmigables'

// Crear/editar una oferta: título y subtítulo (con vista previa de la tarjeta de Inicio tal
// cual la verá el cliente), tipo de oferta y, si el tipo lo pide, sus parámetros (ej. la
// compra mínima del domicilio gratis). Los tipos y sus campos vienen de lib/tiposOferta.js.
export function FormularioOferta({ ofertaInicial, onGuardar, onCancelar }) {
  const [valores, setValores] = useState({
    titulo: ofertaInicial?.titulo ?? '',
    subtitulo: ofertaInicial?.subtitulo ?? '',
    tipo: ofertaInicial?.tipo ?? 'informativa',
    configuracion: ofertaInicial?.configuracion ?? {},
    activa: ofertaInicial?.activa ?? true,
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const tipo = TIPOS_OFERTA[valores.tipo] ?? TIPOS_OFERTA.informativa

  const actualizar = (campo) => (evento) => setValores((actual) => ({ ...actual, [campo]: evento.target.value }))
  const actualizarParametro = (clave) => (evento) =>
    setValores((actual) => ({ ...actual, configuracion: { ...actual.configuracion, [clave]: evento.target.value } }))

  const enviar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)

    // Solo se guardan los parámetros del tipo elegido (si se cambió de tipo, los del anterior
    // no quedan colgados en la base de datos), y los de dinero como número.
    const configuracion = Object.fromEntries(
      tipo.campos.map((campo) => [
        campo.clave,
        campo.tipo === 'dinero' ? Number(valores.configuracion[campo.clave]) || 0 : valores.configuracion[campo.clave],
      ])
    )

    const resultado = await onGuardar({ ...valores, configuracion })
    setGuardando(false)
    if (resultado && !resultado.exito) {
      setError(mensajeAmigablePostgres(resultado.error, 'No se pudo guardar la oferta.'))
    }
  }

  return (
    <form className="checkout formulario-oferta" onSubmit={enviar} noValidate>
      <div className="formulario-oferta__vista-previa">
        <span className="formulario-oferta__rotulo">Así se verá en Inicio</span>
        {valores.titulo.trim() ? (
          <TarjetaOferta oferta={valores} />
        ) : (
          <p className="texto-suave formulario-oferta__vacia">Escribe un título para ver la tarjeta.</p>
        )}
      </div>

      <label className="campo">
        <span>
          Título{' '}
          <em className="negocio-seccion__contador">
            {valores.titulo.length}/{OFERTA_TITULO_MAX}
          </em>
        </span>
        <input
          type="text"
          value={valores.titulo}
          onChange={actualizar('titulo')}
          maxLength={OFERTA_TITULO_MAX}
          placeholder="Ej. Domicilio gratis este fin de semana"
          required
        />
      </label>

      <label className="campo">
        <span>
          Subtítulo (opcional){' '}
          <em className="negocio-seccion__contador">
            {valores.subtitulo.length}/{OFERTA_SUBTITULO_MAX}
          </em>
        </span>
        <input
          type="text"
          value={valores.subtitulo}
          onChange={actualizar('subtitulo')}
          maxLength={OFERTA_SUBTITULO_MAX}
          placeholder="Ej. Compras desde $70.000"
        />
      </label>

      <label className="campo">
        <span>Tipo de oferta</span>
        <select value={valores.tipo} onChange={actualizar('tipo')}>
          {Object.entries(TIPOS_OFERTA).map(([clave, definicion]) => (
            <option key={clave} value={clave}>
              {definicion.etiqueta}
            </option>
          ))}
        </select>
        <span className="texto-suave formulario-oferta__ayuda">{tipo.descripcion}</span>
      </label>

      {tipo.campos.map((campo) => (
        <label key={campo.clave} className="campo">
          <span>{campo.etiqueta}</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={valores.configuracion[campo.clave] ?? ''}
            onChange={actualizarParametro(campo.clave)}
            placeholder="Ej. 70000"
          />
        </label>
      ))}

      {!ofertaInicial && (
        <Interruptor
          activo={valores.activa}
          etiqueta={valores.activa ? 'Activa al crearla' : 'Guardar como inactiva'}
          onCambiar={(activa) => setValores((actual) => ({ ...actual, activa }))}
        />
      )}

      {error && <p className="campo__error">{error}</p>}

      <div className="opciones-producto__acciones">
        <button type="button" className="boton boton--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
