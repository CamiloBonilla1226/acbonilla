import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Login() {
  const { autenticado, cargando, iniciarSesion, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [numero, setNumero] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (cargando) return null
  if (autenticado) return <Navigate to="/admin" replace />

  // RutaProtegida.jsx redirige para acá con esto en el state cuando la sesión era válida
  // para Supabase Auth pero la cuenta ya no existe (o quedó desactivada) en usuarios_admin
  // — ver el comentario ahí y en useAuth.js sobre por qué ese chequeo ya no se hace dentro
  // de iniciarSesion.
  const mensajeCuentaInvalida = location.state?.cuentaInvalida
    ? 'Esta cuenta ya no está disponible. Contacta al dueño del negocio.'
    : null

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
        {(error || mensajeCuentaInvalida) && <p className="campo__error">{error || mensajeCuentaInvalida}</p>}
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}
