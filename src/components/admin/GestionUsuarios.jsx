import { useState } from 'react'

const ETIQUETA_ROL = {
  dueño: 'Dueño',
  empleado: 'Empleado',
}

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

  const confirmarEliminar = (id) => {
    if (window.confirm('¿Eliminar este usuario? Ya no podrá iniciar sesión en el panel.')) {
      onEliminar(id)
    }
  }

  return (
    <div className="gestion-usuarios">
      <div className="admin-crear">
        <h2 className="admin-crear__titulo">Nuevo empleado</h2>
        <form className="admin-crear__form" onSubmit={crear} noValidate>
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
          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear empleado'}
          </button>
        </form>
        {error && <p className="campo__error">{error}</p>}
      </div>

      <ul className="lista-usuarios-admin">
        {usuarios.map((usuario) => (
          <li key={usuario.id} className="tarjeta usuario-admin-item">
            <div className="usuario-admin-item__info">
              <span className="usuario-admin-item__numero">{usuario.numero}</span>
              <span className={`rol-badge rol-badge--${usuario.rol === 'dueño' ? 'dueno' : 'empleado'}`}>
                {ETIQUETA_ROL[usuario.rol] ?? usuario.rol}
              </span>
            </div>
            {usuario.rol !== 'dueño' && (
              <button type="button" className="carrito__quitar" onClick={() => confirmarEliminar(usuario.id)}>
                Eliminar
              </button>
            )}
          </li>
        ))}
        {usuarios.length === 0 && <p className="texto-suave">Todavía no hay usuarios.</p>}
      </ul>
    </div>
  )
}
