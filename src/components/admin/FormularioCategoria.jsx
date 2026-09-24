import { useState } from 'react'

export function FormularioCategoria({ categoriaInicial, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(categoriaInicial?.nombre ?? '')
  const [guardando, setGuardando] = useState(false)

  const enviar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    await onGuardar({ nombre: nombre.trim() })
    setGuardando(false)
  }

  return (
    <form className="checkout" onSubmit={enviar} noValidate>
      <label className="campo">
        <span>Nombre</span>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} autoFocus />
      </label>

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
