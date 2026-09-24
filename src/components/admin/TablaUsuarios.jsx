export function TablaUsuarios({ usuarios, onEliminar }) {
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
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td data-etiqueta="Nombre">{usuario.nombre}</td>
              <td data-etiqueta="Celular">{usuario.numero}</td>
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
