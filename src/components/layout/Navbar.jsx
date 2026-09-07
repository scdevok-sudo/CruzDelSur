import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Logo from './Logo'
import { useProfesionales } from '../../hooks/useProfesionales'

const PROFESIONAL_ID_KEY = 'cds_profesional_id'
const ROL_KEY = 'cds_rol'

const links = [
  { to: '/turno', label: 'Turnera' },
  { to: '/secretaria', label: 'Secretaría' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { profesionales } = useProfesionales()

  const handleSelect = (value, e) => {
    if (!value) return
    if (value === 'admin') {
      localStorage.setItem(ROL_KEY, 'admin')
      window.open('/admin', '_blank', 'noopener,noreferrer')
      if (e) e.target.value = ''
      return
    }
    localStorage.setItem(PROFESIONAL_ID_KEY, value)
    navigate('/agenda')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/turno">
          <Logo />
        </NavLink>
        <nav className="flex items-center gap-1 rounded-xl bg-teal-light/60 p-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                  isActive
                    ? 'bg-teal text-cream shadow-sm'
                    : 'text-dark/70 hover:bg-white/70 hover:text-dark'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/agenda"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                isActive
                  ? 'bg-teal text-cream shadow-sm'
                  : 'text-dark/70 hover:bg-white/70 hover:text-dark'
              }`
            }
          >
            Profesional
          </NavLink>
          <label className="relative flex items-center">
            <select
              aria-label="Elegir profesional"
              defaultValue=""
              onChange={(e) => handleSelect(e.target.value, e)}
              className="cursor-pointer appearance-none rounded-lg bg-transparent py-1.5 pl-2 pr-6 text-sm font-medium text-dark/70 hover:bg-white/70 hover:text-dark focus:outline-none"
            >
              <option value="" disabled>
                ▾
              </option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
              <option value="admin">Admin (Flor) ↗</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-1.5 text-dark/40" />
          </label>
        </nav>
      </div>
    </header>
  )
}
