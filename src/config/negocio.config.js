// Configuración específica de este negocio/cliente.
// Al clonar este proyecto base para un negocio nuevo, este es el único archivo
// que debe actualizarse con los datos reales antes de personalizar el diseño.

// UUID de ejemplo original de este archivo. Se exporta para que supabaseClient.js pueda
// advertir si negocioId no se reemplazó: un negocioId placeholder produce un correo interno
// (ver lib/phoneAuth.js) que no coincide con ningún usuario real, y el login falla con un
// 400 "Bad Request" que parece un problema de credenciales pero es un desajuste de config
// (ver CHANGELOG.md, lección aprendida del 2026-09-24).
export const NEGOCIO_ID_EJEMPLO = '00000000-0000-0000-0000-000000000000'

export const negocioConfig = {
  // ID del negocio en Supabase (columna `negocios.id`). Reemplazar por el real.
 negocioId: '8ea9a00c-f4aa-4360-b74a-2ccac581a8c7',
  nombre: 'Nombre del negocio',

  // Número de WhatsApp del negocio, en formato internacional sin signos (ej. 573001234567).
  // Se usa para armar el link wa.me del checkout.
  whatsappContacto: '573000000000',

  // Paleta neutra de partida para el proyecto base. Cada negocio, al personalizarse,
  // reemplaza estos valores por su propia identidad (ver brief, sección 3).
  marca: {
    colorPrimario: '#111111',
    colorSecundario: '#f5f5f5',
    colorAcento: '#111111',
    fuente: 'system-ui, sans-serif',
  },
}
