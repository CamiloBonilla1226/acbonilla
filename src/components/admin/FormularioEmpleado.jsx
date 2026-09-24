import { useState } from 'react'

export function FormularioEmpleado({ onGuardar, onCancelar }) {
  const [numero, setNumero] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const enviar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)

    const { exito, error: errorCreacion } = await onGuardar(numero, contrasena)

    setGuardando(false)
    if (!exito) {
      setError('No se pudo crear el empleado. Revisa el número y la contraseña.')
      console.error(errorCreacion)
    }
  }

  return (
    <form className="checkout" onSubmit={enviar} noValidate>
      <label className="campo">
        <span>Usuario (número de teléfono)</span>
        <input type="tel" value={numero} onChange={(e) => setNumero(e.target.value)} required autoFocus />
      </label>

      <label className="campo">
        <span>Contraseña</span>
        <div className="campo-contrasena">
          <input
            type={mostrarContrasena ? 'text' : 'password'}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            minLength={6}
            required
          />
          <button
            type="button"
            className="campo-contrasena__alternar"
            onClick={() => setMostrarContrasena((actual) => !actual)}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {mostrarContrasena ? '🙈' : '👁️'}
          </button>
        </div>
      </label>

      {error && <p className="campo__error">{error}</p>}

      <div className="opciones-producto__acciones">
        <button type="button" className="boton boton--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Creando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
