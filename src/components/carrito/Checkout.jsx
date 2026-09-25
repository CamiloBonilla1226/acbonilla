import { useState } from 'react'
import { usePedidos } from '../../hooks/usePedidos'
import { negocioConfig } from '../../config/negocio.config'
import { construirLinkWhatsApp, construirMensajePedido } from '../../lib/whatsapp'

function validar({ nombre, telefono, direccion }) {
  const errores = {}
  if (!nombre.trim()) errores.nombre = 'Ingresa tu nombre.'
  if (!/^\d{7,15}$/.test(telefono.replace(/\D/g, ''))) errores.telefono = 'Ingresa un teléfono válido.'
  if (!direccion.trim()) errores.direccion = 'Ingresa la dirección de entrega.'
  return errores
}

export function Checkout({ items, total, onPedidoConfirmado }) {
  const { crearPedido } = usePedidos()
  const [datos, setDatos] = useState({ nombre: '', telefono: '', direccion: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(null)

  const actualizarCampo = (campo) => (evento) => {
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const enviarPedido = async (evento) => {
    evento.preventDefault()
    const erroresValidacion = validar(datos)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setEnviando(true)
    setErrorEnvio(null)

    const productosDetalle = items.map((item) => ({
      producto_id: item.productoId,
      nombre: item.nombre,
      variante_elegida: item.varianteNombre,
      cantidad: item.cantidad,
      precio_base: item.precioBase,
      opciones_elegidas: item.opcionesElegidas.map((o) => ({ nombre: o.nombre, precio_extra: o.precio_extra ?? 0 })),
      subtotal: item.subtotal,
    }))

    const { exito, error } = await crearPedido({
      cliente_nombre: datos.nombre.trim(),
      cliente_telefono: datos.telefono.replace(/\D/g, ''),
      direccion: datos.direccion.trim(),
      productos_detalle: productosDetalle,
      total,
    })

    setEnviando(false)

    if (!exito) {
      setErrorEnvio('No se pudo enviar el pedido. Intenta de nuevo en un momento.')
      console.error(error)
      return
    }

    const mensaje = construirMensajePedido({ items, total, cliente: datos })
    const link = construirLinkWhatsApp(negocioConfig.whatsappContacto, mensaje)
    window.open(link, '_blank', 'noreferrer')
    onPedidoConfirmado()
  }

  return (
    <form className="checkout" onSubmit={enviarPedido} noValidate>
      <label className="campo">
        <span>Nombre</span>
        <input type="text" value={datos.nombre} onChange={actualizarCampo('nombre')} maxLength={80} />
        {errores.nombre && <span className="campo__error">{errores.nombre}</span>}
      </label>

      <label className="campo">
        <span>Teléfono</span>
        <input type="tel" value={datos.telefono} onChange={actualizarCampo('telefono')} maxLength={15} />
        {errores.telefono && <span className="campo__error">{errores.telefono}</span>}
      </label>

      <label className="campo">
        <span>Dirección de entrega</span>
        <input type="text" value={datos.direccion} onChange={actualizarCampo('direccion')} maxLength={160} />
        {errores.direccion && <span className="campo__error">{errores.direccion}</span>}
      </label>

      {errorEnvio && <p className="campo__error">{errorEnvio}</p>}

      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar pedido por WhatsApp'}
      </button>
    </form>
  )
}
