import { useState } from 'react'
import { useAdiciones } from '../../hooks/useAdiciones'

const GRUPO_VACIO = { nombre: '', obligatorio: false, seleccion: 'unica' }
const OPCION_VACIA = { nombre: '', precio_extra: 0 }

export function GestionOpciones() {
  const { grupos, cargando, crearGrupo, eliminarGrupo, crearOpcion, eliminarOpcion } = useAdiciones()
  const [nuevoGrupo, setNuevoGrupo] = useState(GRUPO_VACIO)
  const [nuevaOpcion, setNuevaOpcion] = useState({})

  const agregarGrupo = async (evento) => {
    evento.preventDefault()
    if (!nuevoGrupo.nombre.trim()) return
    await crearGrupo(nuevoGrupo)
    setNuevoGrupo(GRUPO_VACIO)
  }

  const agregarOpcion = async (evento, grupoId) => {
    evento.preventDefault()
    const opcion = nuevaOpcion[grupoId] ?? OPCION_VACIA
    if (!opcion.nombre?.trim()) return
    await crearOpcion(grupoId, { nombre: opcion.nombre.trim(), precio_extra: Number(opcion.precio_extra) || 0 })
    setNuevaOpcion((actual) => ({ ...actual, [grupoId]: OPCION_VACIA }))
  }

  if (cargando) return <p className="texto-suave">Cargando adiciones…</p>

  return (
    <div className="gestion-opciones">
      {grupos.map((grupo) => (
        <div key={grupo.id} className="tarjeta gestion-opciones__grupo">
          <div className="gestion-opciones__grupo-encabezado">
            <strong>{grupo.nombre}</strong>
            <span className="texto-suave">
              {grupo.seleccion === 'unica' ? 'Selección única' : 'Selección múltiple'}
              {grupo.obligatorio ? ' · obligatorio' : ''}
            </span>
            <button type="button" className="carrito__quitar" onClick={() => eliminarGrupo(grupo.id)}>
              Eliminar grupo
            </button>
          </div>

          <ul className="gestion-opciones__lista">
            {(grupo.opciones ?? []).map((opcion) => (
              <li key={opcion.id}>
                {opcion.nombre} {opcion.precio_extra > 0 && `(+${opcion.precio_extra})`}
                <button type="button" className="carrito__quitar" onClick={() => eliminarOpcion(opcion.id)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          <form className="gestion-opciones__form-opcion" onSubmit={(e) => agregarOpcion(e, grupo.id)}>
            <input
              type="text"
              placeholder="Nombre de la opción"
              value={nuevaOpcion[grupo.id]?.nombre ?? ''}
              onChange={(e) =>
                setNuevaOpcion((actual) => ({
                  ...actual,
                  [grupo.id]: { ...(actual[grupo.id] ?? OPCION_VACIA), nombre: e.target.value },
                }))
              }
            />
            <input
              type="number"
              min="0"
              placeholder="Precio extra"
              value={nuevaOpcion[grupo.id]?.precio_extra ?? ''}
              onChange={(e) =>
                setNuevaOpcion((actual) => ({
                  ...actual,
                  [grupo.id]: { ...(actual[grupo.id] ?? OPCION_VACIA), precio_extra: e.target.value },
                }))
              }
            />
            <button type="submit" className="boton boton--pequeno">
              Agregar opción
            </button>
          </form>
        </div>
      ))}

      <form className="gestion-opciones__form-grupo" onSubmit={agregarGrupo}>
        <input
          type="text"
          placeholder="Nombre del grupo (ej. Adiciones)"
          value={nuevoGrupo.nombre}
          onChange={(e) => setNuevoGrupo((actual) => ({ ...actual, nombre: e.target.value }))}
        />
        <select
          value={nuevoGrupo.seleccion}
          onChange={(e) => setNuevoGrupo((actual) => ({ ...actual, seleccion: e.target.value }))}
        >
          <option value="unica">Selección única</option>
          <option value="multiple">Selección múltiple</option>
        </select>
        <label className="campo campo--linea">
          <input
            type="checkbox"
            checked={nuevoGrupo.obligatorio}
            onChange={(e) => setNuevoGrupo((actual) => ({ ...actual, obligatorio: e.target.checked }))}
          />
          <span>Obligatorio</span>
        </label>
        <button type="submit" className="boton boton--pequeno">
          Agregar grupo
        </button>
      </form>
    </div>
  )
}
