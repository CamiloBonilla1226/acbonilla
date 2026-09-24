import { AdminNav } from '../../components/admin/AdminNav'
import { GestionOpciones } from '../../components/admin/GestionOpciones'

export function Adiciones() {
  return (
    <>
      <AdminNav />
      <main className="contenedor admin-adiciones">
        <h1>Adiciones</h1>
        <p className="texto-suave">
          Las adiciones son generales: cualquier producto del catálogo puede ofrecer cualquiera de estos grupos, no
          hace falta asignarlas producto por producto.
        </p>
        <GestionOpciones />
      </main>
    </>
  )
}
