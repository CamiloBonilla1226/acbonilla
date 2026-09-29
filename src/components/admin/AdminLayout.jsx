import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

// Marca el <body> con la clase `admin` mientras se está en el panel: el tema del admin
// (index.css, sección "Tema del panel admin") se aplica solo a `body.admin`, y va en el
// body y no en un div envolvente porque los modales y confirmaciones también deben verse
// con el tema del admin sin importar dónde se monten.
export function AdminLayout() {
  useEffect(() => {
    document.body.classList.add('admin')
    return () => document.body.classList.remove('admin')
  }, [])

  return <Outlet />
}
