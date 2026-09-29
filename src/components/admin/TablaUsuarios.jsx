import { useState } from 'react'
import { Interruptor } from './Interruptor'

function TarjetaUsuario({ usuario, onEliminar, onToggleActivo, onTogglePermiso }) {
  const [abierta, setAbierta] = useState(false)

  return (
    <li className="tarjeta usuario-admin-item">
      <button
        type="button"
        className="usuario-admin-item__encabezado"
        onClick={() => setAbierta((actual) => !actual)}
        aria-expanded={abierta}
      >
        <span className="usuario-admin-item__resumen">
          <span className="usuario-admin-item__nombre">{usuario.nombre}</span>
          <span className="texto-suave">{usuario.numero}</span>
        </span>
        <span className={`usuario-admin-item__flecha${abierta ? ' usuario-admin-item__flecha--abierta' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {abierta && (
        <div className="usuario-admin-item__detalle">
          <div className="usuario-admin-item__fila">
            <span>Activo</span>
            <Interruptor activo={usuario.activo} etiqueta="" onCambiar={(valor) => onToggleActivo(usuario.id, valor)} />
          </div>
          <div className="usuario-admin-item__fila">
            <span>Puede gestionar productos</span>
            <Interruptor
              activo={usuario.puede_productos}
              etiqueta=""
              onCambiar={(valor) => onTogglePermiso(usuario.id, 'puede_productos', valor)}
            />
          </div>
          <div className="usuario-admin-item__fila">
            <span>Puede gestionar categorías</span>
            <Interruptor
              activo={usuario.puede_categorias}
              etiqueta=""
              onCambiar={(valor) => onTogglePermiso(usuario.id, 'puede_categorias', valor)}
            />
          </div>
          <div className="usuario-admin-item__fila">
            <span>Puede gestionar adiciones</span>
            <Interruptor
              activo={usuario.puede_adiciones}
              etiqueta=""
              onCambiar={(valor) => onTogglePermiso(usuario.id, 'puede_adiciones', valor)}
            />
          </div>
          <button type="button" className="carrito__quitar" onClick={() => onEliminar(usuario.id)}>
            Eliminar
          </button>
        </div>
      )}
    </li>
  )
}

export function TablaUsuarios({ usuarios, onEliminar, onToggleActivo, onTogglePermiso }) {
  if (usuarios.length === 0) {
    return <p className="texto-suave">Todavía no hay usuarios. Crea el primero.</p>
  }

  return (
    <ul className="lista-usuarios-admin">
      {usuarios.map((usuario) => (
        <TarjetaUsuario
          key={usuario.id}
          usuario={usuario}
          onEliminar={onEliminar}
          onToggleActivo={onToggleActivo}
          onTogglePermiso={onTogglePermiso}
        />
      ))}
    </ul>
  )
}
