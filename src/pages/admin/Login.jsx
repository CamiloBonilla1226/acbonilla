import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Login() {
  const { autenticado, cargando, iniciarSesion, error } = useAuth()
  const navigate = useNavigate()
  const [numero, setNumero] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (cargando) return null
  if (autenticado) return <Navigate to="/admin" replace />

  const enviar = async (evento) => {
    evento.preventDefault()
    setEnviando(true)
    const { exito } = await iniciarSesion(numero, contrasena)
    setEnviando(false)
    if (exito) navigate('/admin')
  }

  return (
    <main className="contenedor admin-login">
      <h1>Panel administrativo</h1>
      <form className="checkout" onSubmit={enviar} noValidate>
        <label className="campo">
          <span>Número de teléfono</span>
          <input
            type="tel"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="campo__error">{error}</p>}
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}
