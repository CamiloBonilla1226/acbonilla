import { Interruptor } from './Interruptor'

export function TablaUsuarios({ usuarios, onEliminar, onToggleActivo, onTogglePermiso }) {
  if (usuarios.length === 0) {
    return <p className="texto-suave">Todavía no hay usuarios. Crea el primero.</p>
  }

  return (
    <div className="tabla-usuarios-admin__contenedor">
      <table className="tabla-usuarios-admin">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Celular</th>
            <th>Activo</th>
            <th>Productos</th>
            <th>Categorías</th>
            <th>Adiciones</th>
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td data-etiqueta="Nombre">{usuario.nombre}</td>
              <td data-etiqueta="Celular">{usuario.numero}</td>
              <td data-etiqueta="Activo">
                <Interruptor
                  activo={usuario.activo}
                  etiqueta=""
                  onCambiar={(valor) => onToggleActivo(usuario.id, valor)}
                />
              </td>
              <td data-etiqueta="Productos">
                <Interruptor
                  activo={usuario.puede_productos}
                  etiqueta=""
                  onCambiar={(valor) => onTogglePermiso(usuario.id, 'puede_productos', valor)}
                />
              </td>
              <td data-etiqueta="Categorías">
                <Interruptor
                  activo={usuario.puede_categorias}
                  etiqueta=""
                  onCambiar={(valor) => onTogglePermiso(usuario.id, 'puede_categorias', valor)}
                />
              </td>
              <td data-etiqueta="Adiciones">
                <Interruptor
                  activo={usuario.puede_adiciones}
                  etiqueta=""
                  onCambiar={(valor) => onTogglePermiso(usuario.id, 'puede_adiciones', valor)}
                />
              </td>
              <td data-etiqueta="Acciones" className="tabla-usuarios-admin__acciones">
                <button type="button" className="carrito__quitar" onClick={() => onEliminar(usuario.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
