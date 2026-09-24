import { useState } from 'react'

export function GestionCategorias({ categorias, onCrear, onActualizar, onEliminar }) {
  const [nombre, setNombre] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null)
  const [nombreEdicion, setNombreEdicion] = useState('')

  const crear = async (evento) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    const { exito, error: errorCreacion } = await onCrear(nombre.trim())

    setEnviando(false)
    if (!exito) {
      setError('No se pudo crear la categoría.')
      console.error(errorCreacion)
      return
    }
    setNombre('')
  }

  const iniciarEdicion = (categoria) => {
    setCategoriaEnEdicion(categoria.id)
    setNombreEdicion(categoria.nombre)
  }

  const guardarEdicion = async (id) => {
    const nombreLimpio = nombreEdicion.trim()
    if (!nombreLimpio) return
    const { exito } = await onActualizar(id, { nombre: nombreLimpio })
    if (exito) setCategoriaEnEdicion(null)
  }

  const confirmarEliminar = (id) => {
    if (window.confirm('¿Eliminar esta categoría? Los productos asociados no se eliminan, pero quedarán sin categoría.')) {
      onEliminar(id)
    }
  }

  return (
    <div className="gestion-categorias">
      <div className="admin-crear">
        <h2 className="admin-crear__titulo">Nueva categoría</h2>
        <form className="admin-crear__form" onSubmit={crear} noValidate>
          <label className="campo">
            <span>Nombre</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>
          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear categoría'}
          </button>
        </form>
        {error && <p className="campo__error">{error}</p>}
      </div>

      <ul className="lista-categorias-admin">
        {categorias.map((categoria) => (
          <li key={categoria.id} className="tarjeta categoria-admin-item">
            {categoriaEnEdicion === categoria.id ? (
              <input
                className="categoria-admin-item__input"
                value={nombreEdicion}
                onChange={(e) => setNombreEdicion(e.target.value)}
                autoFocus
              />
            ) : (
              <span>{categoria.nombre}</span>
            )}

            <div className="categoria-admin-item__acciones">
              {categoriaEnEdicion === categoria.id ? (
                <>
                  <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => guardarEdicion(categoria.id)}>
                    Guardar
                  </button>
                  <button type="button" className="carrito__quitar" onClick={() => setCategoriaEnEdicion(null)}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => iniciarEdicion(categoria)}>
                    Editar
                  </button>
                  <button type="button" className="carrito__quitar" onClick={() => confirmarEliminar(categoria.id)}>
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
        {categorias.length === 0 && <p className="texto-suave">Todavía no hay categorías.</p>}
      </ul>
    </div>
  )
}
