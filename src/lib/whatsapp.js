// Mensajes de WhatsApp del consultorio.
// El envío automático lo hace n8n (Evolution API); acá dejamos los textos
// como fuente única de verdad y el link wa.me de fallback para la UI.

export const WA_NUMBER = import.meta.env.VITE_CONSULTORIO_WA_NUMBER ?? ''

// true cuando hay un número real cargado (no el placeholder de .env.example)
export const WA_CONFIGURADO = /^\d{11,15}$/.test(WA_NUMBER)

// Link wa.me para abrir un chat con el consultorio con un texto prellenado.
export function buildWaLink(texto = '') {
  if (!WA_CONFIGURADO) return null
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`
}

// Confirmación de turno que recibe el paciente.
export function buildConfirmacionMsg({ paciente, profesional, fecha, hora, especialidad, token }) {
  return `¡Hola ${paciente.nombre}! 👋
Tu turno en Cruz del Sur quedó confirmado.

📅 *${fecha}* a las *${hora}*
👩‍⚕️ ${profesional.nombre} ${profesional.apellido}
🦷 ${especialidad}

Código de turno: ${token}

Para cancelar o reprogramar escribinos a este número.`
}

// Aviso que recibe la secretaria cuando entra un turno nuevo.
export function buildAvisoSecretariaMsg({ paciente, profesional, fecha, hora, especialidad }) {
  return `🔔 *Nuevo turno recibido*

Paciente: ${paciente.nombre} ${paciente.apellido}
WhatsApp: ${paciente.telefono}
Obra social: ${paciente.obraSocial || paciente.obra_social || 'Particular'}

📅 ${fecha} · ${hora}
👩‍⚕️ ${profesional ? `${profesional.nombre} ${profesional.apellido}` : 'Sin asignar'}
🦷 ${especialidad}`
}
