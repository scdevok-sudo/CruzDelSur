import { supabase } from './supabase'

// Busca un paciente existente por DNI. Devuelve el registro o null.
export async function buscarPacientePorDni(dni) {
  if (!dni?.trim()) return null
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('dni', dni.trim())
    .maybeSingle()
  if (error) throw error
  return data
}
