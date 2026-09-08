// Validación del formulario de paciente de la turnera.
// Devuelve { campo: mensaje }; objeto vacío = todo OK.

export const soloDigitos = (valor = '') => String(valor).replace(/\D/g, '')

// Nombres y apellidos: letras (con acentos), espacios, apóstrofes y guiones. Sin números.
const NOMBRE_VALIDO = /^[A-Za-zÀ-ÿÑñ'` -]+$/
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarDni(dni) {
  const limpio = soloDigitos(dni)
  if (!limpio) return 'Ingresá tu DNI'
  if (!/^\d{7,8}$/.test(limpio)) return 'DNI inválido (7 u 8 dígitos)'
  return null
}

export function validarPaciente(form = {}) {
  const errores = {}
  const nombre = (form.nombre ?? '').trim()
  const apellido = (form.apellido ?? '').trim()
  const telefono = soloDigitos(form.telefono)
  const email = (form.email ?? '').trim()

  if (nombre.length < 2) errores.nombre = 'Ingresá tu nombre (mínimo 2 letras)'
  else if (!NOMBRE_VALIDO.test(nombre)) errores.nombre = 'El nombre no puede tener números'

  if (apellido.length < 2) errores.apellido = 'Ingresá tu apellido (mínimo 2 letras)'
  else if (!NOMBRE_VALIDO.test(apellido)) errores.apellido = 'El apellido no puede tener números'

  const errorDni = validarDni(form.dni)
  if (errorDni) errores.dni = errorDni

  if (!telefono) errores.telefono = 'Ingresá tu WhatsApp'
  else if (!/^\d{10,11}$/.test(telefono))
    errores.telefono = 'WhatsApp inválido (incluí el código de área sin el 0)'

  if (email && !EMAIL_VALIDO.test(email)) errores.email = 'Email inválido'

  return errores
}

export const esPacienteValido = (form) => Object.keys(validarPaciente(form)).length === 0
