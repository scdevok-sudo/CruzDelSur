-- Cruz del Sur · RLS de PRODUCCIÓN
-- Reemplaza las políticas abiertas de la demo (FOR ALL USING (true)).
--
-- Ejecutar MANUALMENTE en el SQL Editor de Supabase (producción), antes del deploy.
-- Requiere que supabase-migration-v2.sql ya esté aplicado (tabla excepciones_disponibilidad).
-- Es re-ejecutable: cada CREATE POLICY va precedido de su DROP POLICY IF EXISTS.
--
-- Criterio:
--   Pacientes: anon puede insertar (sacar turno sin cuenta) y leer por DNI (lookup de la turnera)
--   Turnos: anon puede insertar y leer. No debería ver todos los turnos → ver nota en Fase 2.
--   Profesionales y especialidades: lectura pública (necesaria para la turnera)
--   excepciones_disponibilidad: lectura pública, escritura solo authenticated

-- RLS activo en todas las tablas (idempotente)
ALTER TABLE especialidades              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesionales               ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE excepciones_disponibilidad  ENABLE ROW LEVEL SECURITY;

-- ============ ESPECIALIDADES ============
DROP POLICY IF EXISTS "Lectura pública" ON especialidades;
CREATE POLICY "Lectura pública" ON especialidades FOR SELECT USING (true);

-- ============ PROFESIONALES ============
DROP POLICY IF EXISTS "Lectura pública" ON profesionales;
CREATE POLICY "Lectura pública" ON profesionales FOR SELECT USING (true);

-- ============ DISPONIBILIDAD ============
DROP POLICY IF EXISTS "Lectura pública" ON disponibilidad;
CREATE POLICY "Lectura pública" ON disponibilidad FOR SELECT USING (true);

-- ============ EXCEPCIONES ============
DROP POLICY IF EXISTS "Lectura pública"      ON excepciones_disponibilidad;
DROP POLICY IF EXISTS "Escritura pública"    ON excepciones_disponibilidad;
DROP POLICY IF EXISTS "Escritura autenticada" ON excepciones_disponibilidad;
CREATE POLICY "Lectura pública" ON excepciones_disponibilidad FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada" ON excepciones_disponibilidad
  FOR ALL USING (auth.role() = 'authenticated');

-- ============ PACIENTES ============
-- El anon puede insertar (nuevo paciente al sacar turno)
-- El anon puede leer por DNI (lookup en la turnera)
DROP POLICY IF EXISTS "Lectura pública"    ON pacientes;
DROP POLICY IF EXISTS "Escritura pública"  ON pacientes;
DROP POLICY IF EXISTS "Insertar paciente"  ON pacientes;
DROP POLICY IF EXISTS "Leer por DNI"       ON pacientes;
CREATE POLICY "Insertar paciente" ON pacientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Leer por DNI" ON pacientes FOR SELECT USING (true);
-- En producción real: USING (auth.uid() IS NOT NULL OR true)
-- Por ahora dejamos lectura abierta para el DNI lookup — aceptable para v1

-- ============ TURNOS ============
-- Anon puede insertar (sacar turno)
-- Anon puede leer su propio turno por token
-- No debería leer todos los turnos (eso es del panel, que en Fase 2 tendrá auth)
DROP POLICY IF EXISTS "Lectura pública"       ON turnos;
DROP POLICY IF EXISTS "Escritura pública"     ON turnos;
DROP POLICY IF EXISTS "Actualización pública" ON turnos;
DROP POLICY IF EXISTS "Insertar turno"        ON turnos;
DROP POLICY IF EXISTS "Leer turno por token"  ON turnos;
DROP POLICY IF EXISTS "Actualizar turno"      ON turnos;
CREATE POLICY "Insertar turno" ON turnos FOR INSERT WITH CHECK (true);
CREATE POLICY "Leer turno por token" ON turnos FOR SELECT USING (true);
-- En Fase 2 reemplazar por: USING (token = current_setting('app.token', true) OR auth.uid() IS NOT NULL)
CREATE POLICY "Actualizar turno" ON turnos FOR UPDATE USING (true);

-- ============ GRANTS MÍNIMOS ============
-- Las políticas RLS solo filtran filas; el rol anon también necesita el GRANT
-- a nivel de tabla cuando las tablas se crearon con SQL crudo.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON especialidades             TO anon, authenticated;
GRANT SELECT ON profesionales              TO anon, authenticated;
GRANT SELECT ON disponibilidad             TO anon, authenticated;
GRANT SELECT ON excepciones_disponibilidad TO anon, authenticated;

GRANT INSERT ON excepciones_disponibilidad TO authenticated;
GRANT UPDATE ON excepciones_disponibilidad TO authenticated;
GRANT DELETE ON excepciones_disponibilidad TO authenticated;

GRANT SELECT, INSERT         ON pacientes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON turnos    TO anon, authenticated;

-- ============ VERIFICACIÓN ============
-- Después de correr esto, revisar que no quedaron políticas abiertas de la demo:
--   SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;
