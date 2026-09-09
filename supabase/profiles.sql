-- Tabla de perfiles de usuario vinculada a Supabase Auth
-- Ejecutar en Supabase SQL Editor después de habilitar Auth

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'profesional')),
  profesional_id UUID REFERENCES profesionales(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura propia"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Trigger: crear perfil automáticamente cuando se crea un usuario en auth.users
-- El rol y profesional_id se deben completar manualmente o via script
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, rol)
  VALUES (NEW.id, 'profesional'); -- rol por defecto, cambiar manualmente si es admin
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant
GRANT SELECT ON profiles TO anon, authenticated;
