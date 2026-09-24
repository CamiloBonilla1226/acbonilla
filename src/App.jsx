import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Inicio } from './pages/Inicio'
import { Carta } from './pages/Carta'
import { CartaFisica } from './pages/CartaFisica'
import { Login } from './pages/admin/Login'
import { Dashboard } from './pages/admin/Dashboard'
import { Productos } from './pages/admin/Productos'
import { Categorias } from './pages/admin/Categorias'
import { Pedidos } from './pages/admin/Pedidos'
import { Usuarios } from './pages/admin/Usuarios'
import { RutaProtegida } from './components/admin/RutaProtegida'
import { negocioConfig } from './config/negocio.config'

// Aplica la marca de este negocio (colores, tipografía) como variables CSS en tiempo de
// ejecución. `negocio.config.js` es la única fuente de verdad de la marca; index.css
// solo define los valores neutros de partida por si este efecto aún no corrió.
function useAplicarMarca() {
  useEffect(() => {
    const raiz = document.documentElement
    const { marca } = negocioConfig
    raiz.style.setProperty('--color-primario', marca.colorPrimario)
    raiz.style.setProperty('--color-secundario', marca.colorSecundario)
    raiz.style.setProperty('--color-acento', marca.colorAcento)
    raiz.style.setProperty('--fuente', marca.fuente)
  }, [])
}

function App() {
  useAplicarMarca()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/carta" element={<Carta />} />
        <Route path="/carta-fisica" element={<CartaFisica />} />

        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <RutaProtegida>
              <Pedidos />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <RutaProtegida soloDueno>
              <Productos />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <RutaProtegida soloDueno>
              <Categorias />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida soloDueno>
              <Usuarios />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
