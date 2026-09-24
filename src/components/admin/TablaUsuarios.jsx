const ETIQUETA_ROL = {
  dueño: 'Dueño',
  empleado: 'Empleado',
}

export function TablaUsuarios({ usuarios, onEliminar }) {
  if (usuarios.length === 0) {
    return <p className="texto-suave">Todavía no hay usuarios. Crea el primero.</p>
  }

  return (
    <ul className="lista-usuarios-admin">
      {usuarios.map((usuario) => (
        <li key={usuario.id} className="tarjeta usuario-admin-item">
          <div className="usuario-admin-item__info">
            <strong>{usuario.nombre}</strong>
            <div className="usuario-admin-item__detalle">
              <span className="usuario-admin-item__numero">{usuario.numero}</span>
              <span className={`rol-badge rol-badge--${usuario.rol === 'dueño' ? 'dueno' : 'empleado'}`}>
                {ETIQUETA_ROL[usuario.rol] ?? usuario.rol}
              </span>
            </div>
          </div>
          {usuario.rol !== 'dueño' && (
            <button type="button" className="carrito__quitar" onClick={() => onEliminar(usuario.id)}>
              Eliminar
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
