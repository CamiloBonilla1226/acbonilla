// Secciones del panel admin en el orden del menú lateral (AdminNav) y del swipe entre
// secciones (AdminLayout). Única fuente de verdad: agregar una sección aquí la suma a los
// dos lados. `visible` recibe lo que devuelve useAuth() y replica las mismas restricciones
// que RutaProtegida en App.jsx.
const SECCIONES = [
  { ruta: '/admin', etiqueta: 'Inicio', visible: () => true },
  { ruta: '/admin/pedidos', etiqueta: 'Pedidos', visible: () => true },
  { ruta: '/admin/productos', etiqueta: 'Productos', visible: (auth) => auth.puedeProductos },
  { ruta: '/admin/categorias', etiqueta: 'Categorías', visible: (auth) => auth.puedeCategorias },
  { ruta: '/admin/adiciones', etiqueta: 'Adiciones', visible: (auth) => auth.puedeAdiciones },
  { ruta: '/admin/usuarios', etiqueta: 'Usuarios', visible: (auth) => auth.esDueno },
  { ruta: '/admin/negocio', etiqueta: 'Negocio', visible: (auth) => auth.esDueno },
]

export function seccionesAdminVisibles(auth) {
  return SECCIONES.filter((seccion) => seccion.visible(auth))
}
