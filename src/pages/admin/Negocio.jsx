import { AdminNav } from '../../components/admin/AdminNav'
import { FormularioNegocio } from '../../components/admin/FormularioNegocio'
import { useNegocioConfig } from '../../hooks/useNegocioConfig'
import { useToast } from '../../hooks/useToast'

export function Negocio() {
  const { config, cargando, error, guardarConfig } = useNegocioConfig()
  const mostrarToast = useToast()

  const guardar = async (cambios) => {
    const resultado = await guardarConfig(cambios)
    if (resultado.exito) {
      mostrarToast('Configuración del negocio actualizada')
    }
    return resultado
  }

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-negocio">
        <h1>Negocio</h1>

        {cargando && <p className="texto-suave">Cargando…</p>}
        {error && <p className="campo__error">No se pudo cargar la configuración del negocio.</p>}
        {!cargando && !error && <FormularioNegocio configuracion={config} onGuardar={guardar} />}
      </main>
    </>
  )
}
