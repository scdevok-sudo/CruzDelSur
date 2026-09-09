/**
 * Calendario mensual para AdminPage.
 * Muestra los días del mes con colores según las excepciones de disponibilidad:
 * - Día cerrado o feriado → rojo
 * - Horario reducido → amarillo
 * - Sin excepción → normal
 *
 * Props:
 *   excepciones: array de { fecha, tipo, profesional_id, motivo }
 *   onDiaClick: (fecha) => void — abre el modal de excepción pre-llenado
 *   mes: Date — el mes a mostrar (por defecto: mes actual)
 *   onMesChange: (nuevaFecha) => void — para navegar entre meses
 *
 * TODO (Lucas):
 * - Construir el grid con CSS Grid (7 columnas)
 * - Calcular los días del mes y en qué columna empieza
 * - Para cada día, buscar si hay excepción en el array
 * - Aplicar el color correspondiente
 * - Manejar navegación de mes con botones ← →
 */
export function CalendarioMensual({ excepciones = [], onDiaClick, mes, onMesChange }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-4">
      <p className="text-[var(--muted)] text-sm text-center">
        Calendario mensual — pendiente de implementar (Lucas)
      </p>
    </div>
  )
}
