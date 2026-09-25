import { useState } from 'react'

export function FormularioCategoria({ categoriaInicial, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(categoriaInicial?.nombre ?? '')
  const [visibleDomicilios, setVisibleDomicilios] = useState(categoriaInicial?.visible_domicilios ?? true)
  const [visibleCartaFisica, setVisibleCartaFisica] = useState(categoriaInicial?.visible_carta_fisica ?? true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const enviar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)

    const resultado = await onGuardar({
      nombre: nombre.trim(),
      visible_domicilios: visibleDomicilios,
      visible_carta_fisica: visibleCartaFisica,
    })

    setGuardando(false)
    if (resultado && !resultado.exito) {
      setError(resultado.error?.message ?? 'No se pudo guardar la categoría.')
    }
  }

  return (
    <form className="checkout" onSubmit={enviar} noValidate>
      <label className="campo">
        <span>Nombre</span>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} autoFocus />
      </label>

      <label className="campo campo--linea">
        <input
          type="checkbox"
          checked={visibleDomicilios}
          onChange={(e) => setVisibleDomicilios(e.target.checked)}
        />
        <span>Mostrar en carta de domicilios</span>
      </label>

      <label className="campo campo--linea">
        <input
          type="checkbox"
          checked={visibleCartaFisica}
          onChange={(e) => setVisibleCartaFisica(e.target.checked)}
        />
        <span>Mostrar en carta física</span>
      </label>

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
