-- =====================================================
-- RLS FASE 2: Políticas definitivas basadas en auth.uid()
-- =====================================================

-- 1. Asegurar que RLS esté activado en ambas tablas
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- 2. Funciones auxiliares seguras para evitar recursión en profiles
CREATE OR REPLACE FUNCTION public.get_user_rol()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT rol FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_profesional_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT profesional_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Limpieza de políticas previas
DROP POLICY IF EXISTS "Lectura pública" ON public.turnos;
DROP POLICY IF EXISTS "Escritura pública" ON public.turnos;
DROP POLICY IF EXISTS "Actualización pública" ON public.turnos;
DROP POLICY IF EXISTS "lectura publica turnos" ON public.turnos;
DROP POLICY IF EXISTS "escritura publica turnos" ON public.turnos;
DROP POLICY IF EXISTS "update publica turnos" ON public.turnos;
DROP POLICY IF EXISTS "turnos_select_policy" ON public.turnos;
DROP POLICY IF EXISTS "turnos_insert_policy" ON public.turnos;
DROP POLICY IF EXISTS "turnos_update_policy" ON public.turnos;
DROP POLICY IF EXISTS "turnos_delete_policy" ON public.turnos;

DROP POLICY IF EXISTS "Lectura pública" ON public.pacientes;
DROP POLICY IF EXISTS "Escritura pública" ON public.pacientes;
DROP POLICY IF EXISTS "escritura publica pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_select_policy" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_insert_policy" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_update_policy" ON public.pacientes;

-- =====================================================
-- POLÍTICAS: turnos
-- =====================================================

CREATE POLICY "turnos_select_policy"
ON public.turnos
FOR SELECT
TO authenticated
USING (
  public.get_user_rol() = 'admin'
  OR
  profesional_id = public.get_user_profesional_id()
);

CREATE POLICY "turnos_insert_policy"
ON public.turnos
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_rol() = 'admin'
  OR
  profesional_id = public.get_user_profesional_id()
);

CREATE POLICY "turnos_update_policy"
ON public.turnos
FOR UPDATE
TO authenticated
USING (
  public.get_user_rol() = 'admin'
  OR
  profesional_id = public.get_user_profesional_id()
)
WITH CHECK (
  public.get_user_rol() = 'admin'
  OR
  profesional_id = public.get_user_profesional_id()
);

CREATE POLICY "turnos_delete_policy"
ON public.turnos
FOR DELETE
TO authenticated
USING (
  public.get_user_rol() = 'admin'
  OR
  profesional_id = public.get_user_profesional_id()
);

-- =====================================================
-- POLÍTICAS: pacientes
-- =====================================================

CREATE POLICY "pacientes_select_policy"
ON public.pacientes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "pacientes_insert_policy"
ON public.pacientes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "pacientes_update_policy"
ON public.pacientes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);