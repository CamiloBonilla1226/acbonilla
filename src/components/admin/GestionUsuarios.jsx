import { useState } from 'react'

export function GestionUsuarios({ usuarios, onCrear, onEliminar }) {
  const [numero, setNumero] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const crear = async (evento) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    const { exito, error: errorCreacion } = await onCrear(numero, contrasena)

    setEnviando(false)
    if (!exito) {
      setError('No se pudo crear el empleado. Revisa el número y la contraseña.')
      console.error(errorCreacion)
      return
    }
    setNumero('')
    setContrasena('')
  }

  return (
    <div className="gestion-usuarios">
      <ul className="lista-usuarios-admin">
        {usuarios.map((usuario) => (
          <li key={usuario.id} className="tarjeta usuario-admin-item">
            <span>{usuario.numero}</span>
            <span className="texto-suave">{usuario.rol}</span>
            {usuario.rol !== 'dueño' && (
              <button type="button" className="carrito__quitar" onClick={() => onEliminar(usuario.id)}>
                Eliminar
              </button>
            )}
          </li>
        ))}
      </ul>

      <form className="checkout" onSubmit={crear} noValidate>
        <h2>Nuevo empleado</h2>
        <label className="campo">
          <span>Número de teléfono</span>
          <input type="tel" value={numero} onChange={(e) => setNumero(e.target.value)} required />
        </label>
        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <p className="campo__error">{error}</p>}
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear empleado'}
        </button>
      </form>
    </div>
  )
}
